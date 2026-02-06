
-- Create enum for company member roles
CREATE TYPE public.company_role AS ENUM ('manager', 'employee');

-- Create company_members table
CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role company_role NOT NULL DEFAULT 'employee',
  created_at timestamptz NOT NULL DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id),
  UNIQUE(company_id, user_id)
);

-- Enable RLS
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Company owners can manage members
CREATE POLICY "Company owners can manage members"
ON public.company_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_members.company_id
    AND companies.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_members.company_id
    AND companies.owner_id = auth.uid()
  )
);

-- Company managers can view members
CREATE POLICY "Company managers can view members"
ON public.company_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = company_members.company_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'manager'
  )
);

-- Members can view their own membership
CREATE POLICY "Members can view own membership"
ON public.company_members
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all members
CREATE POLICY "Admins can manage all members"
ON public.company_members
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
