
-- Companies
CREATE POLICY "Authenticated users can manage companies" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contacts
CREATE POLICY "Authenticated users can manage contacts" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contact notes
CREATE POLICY "Authenticated users can manage contact notes" ON public.contact_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contact tags
CREATE POLICY "Authenticated users can manage contact tags" ON public.contact_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Deal stages
CREATE POLICY "Authenticated users can manage deal stages" ON public.deal_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Deals
CREATE POLICY "Authenticated users can manage deals" ON public.deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Donors
CREATE POLICY "Authenticated users can manage donors" ON public.donors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email logs
CREATE POLICY "Authenticated users can manage email logs" ON public.email_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email queue
CREATE POLICY "Authenticated users can manage email queue" ON public.email_queue FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email sequences
CREATE POLICY "Authenticated users can manage email sequences" ON public.email_sequences FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email templates
CREATE POLICY "Authenticated users can manage email templates" ON public.email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sequence steps
CREATE POLICY "Authenticated users can manage sequence steps" ON public.sequence_steps FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tasks
CREATE POLICY "Authenticated users can manage tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Workflows
CREATE POLICY "Authenticated users can manage workflows" ON public.workflows FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Workflow actions
CREATE POLICY "Authenticated users can manage workflow actions" ON public.workflow_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Workflow executions
CREATE POLICY "Authenticated users can manage workflow executions" ON public.workflow_executions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Workflow triggers
CREATE POLICY "Authenticated users can manage workflow triggers" ON public.workflow_triggers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Donations: add SELECT for authenticated users to view in admin
CREATE POLICY "Authenticated users can view donations" ON public.donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update donations" ON public.donations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete donations" ON public.donations FOR DELETE TO authenticated USING (true);

-- Funding rounds: add write access for authenticated
CREATE POLICY "Authenticated users can insert funding rounds" ON public.funding_rounds FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update funding rounds" ON public.funding_rounds FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete funding rounds" ON public.funding_rounds FOR DELETE TO authenticated USING (true);

-- Waitlist: add read/update/delete for authenticated
CREATE POLICY "Authenticated users can view waitlist" ON public.waitlist FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update waitlist" ON public.waitlist FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete waitlist" ON public.waitlist FOR DELETE TO authenticated USING (true);
