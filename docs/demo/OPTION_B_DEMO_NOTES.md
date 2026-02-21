# SITA OS Interactive Demo — Option B

## Overview

A high-fidelity interactive demo showcasing SITA OS across four presentation formats:

1. **Desktop App** — Full product UI with sidebar navigation
2. **Mobile App** — Phone-framed interface centered on screen
3. **Glasses HUD** — AR point-of-view with floating panels and parallax
4. **Desk Hologram** — Spatial UI projected above a desk scene

## Running Locally

```bash
pnpm install
pnpm dev
```

Navigate to `/demo` in your browser.

## View Modes

| Mode | Best For | Description |
|------|----------|-------------|
| Auto | General use | Picks best layout based on screen size |
| Desktop | Laptop & desktop | Standard webapp shell with collapsible receipts panel |
| Mobile | Presentations | Phone frame with touch simulation |
| Glasses | Immersive demos | AR POV with vignette, parallax, and HUD markers |
| Hologram | Investor pitch | Desk scene with projected holographic panels |

## Interactive Workflows

### Revenue Leak Detector
- Scan → 5 findings (duplicate charges, missing invoices, etc.) → Receipt minted

### Wire Transfer
- Draft → View details → **Slide-to-Approve** (mandatory) → Approved → Receipt minted

### Board Briefing
- 12 advisor stances → Recommendation summary → Receipt minted

## Key Features

- **View switching mid-flow**: State is preserved when changing views
- **Policy gates**: Every action shows PASS / DENY / ESCALATE verdict
- **Receipt minting**: Every completed workflow produces a receipt with receiptId, correlationId, capabilityId, mode, costCents, and timestamp
- **Avatar adaptation**: The presence avatar changes rendering per view mode (ring → orb → volumetric → hologram pillar)
- **Deterministic**: Fixed seed and frozen clock for reproducible demos

## Recording Guide

1. Open `/demo` — the View Mode Chooser appears
2. Select "Glasses HUD" for maximum visual impact
3. Run Revenue Leak flow end-to-end (click Start → advance through findings → receipt)
4. Use the "View" pill (top-right) to switch to "Desk Hologram" — note state continuity
5. Run Wire Transfer — demonstrate the slide-to-approve interaction
6. Run Board Briefing — show 12 advisor stances
7. Reset and repeat in Desktop mode for comparison

## Settings

- **Connector Mode**: SIM (default) — no real side effects
- **Seed**: 42 (default) — deterministic data generation
- **Frozen Time**: ON — all timestamps use `2025-11-15T09:42:17.000Z`
