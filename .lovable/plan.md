

# Investor Demo Enhancement Plan

This is a large enhancement to the investor demo at `/investor`, adding 10+ features that deepen the emotional impact while maintaining the "Apple, not AWS" philosophy of calm, minimalism, and confidence.

## Overview

The changes are organized into three tiers:

**Tier 1 -- Core UX (must-have)**
1. Clickable progress dots (already partially working, needs full unlock)
2. OS Activation Moment (fade-in "SITA OS Active" splash)
3. Live System Status footer
4. Calm Mode animation on phase transitions

**Tier 2 -- Emotional Impact Features**
5. "Try to Break It" button on homepage
6. Public Proof Counter (simulated stats)
7. Stress Index Meter
8. Burnout Mode toggle
9. Reversibility Toggle on receipts
10. "Show Me My Weak Spots" panel

**Tier 3 -- Advanced (Holy-Shit Tier)**
11. Trust Evolution Graph (autonomy over time)
12. Shadow World prediction overlay
13. Real-Time System Trace
14. Digital Will / Legacy Mode preview

---

## Technical Details

### 1. Clickable Progress Dots
Currently dots are only clickable for visited phases (`i <= currentIdx`). Change to allow clicking any phase freely, so investors can jump around non-linearly.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx` (line 731)
- Remove the `i <= currentIdx` guard on the click handler
- Add phase labels on hover via tooltips
- Show phase names below dots on wider screens

### 2. OS Activation Moment
A new `ActivationSplash` component shown for 2.5 seconds before the console renders.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx`
- Add `showSplash` state, initially `true`
- Render a full-screen dark overlay with "SITA OS Active" text that fades in then out
- After 2.5s, set `showSplash = false` and render the normal console
- Reset the investor ledger during splash to ensure clean state

### 3. Live System Status Footer
A subtle fixed footer bar showing system integrity status.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx`
- Add a `SystemStatusFooter` component at the bottom of the console
- Displays: `System Integrity: Verified | Mode: Simulation | Ledger Blocks: {count}`
- Updates block count reactively as phases generate ledger entries
- Uses a thin border-top with muted styling

### 4. Calm Mode Animation
When transitioning between phases, apply a soft fade with a brief pause rather than instant swap.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx`
- Already using `AnimatePresence mode="wait"` -- enhance with longer exit duration (0.4s) and a subtle scale-down on exit
- Add a 200ms pause between exit and enter

### 5. "Try to Break It" Button on Homepage
A CTA on the main landing page that links directly to the attack phase.

**File:** `src/pages/Index.tsx`
- Add a new section or button in the existing layout
- Links to `/investor?k=INVESTOR_DEMO_2026&phase=attack` (or similar)

**File:** `src/sandbox/components/investor/InvestorConsole.tsx`
- Read `phase` from URL search params to support deep-linking into any phase

### 6. Public Proof Counter
Small stat block showing simulated counters.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx`
- Add to the top bar or as a subtle element near the progress dots
- Shows: `Decisions simulated: 1,248 | Refusals: 87 | Integrity failures: 0`
- Numbers animate up on mount using a counting effect

### 7. Stress Index Meter
A subtle gauge showing stress trend.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx`
- Small pill in the header area: `Stress Trend: down-arrow 18%`
- Updates as phases progress (chaos at start, drops as system handles things)

### 8. Burnout Mode Toggle
A toggle that simplifies the interface when activated.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx`
- Add a small toggle in the header
- When ON: reduce visible panels, show only essential info, mute colors, show "Non-critical goals paused" message
- This demonstrates neuro-adaptive design

### 9. Reversibility Toggle
On the Future phase, add ability to click any projected decision and toggle "Undo Simulation."

**File:** `src/sandbox/components/investor/InvestorConsole.tsx` (FuturePhase)
- Each projection card gets a small "Undo" button
- Clicking shows: "Receipt reversed. Ledger updated." with animation
- Demonstrates reversibility as a feature

### 10. "Show Me My Weak Spots"
A panel accessible from the Future phase showing exposure analysis.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx` (FuturePhase)
- Add a "Where am I exposed?" button
- Opens a panel showing: Insurance overpaying, Lead leakage, Idle cash, Calendar inefficiency
- Each item shows a value and a suggested action

### 11. Trust Evolution Graph
A mini line chart showing autonomy level over time.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx` (FuturePhase)
- Use recharts (already installed) to render a small area chart
- X-axis: days, Y-axis: autonomy level (1 to 3.1)
- Animates as the slider moves

### 12. Shadow World Prediction Overlay
Side-by-side comparison: "If no action" vs "If action."

**File:** `src/sandbox/components/investor/InvestorConsole.tsx` (new sub-component in Future phase)
- Two columns: red (no action) vs green (with action)
- No action: Stress +12%, Cash loss $1,140, Pipeline decay
- With action: Stability up, all metrics green

### 13. Real-Time System Trace
A button that runs 5 simulated actions showing the pipeline lighting up live.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx` (accessible from Proof or Economics phase)
- "Run Full Trace" button
- Sequentially animates: intent -> policy -> ticket -> advisor -> ledger
- Shows cost tracking in real-time

### 14. Digital Will / Legacy Mode Preview
One-click "What happens if I disappear?" panel.

**File:** `src/sandbox/components/investor/InvestorConsole.tsx` (Future phase)
- Shows: asset map, instructions, emergency protocol
- Emotionally heavy, memorable moment

---

## File Change Summary

| File | Action |
|------|--------|
| `src/sandbox/components/investor/InvestorConsole.tsx` | Major rewrite -- add splash, all new sub-components, clickable dots, footer, burnout mode, deep-linking |
| `src/pages/Index.tsx` | Add "Try to Break It" CTA section |
| `src/sandbox/lib/investorSimEngine.ts` | No changes needed (existing sim engine supports all features) |

All features are client-side simulation only -- no database or edge function changes required.

