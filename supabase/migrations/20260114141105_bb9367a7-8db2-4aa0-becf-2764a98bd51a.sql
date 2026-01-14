-- Fix 1: Add explicit policy to deny anonymous access to profiles
-- Current policies already restrict to own profile or admin, but let's make it explicit
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Fix 2: Create a public companies view that hides sensitive business data
-- Keep owner contact info but hide subscription/internal metrics
CREATE OR REPLACE VIEW public.companies_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  description,
  category,
  logo_url,
  address,
  website,
  -- Only show contact info for approved companies 
  CASE WHEN status = 'approved' THEN email ELSE NULL END AS email,
  CASE WHEN status = 'approved' THEN phone ELSE NULL END AS phone,
  average_rating,
  review_count,
  verified_reviews_count,
  response_rate,
  avg_response_time_hours,
  is_sponsored,
  status,
  created_at,
  updated_at
  -- Hiding: owner_id, subscription_plan, subscription_expires_at, surveys_created_this_month
FROM public.companies
WHERE status = 'approved';

-- Fix 3: Remove the old public policy on review_helpful 
DROP POLICY IF EXISTS "Anyone can view helpful counts" ON public.review_helpful;
DROP POLICY IF EXISTS "Users can only see their own helpful marks" ON public.review_helpful;

-- Only authenticated users can see their own helpful marks
CREATE POLICY "Authenticated users can view own helpful marks"
ON public.review_helpful
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin/moderators can view all
CREATE POLICY "Admins can view all helpful marks"
ON public.review_helpful
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Fix 4: Update reviews policy to only allow authenticated users or use the public view
-- We already have reviews_public view, but update the base table policy
DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.reviews;

-- Only authenticated users can access the reviews table directly
CREATE POLICY "Authenticated users can view approved reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Authors can always see their own reviews regardless of status
CREATE POLICY "Authors can view their own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Grant public access through the reviews_public view only (which hides user_id)
GRANT SELECT ON public.reviews_public TO anon;
GRANT SELECT ON public.reviews_public TO authenticated;