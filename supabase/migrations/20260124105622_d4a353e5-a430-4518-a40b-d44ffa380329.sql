-- Fix the overly permissive RLS policy for notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Only authenticated users can receive notifications (system inserts via service role)
CREATE POLICY "Authenticated users receive notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);