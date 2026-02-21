
-- Fix overly permissive donations RLS
DROP POLICY IF EXISTS "Service role can manage donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can create donations" ON public.donations;

-- Public can insert donations (guest checkout)
CREATE POLICY "Public can insert donations" ON public.donations FOR INSERT WITH CHECK (true);
-- No public select/update/delete - service role bypasses RLS for admin access

-- Create all missing tables needed by the codebase

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  interest TEXT,
  source TEXT,
  category TEXT,
  tier TEXT,
  amount NUMERIC,
  is_investor BOOLEAN DEFAULT false,
  welcome_email_sent BOOLEAN DEFAULT false,
  email_sequence_step INTEGER,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);

-- donors
CREATE TABLE IF NOT EXISTS public.donors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  welcome_email_sent BOOLEAN DEFAULT false,
  email_sequence_step INTEGER,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- email_templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tier_specific TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- email_sequences
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all',
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  tier_filter TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

-- sequence_steps
CREATE TABLE IF NOT EXISTS public.sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.email_templates(id),
  step_order INTEGER NOT NULL DEFAULT 1,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;

-- email_queue
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_id TEXT,
  recipient_name TEXT,
  recipient_type TEXT,
  template_id UUID REFERENCES public.email_templates(id),
  sequence_id UUID REFERENCES public.email_sequences(id),
  step_order INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- email_logs
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_id TEXT,
  recipient_type TEXT,
  template_id UUID REFERENCES public.email_templates(id),
  sequence_id UUID REFERENCES public.email_sequences(id),
  queue_id UUID REFERENCES public.email_queue(id),
  resend_email_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES public.companies(id),
  status TEXT DEFAULT 'active',
  source TEXT,
  lifecycle_stage TEXT,
  lead_score INTEGER,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  custom_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- contact_notes
CREATE TABLE IF NOT EXISTS public.contact_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note',
  created_by TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;

-- contact_tags
CREATE TABLE IF NOT EXISTS public.contact_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;

-- deal_stages
CREATE TABLE IF NOT EXISTS public.deal_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL DEFAULT 0,
  pipeline TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.deal_stages ENABLE ROW LEVEL SECURITY;

-- deals
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  value NUMERIC,
  currency TEXT DEFAULT 'USD',
  stage_id UUID NOT NULL REFERENCES public.deal_stages(id),
  contact_id UUID REFERENCES public.contacts(id),
  company_id UUID REFERENCES public.companies(id),
  status TEXT DEFAULT 'open',
  probability INTEGER,
  expected_close_date DATE,
  actual_close_date DATE,
  notes TEXT,
  custom_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'task',
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  contact_id UUID REFERENCES public.contacts(id),
  deal_id UUID REFERENCES public.deals(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- funding_rounds
CREATE TABLE IF NOT EXISTS public.funding_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming',
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  fund_allocation JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.funding_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view funding rounds" ON public.funding_rounds FOR SELECT USING (true);

-- workflows
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  trigger_config JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- workflow_actions
CREATE TABLE IF NOT EXISTS public.workflow_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  action_order INTEGER NOT NULL DEFAULT 0,
  branch TEXT,
  parent_action_id UUID REFERENCES public.workflow_actions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
