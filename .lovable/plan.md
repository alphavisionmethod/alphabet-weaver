

# Fund Page Database + Demo Enhancement Plan

## Part 1: Create Database Tables for Fund Page

Create a migration with two tables so the Fund page uses live Supabase data instead of hardcoded fallback tiers.

### Tables to Create

**donation_tiers**
- id (UUID, primary key)
- tier_id (TEXT, unique) -- e.g. "supporter", "builder", "visionary"
- name (TEXT)
- amount (NUMERIC)
- description (TEXT)
- icon (TEXT) -- lucide icon name
- color (TEXT) -- hex color
- perks (JSONB) -- array of perk strings
- is_open (BOOLEAN) -- allow custom amounts
- popular (BOOLEAN)
- image_url (TEXT, nullable)
- stripe_price_id (TEXT, nullable)
- display_order (INTEGER)
- is_active (BOOLEAN, default true)

**donations**
- id (UUID, primary key)
- name (TEXT, nullable)
- email (TEXT)
- amount (NUMERIC)
- tier (TEXT, nullable)
- message (TEXT, nullable)
- created_at (TIMESTAMPTZ)
- stripe_session_id (TEXT, nullable)

### RLS Policies
- donation_tiers: public SELECT where is_active = true
- donations: public INSERT (anyone can donate)
- donations: SELECT restricted (admin only via auth)

### Seed Data
Insert the 3 tiers: Supporter ($25), Builder ($100, popular), Visionary ($500)

### Code Updates
- Update `src/integrations/supabase/types.ts` to add proper types for both tables (removing `as any` casts)
- Clean up Fund.tsx to use typed queries instead of `as any`

---

## Part 2: Demo Enhancements

### A. 3D Animated Avatar Orb (React Three Fiber)

Replace the current 2D CSS/SVG avatar orb in the demo with a real 3D orb using React Three Fiber. This creates a dramatic, interactive sphere that responds to the avatar state (IDLE, THINKING, CONFIRMING, WARNING, etc.).

**Implementation:**
- Install `@react-three/fiber@^8.18`, `three@^0.170`, and `@react-three/drei@^9.122.0`
- Create `src/demo/components/avatar/AvatarOrb3D.tsx` -- a Canvas with a glass-like sphere that:
  - Pulses and glows based on avatar state
  - Has animated shader distortion when THINKING
  - Emits particles when CONFIRMING
  - Turns red-tinged when WARNING
  - Responds to mouse proximity (subtle attraction)
- Integrate into `AvatarRig.tsx` as the new DesktopSkin and GlassesSkin (replacing the 2D orb), falling back to 2D for mobile/hologram views where 3D would be too heavy

### B. Voice Waveform Visualizer

Add a real-time audio waveform animation next to the avatar when in LISTENING or THINKING state:
- Create `src/demo/components/ui/WaveformVisualizer.tsx`
- Animated bars that react to simulated audio input
- Fades in/out based on avatar state

### C. Interactive Timeline Scrubber

Add a timeline at the bottom of the demo that shows all workflow events as a visual timeline:
- Create `src/demo/components/ui/TimelineScrubber.tsx`
- Shows policy gates, tool calls, and receipts as dots on a timeline
- Clicking a dot highlights that step
- Auto-scrolls as new events happen

### D. Live Metrics Dashboard Panel

Add a collapsible metrics panel showing real-time demo stats:
- Create `src/demo/components/ui/MetricsPanel.tsx`
- Shows: Total cost (cents), Policy gates passed/failed, Tool calls made, Receipts minted
- Animated counters that tick up as workflows progress
- Small sparkline charts

---

## Technical Details

### Migration SQL

```sql
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
CREATE POLICY "Anyone can view active tiers"
  ON public.donation_tiers FOR SELECT USING (is_active = true);

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
CREATE POLICY "Public can insert donations"
  ON public.donations FOR INSERT WITH CHECK (true);

INSERT INTO public.donation_tiers
  (tier_id, name, amount, description, icon, color, perks, popular, display_order)
VALUES
  ('supporter', 'Supporter', 25, 'Back the mission and join the community',
   'Heart', '#8B5CF6',
   '["Name on supporters wall","Early access updates","Community badge"]',
   false, 1),
  ('builder', 'Builder', 100, 'Help shape the product roadmap',
   'Rocket', '#D97706',
   '["Everything in Supporter","Priority feature requests","Monthly founder updates","Beta access"]',
   true, 2),
  ('visionary', 'Visionary', 500, 'Become a strategic partner in our journey',
   'Crown', '#059669',
   '["Everything in Builder","1-on-1 strategy call","Advisory board nomination","Custom integration support"]',
   false, 3);
```

### Files to Create/Modify

| File | Action |
|------|--------|
| New migration | Create donation_tiers + donations tables |
| `src/integrations/supabase/types.ts` | Add typed schemas for both tables |
| `src/pages/Fund.tsx` | Remove `as any` casts, use proper types |
| `src/demo/components/avatar/AvatarOrb3D.tsx` | New 3D orb component |
| `src/demo/components/avatar/AvatarRig.tsx` | Integrate 3D orb for desktop/glasses skins |
| `src/demo/components/ui/WaveformVisualizer.tsx` | New waveform animation |
| `src/demo/components/ui/TimelineScrubber.tsx` | New event timeline |
| `src/demo/components/ui/MetricsPanel.tsx` | New metrics dashboard |
| `src/demo/components/DemoShell.tsx` | Add timeline + metrics to shell |
| `src/demo/components/views/DesktopView.tsx` | Add metrics panel |

### New Dependencies
- `@react-three/fiber@^8.18`
- `three@^0.170`
- `@react-three/drei@^9.122.0`

