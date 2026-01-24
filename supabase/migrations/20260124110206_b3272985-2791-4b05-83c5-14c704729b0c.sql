-- Drop the restrictive policy for viewing approved companies
DROP POLICY IF EXISTS "Authenticated users can view approved companies" ON public.companies;

-- Create a PERMISSIVE policy that allows ANYONE (including anonymous) to view approved companies
CREATE POLICY "Anyone can view approved companies" 
ON public.companies 
FOR SELECT 
USING (status = 'approved');

-- Also fix reviews table - drop restrictive and create permissive
DROP POLICY IF EXISTS "Authenticated users can view approved reviews" ON public.reviews;

CREATE POLICY "Anyone can view approved reviews" 
ON public.reviews 
FOR SELECT 
USING (status = 'approved');