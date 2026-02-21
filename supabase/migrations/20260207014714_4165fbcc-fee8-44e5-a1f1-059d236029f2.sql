-- Create donors table for dedicated backer CRM
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('operator', 'sovereign', 'governance')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  email_sequence_step INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  welcome_email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on donors table
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert (for backer signups)
CREATE POLICY "Anyone can submit as donor"
ON public.donors
FOR INSERT
WITH CHECK (true);

-- Policy: No public read access (admin only via edge function)
CREATE POLICY "No public read access on donors"
ON public.donors
FOR SELECT
USING (false);

-- Add email tracking columns to waitlist table
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS email_sequence_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS name TEXT;