-- A13: Manifesto Storage bucket
-- Private bucket for party manifesto uploads (PDF/DOCX)
-- Path convention: {party_id}/{turn}_{filename}

INSERT INTO storage.buckets (id, name, public)
VALUES ('manifestos', 'manifestos', false);

-- Authenticated users can upload to their own party path
CREATE POLICY "manifestos_upload_party_member"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'manifestos'
    AND (storage.foldername(name))[1] = (
      SELECT party_id::text FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Authenticated users can read their own party manifesto files
CREATE POLICY "manifestos_read_party_member"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'manifestos'
    AND (storage.foldername(name))[1] = (
      SELECT party_id::text FROM public.profiles WHERE id = auth.uid()
    )
  );

-- GMs can read all manifesto files
CREATE POLICY "manifestos_read_gm"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'manifestos'
    AND public.is_gm_or_admin()
  );

-- GMs can delete manifesto files
CREATE POLICY "manifestos_delete_gm"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'manifestos'
    AND public.is_gm_or_admin()
  );
