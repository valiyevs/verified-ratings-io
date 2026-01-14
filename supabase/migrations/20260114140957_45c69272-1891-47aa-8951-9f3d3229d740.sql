-- Drop the security definer view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.reviews_public;

-- Recreate view with SECURITY INVOKER (default, explicit for clarity)
CREATE VIEW public.reviews_public 
WITH (security_invoker = true)
AS
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