-- Create storage bucket for release covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('release-covers', 'release-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload covers
CREATE POLICY "Authenticated users can upload release covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'release-covers');

-- Create policy for authenticated users to update covers
CREATE POLICY "Authenticated users can update release covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'release-covers');

-- Create policy for authenticated users to delete covers
CREATE POLICY "Authenticated users can delete release covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'release-covers');

-- Create policy for public read access
CREATE POLICY "Public can view release covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'release-covers');