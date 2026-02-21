
# Fix Fund Page, Admin, and Demo

## Problem Summary

The "Fund the Project" page (`/fund`) shows nothing when clicked because:
1. The `donation_tiers` table does not exist in the database (Supabase returns error PGRST205: "Could not find the table")
2. The `donations` table is also likely missing
3. With no tiers loaded, the page renders empty -- no cards, no way to donate

## Solution

### 1. Create Missing Database Tables (Migration)

Create a new migration to add the `donation_tiers` and `donations` tables with proper schema, RLS policies, and seed data for 3 tiers:

**Tier 1 -- Supporter ($25)**
- Icon: Heart, Color: purple
- Perks: Name on supporters wall, Early access updates, Community badge

**Tier 2 -- Builder ($100)** (marked as Popular)
- Icon: Rocket, Color: gold/amber
- Perks: Everything in Supporter, Priority feature requests, Monthly founder updates, Beta access

**Tier 3 -- Visionary ($500)**
- Icon: Crown, Color: emerald
- Perks: Everything in Builder, 1-on-1 strategy call, Advisory board nomination, Custom integration support

The migration will:
- Create `donation_tiers` table with columns: id, tier_id, name, amount, description, icon, color, perks (jsonb), is_open, popular, image_url, stripe_price_id, display_order, is_active
- Create `donations` table with columns: id, name, email, amount, tier, message, created_at, stripe_session_id
- Add RLS policies (public read for tiers, public insert for donations)
- Insert the 3 seed tiers

### 2. Add Client-Side Fallback Tiers

Update `src/pages/Fund.tsx` to include hardcoded fallback tiers so the page works even if the database query fails. If Supabase returns an error or empty data, show the 3 default tiers instead.

### 3. Fix Fund Page UX Issues

- The Stripe checkout currently opens in a new tab (`window.open`). Change to redirect in the same window (`window.location.href`) for a smoother flow.
- Improve error handling to show user-friendly messages.

### 4. Update Supabase Types

Regenerate or manually add `donation_tiers` and `donations` table types to `src/integrations/supabase/types.ts` so the code doesn't need `as any` casts.

---

## Technical Details

### Migration SQL

```sql
-- Create donation_tiers table
CREATE TABLE IF NOT EXISTS public.donation_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Heart',
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  perks JSONB NOT NULL DEFAULT '[]',
  is_open BOOLEAN NOT NULL DEFAULT false,
  popular BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  stripe_price_id TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.donation_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active tiers" ON public.donation_tiers FOR SELECT USING (is_active = true);

-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tier TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_session_id TEXT
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert donations" ON public.donations FOR INSERT WITH CHECK (true);

-- Seed 3 tiers
INSERT INTO public.donation_tiers (tier_id, name, amount, description, icon, color, perks, popular, display_order)
VALUES
  ('supporter', 'Supporter', 25, 'Back the mission and join the community', 'Heart', '#8B5CF6', '["Name on supporters wall", "Early access updates", "Community badge"]', false, 1),
  ('builder', 'Builder', 100, 'Help shape the product roadmap', 'Rocket', '#D97706', '["Everything in Supporter", "Priority feature requests", "Monthly founder updates", "Beta access"]', true, 2),
  ('visionary', 'Visionary', 500, 'Become a strategic partner in our journey', 'Crown', '#059669', '["Everything in Builder", "1-on-1 strategy call", "Advisory board nomination", "Custom integration support"]', false, 3);
```

### Fund.tsx Changes

- Add `FALLBACK_TIERS` constant with the same 3 tiers
- In the `useEffect` fetch, if `error` or `data` is empty, use `FALLBACK_TIERS`
- Change `window.open(data.url, "_blank")` to `window.location.href = data.url`

### Files Changed

| File | Change |
|------|--------|
| New migration SQL | Create tables + seed 3 tiers |
| `src/pages/Fund.tsx` | Add fallback tiers, fix Stripe redirect |
| `src/integrations/supabase/types.ts` | Add donation_tiers and donations types |
