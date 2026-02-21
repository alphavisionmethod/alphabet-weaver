
-- Enums
CREATE TYPE public.lead_type AS ENUM ('waitlist', 'donor', 'investor');
CREATE TYPE public.event_type AS ENUM (
  'WAITLIST_SIGNUP', 'DONATION_CREATED', 'INVESTOR_INFO_REQUEST',
  'PITCH_VIEW', 'DEMO_VIEW', 'WORKFLOW_TOGGLED', 'TEMPLATE_UPDATED',
  'EMAIL_SENT', 'EMAIL_FAILED', 'UNSUBSCRIBE', 'BOUNCE', 'COMPLAINT'
);
CREATE TYPE public.workflow_status AS ENUM ('OFF', 'SHADOW', 'LIVE');
CREATE TYPE public.email_status AS ENUM ('queued', 'sent', 'failed', 'skipped');
CREATE TYPE public.suppression_reason AS ENUM ('unsubscribed', 'bounce', 'complaint', 'manual');
CREATE TYPE public.app_role AS ENUM ('admin', 'superadmin', 'readonly');

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Superadmins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- User Leads
CREATE TABLE public.user_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  lead_type lead_type NOT NULL DEFAULT 'waitlist',
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_leads ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_user_leads_email ON public.user_leads(email);

CREATE POLICY "Admins can manage leads" ON public.user_leads FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Readonly can view leads" ON public.user_leads FOR SELECT
  USING (public.has_role(auth.uid(), 'readonly'));

-- Donor Profiles
CREATE TABLE public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.user_leads(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount_total INTEGER NOT NULL DEFAULT 0,
  last_donation_at TIMESTAMPTZ,
  perk_tier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage donor profiles" ON public.donor_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Investor Profiles
CREATE TABLE public.investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.user_leads(id) ON DELETE CASCADE NOT NULL UNIQUE,
  fund_name TEXT,
  check_size_range TEXT,
  stage_focus TEXT,
  accredited BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage investor profiles" ON public.investor_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Events (immutable audit log)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.user_leads(id) ON DELETE SET NULL,
  event_type event_type NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_events_lead ON public.events(lead_id);
CREATE INDEX idx_events_type ON public.events(event_type);

CREATE POLICY "Admins can view events" ON public.events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'readonly'));
CREATE POLICY "System can insert events" ON public.events FOR INSERT WITH CHECK (true);

-- Workflow Templates
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_system BOOLEAN NOT NULL DEFAULT false,
  audience_type lead_type NOT NULL,
  status workflow_status NOT NULL DEFAULT 'OFF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_wf_key_version ON public.workflow_templates(key, version);

CREATE POLICY "Admins manage workflows" ON public.workflow_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Readonly view workflows" ON public.workflow_templates FOR SELECT
  USING (public.has_role(auth.uid(), 'readonly'));

-- Workflow Steps
CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE NOT NULL,
  step_order INTEGER NOT NULL,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'email',
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  from_name TEXT DEFAULT 'SITA OS',
  from_email TEXT DEFAULT 'hello@sitaos.com',
  reply_to TEXT,
  conditions JSONB DEFAULT '{}',
  variant TEXT DEFAULT 'A',
  variant_weight INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_wf_steps_template ON public.workflow_steps(template_id, step_order);

CREATE POLICY "Admins manage steps" ON public.workflow_steps FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Readonly view steps" ON public.workflow_steps FOR SELECT
  USING (public.has_role(auth.uid(), 'readonly'));

-- Email Messages
CREATE TABLE public.email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.user_leads(id) ON DELETE SET NULL NOT NULL,
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE SET NULL,
  step_id UUID REFERENCES public.workflow_steps(id) ON DELETE SET NULL,
  provider_message_id TEXT,
  status email_status NOT NULL DEFAULT 'queued',
  error TEXT,
  subject TEXT,
  body_html TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_email_lead ON public.email_messages(lead_id);
CREATE INDEX idx_email_status ON public.email_messages(status);

CREATE POLICY "Admins manage emails" ON public.email_messages FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Readonly view emails" ON public.email_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'readonly'));

-- Suppressions
CREATE TABLE public.suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  reason suppression_reason NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suppressions ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_suppression_email ON public.suppressions(email);

CREATE POLICY "Admins manage suppressions" ON public.suppressions FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Brand Themes
CREATE TABLE public.brand_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Default',
  primary_color TEXT NOT NULL DEFAULT '#7C3AED',
  secondary_color TEXT NOT NULL DEFAULT '#1E293B',
  accent_color TEXT NOT NULL DEFAULT '#F59E0B',
  background_color TEXT NOT NULL DEFAULT '#0A0A0A',
  text_color TEXT NOT NULL DEFAULT '#E5E7EB',
  logo_url TEXT,
  derived_from_logo BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage themes" ON public.brand_themes FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Anyone can view active theme" ON public.brand_themes FOR SELECT USING (is_active = true);

-- Workflow Enrollments (tracks which leads are enrolled in which workflows)
CREATE TABLE public.workflow_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.user_leads(id) ON DELETE CASCADE NOT NULL,
  workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(lead_id, workflow_template_id)
);
ALTER TABLE public.workflow_enrollments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_enrollment_lead ON public.workflow_enrollments(lead_id);

CREATE POLICY "Admins manage enrollments" ON public.workflow_enrollments FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Audit Log for admin actions
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit log" ON public.admin_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "System can insert audit log" ON public.admin_audit_log FOR INSERT WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_leads_updated_at BEFORE UPDATE ON public.user_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON public.workflow_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brand_themes_updated_at BEFORE UPDATE ON public.brand_themes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
