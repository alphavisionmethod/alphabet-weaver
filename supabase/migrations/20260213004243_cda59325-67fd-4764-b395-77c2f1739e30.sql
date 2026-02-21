
-- Donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tier TEXT NOT NULL DEFAULT 'open',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a donation
CREATE POLICY "Anyone can insert donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read donations"
  ON public.donations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update/delete
CREATE POLICY "Admins can manage donations"
  ON public.donations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Funding rounds table
CREATE TABLE public.funding_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming',
  description TEXT,
  fund_allocation JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funding_rounds ENABLE ROW LEVEL SECURITY;

-- Public reads
CREATE POLICY "Anyone can read funding rounds"
  ON public.funding_rounds FOR SELECT
  USING (true);

-- Admin writes
CREATE POLICY "Admins can manage funding rounds"
  ON public.funding_rounds FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_funding_rounds_updated_at
  BEFORE UPDATE ON public.funding_rounds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data
INSERT INTO public.funding_rounds (phase_name, target_amount, current_amount, status, description, fund_allocation, display_order)
VALUES
  ('Pre-Seed', 600000, 0, 'active', 'Build the core platform, assemble founding team, and validate with early users', '{"Engineering": 40, "Product": 25, "Go-to-Market": 20, "Operations": 15}', 1),
  ('Seed', 2000000, 0, 'upcoming', 'Scale the team, launch publicly, and expand integrations', '{"Engineering": 35, "Product": 20, "Go-to-Market": 30, "Operations": 15}', 2),
  ('Series A', 8000000, 0, 'upcoming', 'Accelerate growth, international expansion, and enterprise features', '{"Engineering": 30, "Product": 15, "Go-to-Market": 35, "Operations": 20}', 3);
