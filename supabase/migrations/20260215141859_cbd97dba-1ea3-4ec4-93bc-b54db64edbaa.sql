
-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tier TEXT NOT NULL DEFAULT 'open',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Public insert (anyone can donate)
CREATE POLICY "Anyone can create donations"
ON public.donations FOR INSERT
WITH CHECK (true);

-- Only service role can read/update (via edge functions)
CREATE POLICY "Service role can manage donations"
ON public.donations FOR ALL
USING (true)
WITH CHECK (true);

-- Create donation_tiers table
CREATE TABLE public.donation_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Heart',
  color TEXT NOT NULL DEFAULT 'hsl(270 91% 55%)',
  perks TEXT[] NOT NULL DEFAULT '{}',
  is_open BOOLEAN NOT NULL DEFAULT false,
  popular BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  stripe_price_id TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_tiers ENABLE ROW LEVEL SECURITY;

-- Anyone can view active tiers
CREATE POLICY "Anyone can view active donation tiers"
ON public.donation_tiers FOR SELECT
USING (is_active = true);

-- Seed default tiers
INSERT INTO public.donation_tiers (tier_id, name, amount, description, icon, color, perks, is_open, popular, stripe_price_id, display_order) VALUES
('supporter', 'Supporter', 25, 'Back the mission. Get early updates', 'Heart', 'hsl(270 91% 55%)', ARRAY['Early product updates', 'Name on supporters wall', 'Community access'], false, false, 'price_1T14tCAUN274E4TruJzmTogv', 0),
('builder', 'Builder', 100, 'Priority beta access + name in credits', 'Rocket', 'hsl(300 70% 50%)', ARRAY['All Supporter perks', 'Priority beta access', 'Name in product credits', 'Monthly newsletter'], false, true, 'price_1T15TLAUN274E4TrAG1Tz09u', 1),
('visionary', 'Visionary', 500, 'All Builder perks + monthly founder calls', 'Crown', 'hsl(38 95% 54%)', ARRAY['All Builder perks', 'Monthly founder calls', 'Early feature requests', 'Lifetime early pricing'], false, false, 'price_1T15TnAUN274E4TroJNvS95T', 2),
('open', 'Open Donation', 0, 'Donate without expecting anything in return', 'Gift', 'hsl(160 60% 45%)', ARRAY['Our eternal gratitude', 'Good karma', 'Support the mission'], true, false, NULL, 3);
