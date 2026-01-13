-- Add trust score, response rate, and transparency metrics to companies
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS response_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_response_time_hours numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verified_reviews_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false;

-- Add trust score and weighted rating fields to reviews
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS trust_score numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS weighted_rating numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS flag_reason text DEFAULT NULL;

-- Add trust score and verification to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trust_score numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS is_fin_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS platform_activity_months integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS survey_participation_count integer DEFAULT 0;

-- Create surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]',
  reward_points integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create survey responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for surveys
CREATE POLICY "Anyone can view active surveys" ON public.surveys
FOR SELECT USING (is_active = true);

CREATE POLICY "Company owners can manage their surveys" ON public.surveys
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = surveys.company_id 
    AND companies.owner_id = auth.uid()
  )
);

-- RLS policies for survey responses
CREATE POLICY "Users can view their own responses" ON public.survey_responses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit responses" ON public.survey_responses
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to calculate company transparency metrics
CREATE OR REPLACE FUNCTION public.update_company_transparency_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_reviews integer;
  replied_reviews integer;
  verified_count integer;
  avg_resp_time numeric;
BEGIN
  -- Count total approved reviews
  SELECT COUNT(*) INTO total_reviews
  FROM public.reviews
  WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
  AND status = 'approved';

  -- Count replied reviews
  SELECT COUNT(*) INTO replied_reviews
  FROM public.reviews
  WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
  AND status = 'approved'
  AND company_reply IS NOT NULL;

  -- Count verified reviews (from verified users)
  SELECT COUNT(*) INTO verified_count
  FROM public.reviews r
  JOIN public.profiles p ON r.user_id = p.user_id
  WHERE r.company_id = COALESCE(NEW.company_id, OLD.company_id)
  AND r.status = 'approved'
  AND p.is_fin_verified = true;

  -- Calculate average response time (in hours)
  SELECT AVG(EXTRACT(EPOCH FROM (company_reply_at - created_at)) / 3600) INTO avg_resp_time
  FROM public.reviews
  WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
  AND status = 'approved'
  AND company_reply IS NOT NULL
  AND company_reply_at IS NOT NULL;

  -- Update company metrics
  UPDATE public.companies
  SET 
    response_rate = CASE WHEN total_reviews > 0 THEN (replied_reviews::numeric / total_reviews * 100) ELSE 0 END,
    avg_response_time_hours = avg_resp_time,
    verified_reviews_count = verified_count
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);

  RETURN NEW;
END;
$$;

-- Trigger to update transparency metrics when reviews change
DROP TRIGGER IF EXISTS update_company_transparency ON public.reviews;
CREATE TRIGGER update_company_transparency
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_company_transparency_metrics();

-- Function to calculate weighted rating with trust score and time factor
CREATE OR REPLACE FUNCTION public.calculate_weighted_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_trust numeric;
  time_factor numeric;
  base_rating numeric;
  months_old numeric;
BEGIN
  -- Get user's trust score
  SELECT COALESCE(trust_score, 1.0) INTO user_trust
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Calculate time factor (more recent reviews have higher weight)
  -- Reviews from last 6 months get full weight (1.0), older reviews decay
  months_old := EXTRACT(EPOCH FROM (now() - NEW.created_at)) / (30 * 24 * 60 * 60);
  IF months_old <= 6 THEN
    time_factor := 1.0;
  ELSE
    time_factor := GREATEST(0.3, 1.0 - ((months_old - 6) * 0.1));
  END IF;

  -- Calculate base rating (average of criteria if available)
  IF NEW.service_rating IS NOT NULL THEN
    base_rating := (NEW.service_rating + COALESCE(NEW.price_rating, NEW.service_rating) + 
                    COALESCE(NEW.speed_rating, NEW.service_rating) + 
                    COALESCE(NEW.quality_rating, NEW.service_rating)) / 4.0;
  ELSE
    base_rating := NEW.rating;
  END IF;

  -- Calculate weighted rating
  NEW.trust_score := user_trust;
  NEW.weighted_rating := base_rating * user_trust * time_factor;

  RETURN NEW;
END;
$$;

-- Trigger to calculate weighted rating before insert/update
DROP TRIGGER IF EXISTS calculate_review_weighted_rating ON public.reviews;
CREATE TRIGGER calculate_review_weighted_rating
BEFORE INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.calculate_weighted_rating();