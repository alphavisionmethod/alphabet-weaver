
-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create workflows table
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage workflows" ON public.workflows
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create workflow_triggers table
CREATE TABLE public.workflow_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage workflow_triggers" ON public.workflow_triggers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create workflow_actions table
CREATE TABLE public.workflow_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  action_order INTEGER NOT NULL DEFAULT 1,
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  parent_action_id UUID REFERENCES public.workflow_actions(id) ON DELETE CASCADE,
  branch TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage workflow_actions" ON public.workflow_actions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create workflow_executions table
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  contact_id TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage workflow_executions" ON public.workflow_executions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create workflow_execution_steps table
CREATE TABLE public.workflow_execution_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES public.workflow_actions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  executed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error TEXT
);
ALTER TABLE public.workflow_execution_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage workflow_execution_steps" ON public.workflow_execution_steps
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Trigger for updated_at
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
