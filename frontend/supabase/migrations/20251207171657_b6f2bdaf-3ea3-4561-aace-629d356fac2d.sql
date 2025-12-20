-- Create storage bucket for CRM contact images
INSERT INTO storage.buckets (id, name, public)
VALUES ('crm-contacts', 'crm-contacts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload contact images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'crm-contacts');

-- Create storage policy for public read access
CREATE POLICY "Public read access for contact images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'crm-contacts');

-- Create storage policy for authenticated users to delete
CREATE POLICY "Authenticated users can delete contact images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'crm-contacts');

-- Add image_url column to crm_contacts table
ALTER TABLE public.crm_contacts 
ADD COLUMN IF NOT EXISTS image_url TEXT;