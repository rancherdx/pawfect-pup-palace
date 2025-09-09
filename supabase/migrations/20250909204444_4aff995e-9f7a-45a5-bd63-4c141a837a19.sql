-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('puppy-images', 'puppy-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('litter-images', 'litter-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('brand-assets', 'brand-assets', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/mov']),
  ('user-documents', 'user-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for storage buckets

-- Puppy images (public read, admin write)
CREATE POLICY "Anyone can view puppy images" ON storage.objects
FOR SELECT USING (bucket_id = 'puppy-images');

CREATE POLICY "Admins can upload puppy images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'puppy-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update puppy images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'puppy-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete puppy images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'puppy-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Litter images (public read, admin write)
CREATE POLICY "Anyone can view litter images" ON storage.objects
FOR SELECT USING (bucket_id = 'litter-images');

CREATE POLICY "Admins can upload litter images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'litter-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update litter images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'litter-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete litter images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'litter-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Brand assets (public read, super admin write)
CREATE POLICY "Anyone can view brand assets" ON storage.objects
FOR SELECT USING (bucket_id = 'brand-assets');

CREATE POLICY "Super admins can manage brand assets" ON storage.objects
FOR ALL USING (
  bucket_id = 'brand-assets' 
  AND has_role(auth.uid(), 'super-admin'::app_role)
);

-- Videos (public read, admin write)
CREATE POLICY "Anyone can view videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Admins can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- User documents (private, user and admin access)
CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all user documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);