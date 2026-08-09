
CREATE OR REPLACE FUNCTION public.submit_registration(p jsonb)
RETURNS TABLE (team_id uuid, registration_id text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.hackathon_settings%ROWTYPE;
  new_team public.teams%ROWTYPE;
  members jsonb := coalesce(p->'members', '[]'::jsonb);
  m jsonb;
  mail text;
BEGIN
  SELECT * INTO s FROM public.hackathon_settings LIMIT 1;
  IF NOT s.registration_open THEN
    RAISE EXCEPTION 'Registration is currently closed.';
  END IF;

  IF jsonb_array_length(members) < s.team_min_size OR jsonb_array_length(members) > s.team_max_size THEN
    RAISE EXCEPTION 'Team must have between % and % members.', s.team_min_size, s.team_max_size;
  END IF;

  IF EXISTS (SELECT 1 FROM public.teams t WHERE lower(t.team_name) = lower(p->>'team_name')) THEN
    RAISE EXCEPTION 'That team name is already taken.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.teams t WHERE lower(t.leader_email) = lower(p->>'leader_email')) THEN
    RAISE EXCEPTION 'That team leader email is already registered.';
  END IF;

  FOR m IN SELECT * FROM jsonb_array_elements(members) LOOP
    mail := lower(m->>'email');
    IF mail IS NULL OR mail = '' THEN RAISE EXCEPTION 'Every member needs an email address.'; END IF;
    IF EXISTS (SELECT 1 FROM public.team_members tm WHERE lower(tm.email) = mail) THEN
      RAISE EXCEPTION 'Member email % is already registered with another team.', mail;
    END IF;
  END LOOP;

  INSERT INTO public.teams (
    team_name, leader_name, leader_email, leader_phone, college, department, year, state, city,
    form_responses, status, payment_status
  ) VALUES (
    p->>'team_name', p->>'leader_name', lower(p->>'leader_email'), p->>'leader_phone',
    p->>'college', p->>'department', p->>'year', p->>'state', p->>'city',
    coalesce(p->'form_responses', '{}'::jsonb),
    'payment_verification', 'under_review'
  ) RETURNING * INTO new_team;

  FOR m IN SELECT * FROM jsonb_array_elements(members) LOOP
    INSERT INTO public.team_members (team_id, full_name, email, phone, college, department, year, student_id, is_leader)
    VALUES (new_team.id, m->>'full_name', lower(m->>'email'), m->>'phone', m->>'college', m->>'department',
            m->>'year', m->>'student_id', coalesce((m->>'is_leader')::boolean, false));
  END LOOP;

  INSERT INTO public.payments (team_id, amount, proof_path, proof_mime, status)
  VALUES (new_team.id, s.registration_fee, p->>'proof_path', p->>'proof_mime', 'under_review');

  INSERT INTO public.notifications (team_id, title, message, type)
  VALUES (new_team.id, 'Registration received',
          'Your registration ' || new_team.registration_id || ' has been received and is awaiting payment verification.',
          'registration');

  RETURN QUERY SELECT new_team.id, new_team.registration_id;
END; $$;

REVOKE EXECUTE ON FUNCTION public.submit_registration(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_registration(jsonb) TO anon, authenticated;

-- direct table inserts are no longer needed from the public client
DROP POLICY IF EXISTS "public can register" ON public.teams;
DROP POLICY IF EXISTS "public can add members at registration" ON public.team_members;
DROP POLICY IF EXISTS "public can record payment" ON public.payments;
REVOKE INSERT ON public.teams FROM anon;
REVOKE INSERT ON public.team_members FROM anon;
REVOKE INSERT ON public.payments FROM anon;
