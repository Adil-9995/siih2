
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin','admin','team_leader','evaluator');
CREATE TYPE public.registration_status AS ENUM ('draft','submitted','under_review','payment_pending','payment_verification','verified','rejected','cancelled','suspended');
CREATE TYPE public.payment_status AS ENUM ('pending','under_review','verified','rejected');
CREATE TYPE public.task_status AS ENUM ('draft','scheduled','active','closed','archived');
CREATE TYPE public.priority_level AS ENUM ('normal','important','urgent');

-- HELPERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'));
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "super admin manages roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- PROFILE AUTO CREATE
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  UPDATE public.teams SET leader_user_id = NEW.id
   WHERE lower(leader_email) = lower(NEW.email) AND leader_user_id IS NULL;
  INSERT INTO public.user_roles (user_id, role)
   SELECT NEW.id, 'team_leader'::public.app_role
   WHERE EXISTS (SELECT 1 FROM public.teams WHERE lower(leader_email) = lower(NEW.email))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

-- SETTINGS
CREATE TABLE public.hackathon_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  event_name text NOT NULL DEFAULT 'SIIH 2.0',
  event_subtitle text NOT NULL DEFAULT 'SMART INDIA HACKATHON — INTERNAL HACKATHON 2026',
  tagline text NOT NULL DEFAULT 'IDEAS TODAY. IMPACT TOMORROW.',
  description text NOT NULL DEFAULT 'Think. Build. Solve. The internal edition of Smart India Hackathon.',
  announcement text,
  start_at timestamptz NOT NULL DEFAULT '2026-09-26T09:00:00+05:30',
  end_at timestamptz NOT NULL DEFAULT '2026-09-27T18:00:00+05:30',
  registration_deadline timestamptz NOT NULL DEFAULT '2026-09-15T23:59:00+05:30',
  team_min_size int NOT NULL DEFAULT 6,
  team_max_size int NOT NULL DEFAULT 6,
  registration_fee numeric NOT NULL DEFAULT 500,
  prize_text text NOT NULL DEFAULT '₹1.5 Lakh Cash Prize',
  upi_id text DEFAULT '',
  payment_qr_url text,
  poster_url text,
  logo_url text,
  contact_name text DEFAULT '',
  contact_phone text DEFAULT '',
  contact_email text DEFAULT '',
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  max_upload_mb int NOT NULL DEFAULT 5,
  registration_open boolean NOT NULL DEFAULT true,
  login_open boolean NOT NULL DEFAULT true,
  submissions_open boolean NOT NULL DEFAULT true,
  public_show_leader boolean NOT NULL DEFAULT false,
  public_show_reg_id boolean NOT NULL DEFAULT true,
  custom_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hackathon_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.hackathon_settings TO authenticated;
GRANT ALL ON public.hackathon_settings TO service_role;
ALTER TABLE public.hackathon_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.hackathon_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.hackathon_settings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.hackathon_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.hackathon_settings (singleton) VALUES (true);

-- TEAMS
CREATE SEQUENCE public.team_reg_seq START 1;
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id text UNIQUE,
  team_name text NOT NULL UNIQUE,
  leader_name text NOT NULL,
  leader_email text NOT NULL UNIQUE,
  leader_phone text NOT NULL,
  leader_user_id uuid,
  college text NOT NULL,
  department text NOT NULL,
  year text,
  state text,
  city text,
  status public.registration_status NOT NULL DEFAULT 'submitted',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  form_responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX teams_status_idx ON public.teams(status);
CREATE INDEX teams_college_idx ON public.teams(college);
CREATE INDEX teams_reg_idx ON public.teams(registration_id);
CREATE INDEX teams_leader_user_idx ON public.teams(leader_user_id);

CREATE OR REPLACE FUNCTION public.set_registration_id() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.registration_id IS NULL THEN
    NEW.registration_id := 'SIIH26-' || lpad(nextval('public.team_reg_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER teams_reg_id BEFORE INSERT ON public.teams FOR EACH ROW EXECUTE FUNCTION public.set_registration_id();
CREATE TRIGGER teams_updated BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT INSERT ON public.teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_team(_team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = _team_id
      AND (t.leader_user_id = auth.uid()
        OR lower(t.leader_email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  );
$$;

CREATE POLICY "public can register" ON public.teams FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "leader reads own team" ON public.teams FOR SELECT TO authenticated
  USING (leader_user_id = auth.uid() OR lower(leader_email) = lower(coalesce(auth.jwt() ->> 'email','')) OR public.is_admin(auth.uid()));
CREATE POLICY "leader updates own team" ON public.teams FOR UPDATE TO authenticated
  USING (public.owns_team(id)) WITH CHECK (public.owns_team(id));
CREATE POLICY "admin manages teams" ON public.teams FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- TEAM MEMBERS
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  college text,
  department text,
  year text,
  student_id text,
  is_leader boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX team_members_team_idx ON public.team_members(team_id);
GRANT INSERT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can add members at registration" ON public.team_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "leader reads members" ON public.team_members FOR SELECT TO authenticated USING (public.owns_team(team_id) OR public.is_admin(auth.uid()));
CREATE POLICY "leader edits members" ON public.team_members FOR UPDATE TO authenticated USING (public.owns_team(team_id)) WITH CHECK (public.owns_team(team_id));
CREATE POLICY "admin manages members" ON public.team_members FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- PAYMENTS
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  proof_path text,
  proof_mime text,
  status public.payment_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_team_idx ON public.payments(team_id);
GRANT INSERT ON public.payments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can record payment" ON public.payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "leader reads payment" ON public.payments FOR SELECT TO authenticated USING (public.owns_team(team_id) OR public.is_admin(auth.uid()));
CREATE POLICY "admin manages payments" ON public.payments FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- TASKS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  title text NOT NULL,
  description text,
  instructions text,
  start_at timestamptz,
  deadline timestamptz,
  priority public.priority_level NOT NULL DEFAULT 'normal',
  status public.task_status NOT NULL DEFAULT 'draft',
  max_attempts int NOT NULL DEFAULT 3,
  submission_type text NOT NULL DEFAULT 'url',
  allow_resubmission boolean NOT NULL DEFAULT true,
  assign_all boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_status_idx ON public.tasks(status);
CREATE INDEX tasks_deadline_idx ON public.tasks(deadline);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, team_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_assignments TO authenticated;
GRANT ALL ON public.task_assignments TO service_role;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.task_visible(_task_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = _task_id
      AND t.status IN ('active','closed','archived')
      AND (t.assign_all OR EXISTS (
        SELECT 1 FROM public.task_assignments a
        JOIN public.teams tm ON tm.id = a.team_id
        WHERE a.task_id = t.id
          AND (tm.leader_user_id = auth.uid() OR lower(tm.leader_email) = lower(coalesce(auth.jwt() ->> 'email','')))
      ))
  );
$$;

CREATE POLICY "teams read visible tasks" ON public.tasks FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.task_visible(id));
CREATE POLICY "admin manages tasks" ON public.tasks FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "teams read own assignments" ON public.task_assignments FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.owns_team(team_id));
CREATE POLICY "admin manages assignments" ON public.task_assignments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- TASK DOCUMENTS
CREATE TABLE public.task_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Task Documents',
  storage_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_documents TO authenticated;
GRANT ALL ON public.task_documents TO service_role;
ALTER TABLE public.task_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams read task docs" ON public.task_documents FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR is_public OR (task_id IS NOT NULL AND public.task_visible(task_id)));
CREATE POLICY "admin manages task docs" ON public.task_documents FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- SUBMISSIONS
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  content_text text,
  link_url text,
  file_path text,
  notes text,
  status text NOT NULL DEFAULT 'submitted',
  feedback text,
  score numeric,
  evaluated_by uuid,
  evaluated_at timestamptz,
  submitted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX submissions_team_idx ON public.submissions(team_id);
CREATE INDEX submissions_task_idx ON public.submissions(task_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team reads own submissions" ON public.submissions FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.owns_team(team_id));
CREATE POLICY "team creates submissions" ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (public.owns_team(team_id) AND public.task_visible(task_id));
CREATE POLICY "admin manages submissions" ON public.submissions FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  priority public.priority_level NOT NULL DEFAULT 'normal',
  is_public boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read published announcements" ON public.announcements FOR SELECT TO anon, authenticated
  USING (is_public AND published_at <= now() AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "admin manages announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  priority public.priority_level NOT NULL DEFAULT 'normal',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_team_idx ON public.notifications(team_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team reads notifications" ON public.notifications FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.owns_team(team_id));
CREATE POLICY "team marks read" ON public.notifications FOR UPDATE TO authenticated
  USING (public.owns_team(team_id)) WITH CHECK (public.owns_team(team_id));
CREATE POLICY "admin manages notifications" ON public.notifications FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "authenticated writes audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- PUBLIC SAFE READS
CREATE OR REPLACE FUNCTION public.public_team_directory()
RETURNS TABLE (
  registration_id text, team_name text, college text, department text,
  city text, state text, status public.registration_status, member_count bigint, created_at timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN s.public_show_reg_id THEN t.registration_id ELSE NULL END,
         t.team_name, t.college, t.department, t.city, t.state, t.status,
         (SELECT count(*) FROM public.team_members m WHERE m.team_id = t.id),
         t.created_at
  FROM public.teams t CROSS JOIN public.hackathon_settings s
  WHERE t.status <> 'cancelled'
  ORDER BY t.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.public_team_directory() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.public_stats()
RETURNS TABLE (total_teams bigint, total_students bigint, verified_teams bigint, colleges bigint, tasks_released bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT count(*) FROM public.teams),
         (SELECT count(*) FROM public.team_members),
         (SELECT count(*) FROM public.teams WHERE status = 'verified'),
         (SELECT count(DISTINCT college) FROM public.teams),
         (SELECT count(*) FROM public.tasks WHERE status IN ('active','closed'));
$$;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;

-- claim first super admin (only when none exists)
CREATE OR REPLACE FUNCTION public.claim_first_super_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE existing int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT count(*) INTO existing FROM public.user_roles WHERE role = 'super_admin';
  IF existing > 0 THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'super_admin') ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.claim_first_super_admin() TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
