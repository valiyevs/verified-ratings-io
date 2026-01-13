-- Add notification preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS review_reply_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS company_update_notifications boolean DEFAULT true;

-- Add subscription_plan column to companies if not exists (for pricing functionality)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'subscription_plan') THEN
        ALTER TABLE public.companies ADD COLUMN subscription_plan text DEFAULT 'free';
    END IF;
END $$;

-- Add subscription_expires_at column for subscription management
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS surveys_created_this_month integer DEFAULT 0;