-- Make artist-documents bucket public for contract template images
UPDATE storage.buckets SET public = true WHERE id = 'artist-documents';

-- Add public read policy for contract template images
CREATE POLICY "Public read access for contract templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-documents' AND (storage.foldername(name))[1] = 'contract-templates');