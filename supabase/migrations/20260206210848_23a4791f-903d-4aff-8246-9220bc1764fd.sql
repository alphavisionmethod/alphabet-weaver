-- Add RLS policy for authenticated users to read waitlist (for admin dashboard)
CREATE POLICY "Authenticated users can read waitlist"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);