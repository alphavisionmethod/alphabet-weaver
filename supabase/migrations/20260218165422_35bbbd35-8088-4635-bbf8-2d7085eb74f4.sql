
-- Allow public signups to insert into user_leads (waitlist/investor forms)
CREATE POLICY "Public can insert leads" ON public.user_leads
  FOR INSERT WITH CHECK (true);
