-- Remove old public policies that expose user_id and owner_id

-- Remove the old public policy on companies that exposes owner_id
DROP POLICY IF EXISTS "Anyone can view approved companies" ON public.companies;

-- Create new policy that only allows authenticated users to view companies
CREATE POLICY "Authenticated users can view approved companies"
ON public.companies
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Allow public access only through companies_public view
GRANT SELECT ON public.companies_public TO anon;
GRANT SELECT ON public.companies_public TO authenticated;

-- Remove the old public policy on reviews that exposes user_id
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;

-- The authenticated policies we created earlier remain in place

-- For profiles table - make the policy more restrictive
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;

-- Separate policies for own profile vs admin access
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins and moderators can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));