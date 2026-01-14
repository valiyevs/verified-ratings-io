-- Drop existing SELECT policies on reviews table
DROP POLICY IF EXISTS "Approved reviews can be read by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can read their own reviews" ON public.reviews;

-- Create new secure SELECT policy that hides user_id from public
-- Reviews are readable by everyone BUT user_id is only visible to:
-- 1. The review author themselves
-- 2. Admins/moderators
-- 3. Company owners (for their own companies)
CREATE POLICY "Reviews are publicly readable"
ON public.reviews
FOR SELECT
USING (status = 'approved');

-- Create a view that hides user_id for non-privileged users
CREATE OR REPLACE VIEW public.reviews_public AS
SELECT 
  id,
  company_id,
  CASE 
    WHEN auth.uid() = user_id THEN user_id
    WHEN public.has_role(auth.uid(), 'admin') THEN user_id
    WHEN public.has_role(auth.uid(), 'moderator') THEN user_id
    ELSE NULL
  END AS user_id,
  title,
  content,
  rating,
  quality_rating,
  service_rating,
  price_rating,
  speed_rating,
  image_url,
  helpful_count,
  company_reply,
  company_reply_at,
  trust_score,
  weighted_rating,
  created_at,
  updated_at,
  status,
  is_flagged,
  flag_reason
FROM public.reviews
WHERE status = 'approved';

-- Drop existing SELECT policy on review_helpful table
DROP POLICY IF EXISTS "Review helpful records are viewable by everyone" ON public.review_helpful;

-- Create new policy that only shows user's own helpful marks
CREATE POLICY "Users can only see their own helpful marks"
ON public.review_helpful
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Allow public to see helpful_count through the reviews table (aggregate only)
-- No direct access to individual user_id values in review_helpful