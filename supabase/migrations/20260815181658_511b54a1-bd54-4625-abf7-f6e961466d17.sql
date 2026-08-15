CREATE TABLE IF NOT EXISTS public.staff_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  role public.app_role NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_invites TO authenticated;
GRANT ALL ON public.staff_invites TO service_role;
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manages staff invites" ON public.staff_invites FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "invitee reads own invite" ON public.staff_invites FOR SELECT TO authenticated
  USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email','')));

DROP FUNCTION IF EXISTS public.bootstrap_session();
CREATE OR REPLACE FUNCTION public.bootstrap_session()
RETURNS TABLE(team_id uuid, is_admin boolean, is_volunteer boolean, role text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
DECLARE mail text := lower(coalesce(auth.jwt() ->> 'email',''));
DECLARE tid uuid;
DECLARE top text;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (uid, mail, coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', auth.jwt() -> 'user_metadata' ->> 'name'))
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  IF mail = 'adhilhassanak@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'super_admin') ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
    SELECT uid, i.role FROM public.staff_invites i WHERE lower(i.email) = mail
  ON CONFLICT DO NOTHING;

  UPDATE public.venue_volunteers SET user_id = uid WHERE lower(email) = mail AND user_id IS DISTINCT FROM uid;

  UPDATE public.teams SET leader_user_id = uid
   WHERE lower(leader_email) = mail AND (leader_user_id IS NULL OR leader_user_id <> uid);

  SELECT t.id INTO tid FROM public.teams t WHERE t.leader_user_id = uid LIMIT 1;
  IF tid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'team_leader') ON CONFLICT DO NOTHING;
  END IF;

  SELECT r.role::text INTO top FROM public.user_roles r WHERE r.user_id = uid
   ORDER BY CASE r.role::text WHEN 'super_admin' THEN 1 WHEN 'admin' THEN 2 WHEN 'co_admin' THEN 3
                              WHEN 'volunteer' THEN 4 ELSE 5 END LIMIT 1;

  RETURN QUERY SELECT tid, public.is_admin(uid), public.is_volunteer(uid), coalesce(top,'guest');
END; $$;
REVOKE EXECUTE ON FUNCTION public.bootstrap_session() FROM anon;