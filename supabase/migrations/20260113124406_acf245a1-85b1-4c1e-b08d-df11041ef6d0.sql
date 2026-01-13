
-- Add multi-criteria rating columns to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS service_rating integer CHECK (service_rating >= 1 AND service_rating <= 5),
ADD COLUMN IF NOT EXISTS price_rating integer CHECK (price_rating >= 1 AND price_rating <= 5),
ADD COLUMN IF NOT EXISTS speed_rating integer CHECK (speed_rating >= 1 AND speed_rating <= 5),
ADD COLUMN IF NOT EXISTS quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS company_reply text,
ADD COLUMN IF NOT EXISTS company_reply_at timestamp with time zone;

-- Create company_followers table for following feature
CREATE TABLE IF NOT EXISTS public.company_followers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS on company_followers
ALTER TABLE public.company_followers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_followers
CREATE POLICY "Users can view their own follows" 
ON public.company_followers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can follow companies" 
ON public.company_followers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow companies" 
ON public.company_followers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create review_helpful table to track who found reviews helpful
CREATE TABLE IF NOT EXISTS public.review_helpful (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_id)
);

-- Enable RLS on review_helpful
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for review_helpful
CREATE POLICY "Anyone can view helpful counts" 
ON public.review_helpful 
FOR SELECT 
USING (true);

CREATE POLICY "Users can mark reviews helpful" 
ON public.review_helpful 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove helpful mark" 
ON public.review_helpful 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update helpful count
CREATE OR REPLACE FUNCTION public.update_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for helpful count
CREATE TRIGGER update_review_helpful_count
AFTER INSERT OR DELETE ON public.review_helpful
FOR EACH ROW
EXECUTE FUNCTION public.update_helpful_count();

-- Update company rating function to use average of all criteria
CREATE OR REPLACE FUNCTION public.update_company_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.companies
  SET 
    average_rating = (
      SELECT COALESCE(AVG(
        COALESCE(service_rating, rating) + 
        COALESCE(price_rating, rating) + 
        COALESCE(speed_rating, rating) + 
        COALESCE(quality_rating, rating)
      ) / 4.0, 0)
      FROM public.reviews
      WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
      AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
      AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);
  RETURN NEW;
END;
$$;

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for review images
CREATE POLICY "Anyone can view review images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'review-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own review images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);
