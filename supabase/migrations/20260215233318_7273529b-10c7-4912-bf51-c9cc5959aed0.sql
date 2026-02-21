
-- Lock down donors: admin-only writes
DROP POLICY IF EXISTS "Authenticated users can manage donors" ON public.donors;
CREATE POLICY "Authenticated can read donors" ON public.donors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert donors" ON public.donors FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update donors" ON public.donors FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete donors" ON public.donors FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down email_logs
DROP POLICY IF EXISTS "Authenticated users can manage email logs" ON public.email_logs;
CREATE POLICY "Authenticated can read email logs" ON public.email_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert email logs" ON public.email_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update email logs" ON public.email_logs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete email logs" ON public.email_logs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down email_queue
DROP POLICY IF EXISTS "Authenticated users can manage email queue" ON public.email_queue;
CREATE POLICY "Authenticated can read email queue" ON public.email_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert email queue" ON public.email_queue FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update email queue" ON public.email_queue FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete email queue" ON public.email_queue FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down email_sequences
DROP POLICY IF EXISTS "Authenticated users can manage email sequences" ON public.email_sequences;
CREATE POLICY "Authenticated can read email sequences" ON public.email_sequences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert email sequences" ON public.email_sequences FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update email sequences" ON public.email_sequences FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete email sequences" ON public.email_sequences FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down email_templates
DROP POLICY IF EXISTS "Authenticated users can manage email templates" ON public.email_templates;
CREATE POLICY "Authenticated can read email templates" ON public.email_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert email templates" ON public.email_templates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update email templates" ON public.email_templates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete email templates" ON public.email_templates FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down sequence_steps
DROP POLICY IF EXISTS "Authenticated users can manage sequence steps" ON public.sequence_steps;
CREATE POLICY "Authenticated can read sequence steps" ON public.sequence_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert sequence steps" ON public.sequence_steps FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sequence steps" ON public.sequence_steps FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sequence steps" ON public.sequence_steps FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down workflows
DROP POLICY IF EXISTS "Authenticated users can manage workflows" ON public.workflows;
CREATE POLICY "Authenticated can read workflows" ON public.workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert workflows" ON public.workflows FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update workflows" ON public.workflows FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete workflows" ON public.workflows FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down workflow_actions
DROP POLICY IF EXISTS "Authenticated users can manage workflow actions" ON public.workflow_actions;
CREATE POLICY "Authenticated can read workflow actions" ON public.workflow_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert workflow actions" ON public.workflow_actions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update workflow actions" ON public.workflow_actions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete workflow actions" ON public.workflow_actions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down workflow_executions
DROP POLICY IF EXISTS "Authenticated users can manage workflow executions" ON public.workflow_executions;
CREATE POLICY "Authenticated can read workflow executions" ON public.workflow_executions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert workflow executions" ON public.workflow_executions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update workflow executions" ON public.workflow_executions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete workflow executions" ON public.workflow_executions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down workflow_triggers
DROP POLICY IF EXISTS "Authenticated users can manage workflow triggers" ON public.workflow_triggers;
CREATE POLICY "Authenticated can read workflow triggers" ON public.workflow_triggers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert workflow triggers" ON public.workflow_triggers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update workflow triggers" ON public.workflow_triggers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete workflow triggers" ON public.workflow_triggers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down donation_tiers writes to admin
DROP POLICY IF EXISTS "Authenticated users can delete donation tiers" ON public.donation_tiers;
DROP POLICY IF EXISTS "Authenticated users can insert donation tiers" ON public.donation_tiers;
DROP POLICY IF EXISTS "Authenticated users can update donation tiers" ON public.donation_tiers;
CREATE POLICY "Admins can insert donation tiers" ON public.donation_tiers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update donation tiers" ON public.donation_tiers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete donation tiers" ON public.donation_tiers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down funding_rounds writes to admin
DROP POLICY IF EXISTS "Authenticated users can delete funding rounds" ON public.funding_rounds;
DROP POLICY IF EXISTS "Authenticated users can insert funding rounds" ON public.funding_rounds;
DROP POLICY IF EXISTS "Authenticated users can update funding rounds" ON public.funding_rounds;
CREATE POLICY "Admins can insert funding rounds" ON public.funding_rounds FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update funding rounds" ON public.funding_rounds FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete funding rounds" ON public.funding_rounds FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down waitlist writes to admin (keep public insert for signups)
DROP POLICY IF EXISTS "Authenticated users can delete waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated users can update waitlist" ON public.waitlist;
CREATE POLICY "Admins can update waitlist" ON public.waitlist FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete waitlist" ON public.waitlist FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lock down donations writes to admin (keep public insert)
DROP POLICY IF EXISTS "Authenticated users can delete donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can update donations" ON public.donations;
CREATE POLICY "Admins can update donations" ON public.donations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete donations" ON public.donations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
