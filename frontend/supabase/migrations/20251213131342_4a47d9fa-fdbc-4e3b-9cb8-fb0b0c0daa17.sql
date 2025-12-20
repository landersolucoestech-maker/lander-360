-- Fix RLS policies for artists table to restrict to admin/manager only
DROP POLICY IF EXISTS "Authenticated users can view artists" ON public.artists;
DROP POLICY IF EXISTS "Authenticated users can insert artists" ON public.artists;
DROP POLICY IF EXISTS "Authenticated users can update artists" ON public.artists;
DROP POLICY IF EXISTS "Authenticated users can delete artists" ON public.artists;
DROP POLICY IF EXISTS "Admin and manager can view artists" ON public.artists;
DROP POLICY IF EXISTS "Admin and manager can insert artists" ON public.artists;
DROP POLICY IF EXISTS "Admin and manager can update artists" ON public.artists;
DROP POLICY IF EXISTS "Admin can delete artists" ON public.artists;

-- Create new restrictive policies for artists (contains PII)
CREATE POLICY "Admin and manager can view artists"
ON public.artists FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admin and manager can insert artists"
ON public.artists FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admin and manager can update artists"
ON public.artists FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admin can delete artists"
ON public.artists FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix RLS policies for phonograms table to restrict to admin/manager only
DROP POLICY IF EXISTS "Authenticated users can view phonograms" ON public.phonograms;
DROP POLICY IF EXISTS "Authenticated users can insert phonograms" ON public.phonograms;
DROP POLICY IF EXISTS "Authenticated users can update phonograms" ON public.phonograms;
DROP POLICY IF EXISTS "Authenticated users can delete phonograms" ON public.phonograms;
DROP POLICY IF EXISTS "Admin and manager can view phonograms" ON public.phonograms;
DROP POLICY IF EXISTS "Admin and manager can insert phonograms" ON public.phonograms;
DROP POLICY IF EXISTS "Admin and manager can update phonograms" ON public.phonograms;
DROP POLICY IF EXISTS "Admin can delete phonograms" ON public.phonograms;

-- Create new restrictive policies for phonograms (contains royalty info)
CREATE POLICY "Admin and manager can view phonograms"
ON public.phonograms FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admin and manager can insert phonograms"
ON public.phonograms FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admin and manager can update phonograms"
ON public.phonograms FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admin can delete phonograms"
ON public.phonograms FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix RLS policies for profiles table to be more restrictive
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile or admin all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Users can only view their own profile, admins can view all
CREATE POLICY "Users can view own profile or admin all"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());