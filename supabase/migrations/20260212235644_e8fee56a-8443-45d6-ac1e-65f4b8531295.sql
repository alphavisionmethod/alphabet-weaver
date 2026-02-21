
-- Unified contacts table (merges waitlist + donors concept)
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  company_id UUID,
  source TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'active',
  lifecycle_stage TEXT DEFAULT 'lead',
  lead_score INTEGER DEFAULT 0,
  avatar_url TEXT,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contacts" ON public.contacts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  size TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add FK from contacts to companies
ALTER TABLE public.contacts ADD CONSTRAINT contacts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- Contact tags (many-to-many)
CREATE TABLE public.contact_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, tag)
);

ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contact_tags" ON public.contact_tags FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Contact notes / activity timeline
CREATE TABLE public.contact_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contact_notes" ON public.contact_notes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Deal stages (pipeline configuration)
CREATE TABLE public.deal_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#8b5cf6',
  pipeline TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deal_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage deal_stages" ON public.deal_stages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default pipeline stages
INSERT INTO public.deal_stages (name, stage_order, color, pipeline) VALUES
  ('New Lead', 0, '#6366f1', 'default'),
  ('Contacted', 1, '#8b5cf6', 'default'),
  ('Qualified', 2, '#a855f7', 'default'),
  ('Proposal', 3, '#d946ef', 'default'),
  ('Negotiation', 4, '#f59e0b', 'default'),
  ('Won', 5, '#22c55e', 'default'),
  ('Lost', 6, '#ef4444', 'default');

-- Deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  stage_id UUID NOT NULL REFERENCES public.deal_stages(id) ON DELETE RESTRICT,
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  actual_close_date DATE,
  status TEXT DEFAULT 'open',
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage deals" ON public.deals FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'task',
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tasks" ON public.tasks FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX idx_contacts_lifecycle_stage ON public.contacts(lifecycle_stage);
CREATE INDEX idx_contact_tags_contact_id ON public.contact_tags(contact_id);
CREATE INDEX idx_contact_tags_tag ON public.contact_tags(tag);
CREATE INDEX idx_contact_notes_contact_id ON public.contact_notes(contact_id);
CREATE INDEX idx_deals_contact_id ON public.deals(contact_id);
CREATE INDEX idx_deals_stage_id ON public.deals(stage_id);
CREATE INDEX idx_deals_status ON public.deals(status);
CREATE INDEX idx_tasks_contact_id ON public.tasks(contact_id);
CREATE INDEX idx_tasks_deal_id ON public.tasks(deal_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
