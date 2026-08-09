
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.owns_team(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.task_visible(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_registration_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_first_super_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bootstrap_session() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.public_team_directory() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.public_stats() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_team(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.task_visible(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_session() TO authenticated;
GRANT EXECUTE ON FUNCTION public.public_team_directory() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;
