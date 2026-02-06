
-- Create security definer function to check company membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_company_member(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE user_id = _user_id
      AND company_id = _company_id
  )
$$;

-- Create security definer function to check if user is member of ANY company
CREATE OR REPLACE FUNCTION public.is_any_company_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE user_id = _user_id
  )
$$;

-- Create security definer function to check if user is company owner
CREATE OR REPLACE FUNCTION public.is_company_owner(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies
    WHERE id = _company_id
      AND owner_id = _user_id
  )
$$;

-- Create security definer function to get company member role
CREATE OR REPLACE FUNCTION public.get_company_member_role(_user_id uuid, _company_id uuid)
RETURNS company_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.company_members
  WHERE user_id = _user_id
    AND company_id = _company_id
  LIMIT 1
$$;

-- Drop and recreate the problematic policies on companies table
DROP POLICY IF EXISTS "Company members can view their company" ON public.companies;
CREATE POLICY "Company members can view their company"
ON public.companies
FOR SELECT
USING (public.is_company_member(auth.uid(), id));

-- Drop and recreate company_members policies that cause recursion
DROP POLICY IF EXISTS "Company managers can view members" ON public.company_members;
CREATE POLICY "Company managers can view members"
ON public.company_members
FOR SELECT
USING (
  public.get_company_member_role(auth.uid(), company_id) = 'manager'
);

DROP POLICY IF EXISTS "Company owners can manage members" ON public.company_members;
CREATE POLICY "Company owners can manage members"
ON public.company_members
FOR ALL
USING (public.is_company_owner(auth.uid(), company_id))
WITH CHECK (public.is_company_owner(auth.uid(), company_id));

-- Fix reviews policies that reference company_members
DROP POLICY IF EXISTS "Company members can reply to reviews" ON public.reviews;
CREATE POLICY "Company members can reply to reviews"
ON public.reviews
FOR UPDATE
USING (public.is_company_member(auth.uid(), company_id));

DROP POLICY IF EXISTS "Company members can view company reviews" ON public.reviews;
CREATE POLICY "Company members can view company reviews"
ON public.reviews
FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

-- Fix profiles policy that references company_members  
DROP POLICY IF EXISTS "Company members can view profiles" ON public.profiles;
CREATE POLICY "Company members can view profiles"
ON public.profiles
FOR SELECT
USING (public.is_any_company_member(auth.uid()));
