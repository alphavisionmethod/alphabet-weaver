-- Create waitlist table for lead capture
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  interest TEXT DEFAULT 'general',
  source TEXT DEFAULT 'landing_page',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for public signup)
CREATE POLICY "Anyone can submit to waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only allow reading for authenticated admin users (we'll add this later)
CREATE POLICY "No public read access"
  ON public.waitlist
  FOR SELECT
  TO anon
  USING (false);