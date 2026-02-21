
CREATE TABLE IF NOT EXISTS public.donation_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Heart',
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  perks JSONB NOT NULL DEFAULT '[]',
  is_open BOOLEAN NOT NULL DEFAULT false,
  popular BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  stripe_price_id TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.donation_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active tiers" ON public.donation_tiers FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tier TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_session_id TEXT
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert donations" ON public.donations FOR INSERT WITH CHECK (true);

INSERT INTO public.donation_tiers (tier_id, name, amount, description, icon, color, perks, popular, display_order)
VALUES
  ('supporter', 'Supporter', 25, 'Back the mission and join the community', 'Heart', '#8B5CF6', '["Name on supporters wall","Early access updates","Community badge"]', false, 1),
  ('builder', 'Builder', 100, 'Help shape the product roadmap', 'Rocket', '#D97706', '["Everything in Supporter","Priority feature requests","Monthly founder updates","Beta access"]', true, 2),
  ('visionary', 'Visionary', 500, 'Become a strategic partner in our journey', 'Crown', '#059669', '["Everything in Builder","1-on-1 strategy call","Advisory board nomination","Custom integration support"]', false, 3);
