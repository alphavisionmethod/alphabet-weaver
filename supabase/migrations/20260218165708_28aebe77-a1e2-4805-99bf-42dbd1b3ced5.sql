
-- Allow public read access to workflow templates and steps for demo/preview purposes
CREATE POLICY "Public can view workflow templates" ON public.workflow_templates FOR SELECT USING (true);
CREATE POLICY "Public can view workflow steps" ON public.workflow_steps FOR SELECT USING (true);
