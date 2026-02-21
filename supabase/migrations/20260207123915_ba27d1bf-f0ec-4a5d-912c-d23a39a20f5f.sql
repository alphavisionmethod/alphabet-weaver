-- Remove the overly permissive RLS policy that allows any authenticated user to read waitlist
DROP POLICY IF EXISTS "Authenticated users can read waitlist" ON public.waitlist;