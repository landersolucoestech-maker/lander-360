-- Create storage bucket for artist documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-documents', 'artist-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for artist-documents bucket
CREATE POLICY "Authenticated users can upload artist documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artist-documents');

CREATE POLICY "Authenticated users can view artist documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'artist-documents');

CREATE POLICY "Authenticated users can update artist documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'artist-documents');

CREATE POLICY "Authenticated users can delete artist documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'artist-documents');