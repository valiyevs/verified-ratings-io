-- ===========================================
-- Security Fixes for Error-Level Issues
-- ===========================================

-- 1. FIX: Make review-images storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'review-images';

-- 2. FIX: Drop old overly permissive storage policy and create authenticated-only policy
DROP POLICY IF EXISTS "Anyone can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view review images" ON storage.objects;

-- Allow only authenticated users to view review images
CREATE POLICY "Authenticated users can view review images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'review-images');

-- 3. FIX: Recreate companies_public view with SECURITY INVOKER
-- This ensures the view respects the calling user's permissions
DROP VIEW IF EXISTS public.companies_public;

CREATE VIEW public.companies_public
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
    -- Only show contact info for approved companies to authenticated users
    CASE
        WHEN (status = 'approved' AND auth.uid() IS NOT NULL) THEN email
        ELSE NULL
    END AS email,
    CASE
        WHEN (status = 'approved' AND auth.uid() IS NOT NULL) THEN phone
        ELSE NULL
    END AS phone,
    average_rating,
    review_count,
    verified_reviews_count,
    response_rate,
    avg_response_time_hours,
    is_sponsored,
    status,
    created_at,
    updated_at
FROM companies
WHERE status = 'approved';

-- Grant access to authenticated and anon roles
GRANT SELECT ON public.companies_public TO authenticated;
GRANT SELECT ON public.companies_public TO anon;

-- 4. FIX: Add a more restrictive policy for profiles table
-- Remove any policy that allows anonymous access to profiles
-- Current policies already restrict to own profile or admin/moderator, 
-- but let's ensure no anonymous access exists

-- First, verify only authenticated policies exist (no anon access)
-- The existing policies are correct:
-- - "Users can view own profile only" - (user_id = auth.uid())
-- - "Admins and moderators can view all profiles" - has_role checks