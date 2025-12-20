
-- Fix permissive RLS policies that use USING(true)
-- Replace with proper authenticated user checks

-- Drop and recreate release_streaming_metrics policies
DROP POLICY IF EXISTS "Authenticated users can view release_streaming_metrics" ON public.release_streaming_metrics;
DROP POLICY IF EXISTS "Authenticated users can insert release_streaming_metrics" ON public.release_streaming_metrics;
DROP POLICY IF EXISTS "Authenticated users can update release_streaming_metrics" ON public.release_streaming_metrics;
DROP POLICY IF EXISTS "Authenticated users can delete release_streaming_metrics" ON public.release_streaming_metrics;

CREATE POLICY "Authenticated users can view release_streaming_metrics" 
ON public.release_streaming_metrics FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert release_streaming_metrics" 
ON public.release_streaming_metrics FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update release_streaming_metrics" 
ON public.release_streaming_metrics FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete release_streaming_metrics" 
ON public.release_streaming_metrics FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Drop and recreate music_registry policies
DROP POLICY IF EXISTS "Authenticated users can view music_registry" ON public.music_registry;
DROP POLICY IF EXISTS "Authenticated users can insert music_registry" ON public.music_registry;
DROP POLICY IF EXISTS "Authenticated users can update music_registry" ON public.music_registry;
DROP POLICY IF EXISTS "Authenticated users can delete music_registry" ON public.music_registry;

CREATE POLICY "Authenticated users can view music_registry" 
ON public.music_registry FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert music_registry" 
ON public.music_registry FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update music_registry" 
ON public.music_registry FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete music_registry" 
ON public.music_registry FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Drop and recreate projects policies  
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;

CREATE POLICY "Authenticated users can view projects" 
ON public.projects FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Drop and recreate releases policies
DROP POLICY IF EXISTS "Authenticated users can view releases" ON public.releases;
DROP POLICY IF EXISTS "Authenticated users can insert releases" ON public.releases;
DROP POLICY IF EXISTS "Authenticated users can update releases" ON public.releases;
DROP POLICY IF EXISTS "Authenticated users can delete releases" ON public.releases;

CREATE POLICY "Authenticated users can view releases" 
ON public.releases FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert releases" 
ON public.releases FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update releases" 
ON public.releases FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete releases" 
ON public.releases FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Drop and recreate social_media_metrics policies
DROP POLICY IF EXISTS "Authenticated users can view social_media_metrics" ON public.social_media_metrics;
DROP POLICY IF EXISTS "Authenticated users can insert social_media_metrics" ON public.social_media_metrics;
DROP POLICY IF EXISTS "Authenticated users can update social_media_metrics" ON public.social_media_metrics;
DROP POLICY IF EXISTS "Authenticated users can delete social_media_metrics" ON public.social_media_metrics;

CREATE POLICY "Authenticated users can view social_media_metrics" 
ON public.social_media_metrics FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert social_media_metrics" 
ON public.social_media_metrics FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update social_media_metrics" 
ON public.social_media_metrics FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete social_media_metrics" 
ON public.social_media_metrics FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Drop and recreate tasks policies
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks;

CREATE POLICY "Authenticated users can view tasks" 
ON public.tasks FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tasks" 
ON public.tasks FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete tasks" 
ON public.tasks FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Drop and recreate tracks policies
DROP POLICY IF EXISTS "Authenticated users can view tracks" ON public.tracks;
DROP POLICY IF EXISTS "Authenticated users can insert tracks" ON public.tracks;
DROP POLICY IF EXISTS "Authenticated users can update tracks" ON public.tracks;
DROP POLICY IF EXISTS "Authenticated users can delete tracks" ON public.tracks;

CREATE POLICY "Authenticated users can view tracks" 
ON public.tracks FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert tracks" 
ON public.tracks FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tracks" 
ON public.tracks FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete tracks" 
ON public.tracks FOR DELETE 
USING (auth.uid() IS NOT NULL);
