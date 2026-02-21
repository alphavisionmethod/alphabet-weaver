-- Add category and is_investor columns to waitlist for CRM segmentation
ALTER TABLE public.waitlist 
ADD COLUMN category TEXT DEFAULT 'waitlist',
ADD COLUMN is_investor BOOLEAN DEFAULT FALSE,
ADD COLUMN tier TEXT DEFAULT NULL,
ADD COLUMN amount INTEGER DEFAULT NULL;