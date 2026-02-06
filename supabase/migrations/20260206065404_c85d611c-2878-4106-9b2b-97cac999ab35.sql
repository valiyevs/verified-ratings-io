
-- Allow company members (manager/employee) to update reviews (for replying)
-- They need to be able to set company_reply on reviews belonging to their company
CREATE POLICY "Company members can reply to reviews"
ON public.reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = reviews.company_id
    AND cm.user_id = auth.uid()
  )
);

-- Allow company members to view reviews of their company
CREATE POLICY "Company members can view company reviews"
ON public.reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = reviews.company_id
    AND cm.user_id = auth.uid()
  )
);

-- Allow company members to view their company data
CREATE POLICY "Company members can view their company"
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = companies.id
    AND cm.user_id = auth.uid()
  )
);

-- Allow company members to view profiles (for reviewer names in dashboard)
CREATE POLICY "Company members can view profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = auth.uid()
  )
);
