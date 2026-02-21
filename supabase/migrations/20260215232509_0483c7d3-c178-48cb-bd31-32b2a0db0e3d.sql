
-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Drop existing ALL policies on CRM tables and replace with read=authenticated, write=admin

-- companies
DROP POLICY IF EXISTS "Authenticated users can manage companies" ON public.companies;
CREATE POLICY "Authenticated can read companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update companies" ON public.companies FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete companies" ON public.companies FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- contacts
DROP POLICY IF EXISTS "Authenticated users can manage contacts" ON public.contacts;
CREATE POLICY "Authenticated can read contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contacts" ON public.contacts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contacts" ON public.contacts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- contact_notes
DROP POLICY IF EXISTS "Authenticated users can manage contact notes" ON public.contact_notes;
CREATE POLICY "Authenticated can read contact notes" ON public.contact_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert contact notes" ON public.contact_notes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact notes" ON public.contact_notes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contact notes" ON public.contact_notes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- contact_tags
DROP POLICY IF EXISTS "Authenticated users can manage contact tags" ON public.contact_tags;
CREATE POLICY "Authenticated can read contact tags" ON public.contact_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert contact tags" ON public.contact_tags FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact tags" ON public.contact_tags FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contact tags" ON public.contact_tags FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- deal_stages
DROP POLICY IF EXISTS "Authenticated users can manage deal stages" ON public.deal_stages;
CREATE POLICY "Authenticated can read deal stages" ON public.deal_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert deal stages" ON public.deal_stages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update deal stages" ON public.deal_stages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete deal stages" ON public.deal_stages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- deals
DROP POLICY IF EXISTS "Authenticated users can manage deals" ON public.deals;
CREATE POLICY "Authenticated can read deals" ON public.deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update deals" ON public.deals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete deals" ON public.deals FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- tasks
DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON public.tasks;
CREATE POLICY "Authenticated can read tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
