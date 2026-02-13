
-- Add phone column to profiles table
ALTER TABLE public.profiles ADD COLUMN phone text;

-- Create index for phone lookup (used during login)
CREATE INDEX idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;
