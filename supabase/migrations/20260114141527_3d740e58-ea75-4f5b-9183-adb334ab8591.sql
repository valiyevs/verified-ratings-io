-- Allow company owners to view survey responses for their surveys
CREATE POLICY "Company owners can view survey responses"
ON public.survey_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM surveys s 
    JOIN companies c ON s.company_id = c.id 
    WHERE s.id = survey_responses.survey_id 
    AND c.owner_id = auth.uid()
  )
);