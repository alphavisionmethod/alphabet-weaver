
-- Investor access codes managed from admin
CREATE TABLE public.investor_access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  uses_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.investor_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage access codes"
  ON public.investor_access_codes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Public can read active codes for validation"
  ON public.investor_access_codes FOR SELECT
  USING (is_active = true);
