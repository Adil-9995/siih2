
-- payment proofs: uploads allowed during registration (anon), reads restricted
CREATE POLICY "payment proof upload" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "payment proof read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND (public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.payments p WHERE p.proof_path = storage.objects.name AND public.owns_team(p.team_id))));
CREATE POLICY "payment proof admin manage" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.is_admin(auth.uid()));

-- task documents
CREATE POLICY "task docs read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'task-documents');
CREATE POLICY "task docs admin write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-documents' AND public.is_admin(auth.uid()));
CREATE POLICY "task docs admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'task-documents' AND public.is_admin(auth.uid()));
CREATE POLICY "task docs admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'task-documents' AND public.is_admin(auth.uid()));

-- site assets (logo, poster, QR)
CREATE POLICY "site assets read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-assets');
CREATE POLICY "site assets admin write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin(auth.uid()));
CREATE POLICY "site assets admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin(auth.uid()));
CREATE POLICY "site assets admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin(auth.uid()));

-- team submissions
CREATE POLICY "submission upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'team-submissions');
CREATE POLICY "submission read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'team-submissions' AND (public.is_admin(auth.uid()) OR owner = auth.uid()));
