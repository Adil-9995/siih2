
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.owns_team(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.task_visible(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_registration_id() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_first_super_admin() FROM anon;

CREATE OR REPLACE FUNCTION public.bootstrap_session()
RETURNS TABLE (team_id uuid, is_admin boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
DECLARE mail text := lower(coalesce(auth.jwt() ->> 'email',''));
DECLARE tid uuid;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (uid, mail, coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', auth.jwt() -> 'user_metadata' ->> 'name'))
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  UPDATE public.teams SET leader_user_id = uid
   WHERE lower(leader_email) = mail AND (leader_user_id IS NULL OR leader_user_id <> uid);

  SELECT t.id INTO tid FROM public.teams t WHERE t.leader_user_id = uid LIMIT 1;

  IF tid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'team_leader') ON CONFLICT DO NOTHING;
  END IF;

  RETURN QUERY SELECT tid, public.is_admin(uid);
END; $$;
GRANT EXECUTE ON FUNCTION public.bootstrap_session() TO authenticated;
