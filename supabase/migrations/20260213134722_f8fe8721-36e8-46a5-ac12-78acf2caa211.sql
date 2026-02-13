
-- Add is_blocked and block_reason columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS block_reason text;
