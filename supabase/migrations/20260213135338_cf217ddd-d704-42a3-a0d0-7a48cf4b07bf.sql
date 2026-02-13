
-- Allow admins to update any profile (needed for blocking users)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow company members to update subscription fields
CREATE POLICY "Company members can update subscription"
ON public.companies
FOR UPDATE
USING (is_company_member(auth.uid(), id));
