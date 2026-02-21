
-- Allow admins to fully manage donation tiers
-- First, update SELECT to allow authenticated users to see all tiers (including inactive)
CREATE POLICY "Authenticated users can view all donation tiers"
ON public.donation_tiers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert donation tiers"
ON public.donation_tiers
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update donation tiers"
ON public.donation_tiers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete donation tiers"
ON public.donation_tiers
FOR DELETE
TO authenticated
USING (true);
