-- =============================================
-- ADVANCED CRM EMAIL AUTOMATION SYSTEM
-- Phase 1: Core Infrastructure Tables
-- =============================================

-- Email Templates: Reusable email content library
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- welcome, update, reminder, nurture, broadcast
  tier_specific TEXT, -- null (all), operator, sovereign, governance
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email Sequences: Automated drip campaign definitions
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- on_signup, on_backer, on_investor, manual
  audience TEXT NOT NULL DEFAULT 'all', -- waitlist, donors, investors, all
  tier_filter TEXT, -- null (all tiers), operator, sovereign, governance
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sequence Steps: Individual steps within a sequence
CREATE TABLE public.sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 1,
  delay_hours INTEGER NOT NULL DEFAULT 0, -- hours to wait after previous step (or trigger)
  conditions JSONB, -- optional conditions like tier checks
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email Queue: Scheduled emails waiting to be sent
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_id UUID, -- FK to donors or waitlist (polymorphic)
  recipient_type TEXT, -- 'donor' or 'waitlist'
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE SET NULL,
  step_order INTEGER,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, sent, failed, cancelled
  error_message TEXT,
  metadata JSONB, -- extra data like tier, backer_number, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email Logs: Track all sent emails and engagement
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_id UUID REFERENCES public.email_queue(id) ON DELETE SET NULL,
  recipient_id UUID,
  recipient_type TEXT, -- 'donor' or 'waitlist'
  recipient_email TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE SET NULL,
  resend_email_id TEXT, -- Resend's email ID for tracking
  status TEXT NOT NULL DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, complained
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can access CRM tables
CREATE POLICY "Admins can manage email_templates"
ON public.email_templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage email_sequences"
ON public.email_sequences FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage sequence_steps"
ON public.sequence_steps FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage email_queue"
ON public.email_queue FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage email_logs"
ON public.email_logs FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON public.email_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_created ON public.email_logs(created_at);
CREATE INDEX idx_sequence_steps_sequence ON public.sequence_steps(sequence_id, step_order);

-- Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_sequences_updated_at
BEFORE UPDATE ON public.email_sequences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();