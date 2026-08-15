-- new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'co_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'volunteer';

-- editable content
ALTER TABLE public.hackathon_settings
  ADD COLUMN IF NOT EXISTS rules_text text NOT NULL DEFAULT 'Teams must have 6–6 members including the leader.
The team leader''s Gmail address is used for login — it must be valid and unique.
Each member''s email and student ID must be unique across all teams.
Payment proof must be a clear JPG, PNG or PDF.
Submissions after a task deadline are automatically blocked.
Plagiarised or previously submitted work leads to disqualification.',
  ADD COLUMN IF NOT EXISTS rounds_text text NOT NULL DEFAULT 'Tasks are released round by round to verified teams. Each task carries its own problem statement PDF, instructions and deadline — all visible inside your team portal.';

-- venues
CREATE TABLE IF NOT EXISTS public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  room text,
  capacity integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venues TO authenticated;
GRANT ALL ON public.venues TO service_role;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.venue_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (venue_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venue_volunteers TO authenticated;
GRANT ALL ON public.venue_volunteers TO service_role;
ALTER TABLE public.venue_volunteers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pass_code text;

UPDATE public.teams SET pass_code = encode(gen_random_bytes(9), 'hex') WHERE pass_code IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS teams_pass_code_key ON public.teams(pass_code);

CREATE OR REPLACE FUNCTION public.set_team_pass_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.pass_code IS NULL THEN NEW.pass_code := encode(gen_random_bytes(9), 'hex'); END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS teams_pass_code ON public.teams;
CREATE TRIGGER teams_pass_code BEFORE INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.set_team_pass_code();

CREATE TABLE IF NOT EXISTS public.venue_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  scanned_by uuid,
  scanned_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.venue_checkins TO authenticated;
GRANT ALL ON public.venue_checkins TO service_role;
ALTER TABLE public.venue_checkins ENABLE ROW LEVEL SECURITY;

-- role helpers (avoid new enum literals in this transaction by comparing text)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles
                 WHERE user_id = _user_id AND role::text IN ('admin','super_admin','co_admin'));
$$;

CREATE OR REPLACE FUNCTION public.is_volunteer(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles
                 WHERE user_id = _user_id AND role::text = 'volunteer');
$$;

CREATE OR REPLACE FUNCTION public.volunteer_venue_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.venue_id FROM public.venue_volunteers v
  WHERE v.user_id = _user_id
     OR lower(v.email) = lower(coalesce(auth.jwt() ->> 'email',''));
$$;

-- venue policies
DROP POLICY IF EXISTS "admin manages venues" ON public.venues;
CREATE POLICY "admin manages venues" ON public.venues FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "staff reads venues" ON public.venues;
CREATE POLICY "staff reads venues" ON public.venues FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_volunteer(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.teams t WHERE t.venue_id = venues.id AND public.owns_team(t.id)));

DROP POLICY IF EXISTS "admin manages venue volunteers" ON public.venue_volunteers;
CREATE POLICY "admin manages venue volunteers" ON public.venue_volunteers FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "volunteer reads own assignment" ON public.venue_volunteers;
CREATE POLICY "volunteer reads own assignment" ON public.venue_volunteers FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR lower(email) = lower(coalesce(auth.jwt() ->> 'email','')));

DROP POLICY IF EXISTS "staff reads checkins" ON public.venue_checkins;
CREATE POLICY "staff reads checkins" ON public.venue_checkins FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_volunteer(auth.uid()) OR public.owns_team(team_id));
DROP POLICY IF EXISTS "staff writes checkins" ON public.venue_checkins;
CREATE POLICY "staff writes checkins" ON public.venue_checkins FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_volunteer(auth.uid()));

-- volunteers can read the teams / members at their venue
DROP POLICY IF EXISTS "volunteer reads venue teams" ON public.teams;
CREATE POLICY "volunteer reads venue teams" ON public.teams FOR SELECT TO authenticated
  USING (public.is_volunteer(auth.uid()) AND venue_id IN (SELECT public.volunteer_venue_ids(auth.uid())));

DROP POLICY IF EXISTS "volunteer reads venue members" ON public.team_members;
CREATE POLICY "volunteer reads venue members" ON public.team_members FOR SELECT TO authenticated
  USING (public.is_volunteer(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.teams t WHERE t.id = team_members.team_id
      AND t.venue_id IN (SELECT public.volunteer_venue_ids(auth.uid()))));

-- scanning a pass
CREATE OR REPLACE FUNCTION public.scan_venue_pass(_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.teams%ROWTYPE; vname text; allowed boolean;
BEGIN
  IF NOT (public.is_admin(auth.uid()) OR public.is_volunteer(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorised to scan passes.';
  END IF;
  SELECT * INTO t FROM public.teams WHERE pass_code = trim(_code);
  IF t.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'message', 'Invalid pass'); END IF;

  IF public.is_admin(auth.uid()) THEN allowed := true;
  ELSE allowed := t.venue_id IN (SELECT public.volunteer_venue_ids(auth.uid())); END IF;
  IF NOT allowed THEN RETURN jsonb_build_object('ok', false, 'message', 'This team belongs to another venue'); END IF;

  SELECT name INTO vname FROM public.venues WHERE id = t.venue_id;
  INSERT INTO public.venue_checkins (team_id, venue_id, scanned_by, scanned_by_email)
  VALUES (t.id, t.venue_id, auth.uid(), auth.jwt() ->> 'email');

  RETURN jsonb_build_object('ok', true, 'team_name', t.team_name, 'registration_id', t.registration_id,
    'status', t.status, 'payment_status', t.payment_status, 'venue', coalesce(vname,'Unassigned'),
    'college', t.college, 'leader_name', t.leader_name);
END; $$;
REVOKE EXECUTE ON FUNCTION public.scan_venue_pass(text) FROM anon;

-- staff directory for the admin console
CREATE OR REPLACE FUNCTION public.staff_directory()
RETURNS TABLE(user_id uuid, email text, full_name text, role text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.user_id, p.email, p.full_name, r.role::text, r.created_at
  FROM public.user_roles r LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE public.is_admin(auth.uid()) AND r.role::text <> 'team_leader'
  ORDER BY r.created_at DESC;
$$;
REVOKE EXECUTE ON FUNCTION public.staff_directory() FROM anon;

CREATE TRIGGER venues_updated BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();