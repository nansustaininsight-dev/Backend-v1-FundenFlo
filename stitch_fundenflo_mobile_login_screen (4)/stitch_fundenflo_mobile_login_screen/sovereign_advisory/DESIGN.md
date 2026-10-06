---
name: Sovereign Advisory
colors:
  surface: '#f8f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f8f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e7e8eb'
  surface-container-highest: '#e1e2e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474d'
  inverse-surface: '#2e3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777e'
  outline-variant: '#c5c6cd'
  surface-tint: '#515f78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#0d1c32'
  on-primary-container: '#76849f'
  inverse-primary: '#b9c7e4'
  secondary: '#3f5f90'
  on-secondary: '#ffffff'
  secondary-container: '#a8c8ff'
  on-secondary-container: '#335383'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271900'
  on-tertiary-container: '#ab7c00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a8c8ff'
  on-secondary-fixed: '#001b3c'
  on-secondary-fixed-variant: '#264776'
  tertiary-fixed: '#ffdea5'
  tertiary-fixed-dim: '#ffbb06'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5d4200'
  background: '#f8f9fc'
  on-background: '#191c1e'
  surface-variant: '#e1e2e5'
  surface-base: '#F8FBFF'
  surface-subtle: '#F0F4F8'
  card-surface: '#FFFFFF'
  gold-deep: '#C59B27'
  text-muted: '#64748B'
  border-subtle: '#E2E8F0'
  status-success: '#1F7A43'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a high-trust, elite credit advisory and lender-matching experience tailored for discerning Indian businesses, high-net-worth borrowers, and enterprise founders. Its personality reflects quiet institutional power, meticulous fiduciary responsibility, and effortless sophistication—reminiscent of bespoke private banking suites rather than transactional consumer fintech.

The aesthetic fuses **Corporate / Modern minimalism** with deep architectural restraint. Visual excess, decorative illustrations, gamified micro-interactions, and generic human stock photography are completely excluded. Instead, the interface relies on precise numeric hierarchy, deliberate typographic rhythm, architectural surfaces, and refined metallics to project reliability, confidentiality, and calm authority.

## Colors

The palette establishes an authoritative fiscal atmosphere anchored in double-tone maritime navies, balanced by warm bullion golds, and framed within crystalline cool-tinted paper surfaces:

- **Primary Navy (`#0A192F`)**: Deployed for primary actions, top-level brand anchors, and dominant interactive elements.
- **Brand Navy (`#012C5A`)**: Used for secondary focal points, structural badges, selected navigational tabs, and subtle container overlays.
- **Logo Gold (`#FDB901`) & Deep Gold (`#C59B27`)**: Reserved for high-value transactional metrics, APR indicators, advisory badges, and verified status crests. Gold is never applied to standard body copy or large fills to prevent dilution of its premium quality.
- **Surface Architecture (`#F8FBFF` & `#F0F4F8`)**: Provides foundational background depth, while pure `#FFFFFF` is strictly dedicated to foreground functional cards and floating modal structures.
- **Utility & Text**: `#191C1E` ensures severe legibility for financial figures, `#64748B` balances non-essential metadata, and `#1F7A43` denotes verified loan approvals and compliant underwriting states.

## Typography

The type system balances commanding structural authority with clean, tabular legibility. Space Grotesk is employed for headline and display levels to deliver clean geometric poise and modern structure across loan values, underwriting tiers, and key screen titles. Inter governs all operational contexts—body copy, input labels, status flags, and data matrices—guaranteeing rapid scannability on high-density mobile interfaces.

### Numerical Representation
All monetary values (INR denominations, crore/lakh representations, and percentage figures) utilize tabular figures (`font-variant-numeric: tabular-nums`) to preserve spatial alignment across comparisons and repayment amortizations.

## Layout & Spacing

The mobile layout operates on an 8pt structural grid, adapting down to a 4pt sub-grid for dense financial data tables and micro-metrics:

- **Mobile Canvas**: Outer boundary margins sit fixed at `1.25rem` (20px) to prevent card edge clipping while maximizing horizontal reading real estate on 360px–428px viewport devices.
- **Card Framing**: Internal card padding adheres strictly to `1.25rem` for standard cards and `1rem` for nested transaction tiles.
- **Vertical Hierarchy**: Spacing between unrelated functional modules conforms to `space-xl` (32px), while contiguous form controls and list groups preserve `space-md` (16px) separation.
- **Responsive Handling**: When extended to larger tablet surfaces, the content width locks into a single, centered 560px column to maintain an intimate, concierge-style native feel rather than sprawling into non-standard dashboards.

## Elevation & Depth

Visual hierarchy is communicated through subtle tonal stacking and low-contrast borders rather than heavy drop shadows:

- **Layer 0 (Canvas Base)**: `#F8FBFF` covers the root viewport background.
- **Layer 1 (Recessed Containers)**: `#F0F4F8` marks summary bars, disabled fields, and comparison tracks with 0px elevation.
- **Layer 2 (Primary Floating Surfaces)**: `#FFFFFF` cards utilize a structural outline of `1px solid #E2E8F0` backed by an ultra-soft, diffuse shadow: `0 4px 20px -2px rgba(10, 25, 47, 0.04)`.
- **Layer 3 (Modals & Advisory Drawers)**: High-priority bottom sheets apply a focused elevation: `0 -10px 40px -4px rgba(10, 25, 47, 0.12)`, overlaid against a backdrop scrim of `#0A192F` at 40% opacity with a `4px` blur filter.

## Shapes

The geometric framework follows deliberate radius zoning calibrated to functional scale:

- **Buttons & Action Triggers**: Precisely `12px` border radius, establishing a firm, modern tactile trigger.
- **Cards & Primary Modules**: Crafted with `16px` border radius, creating a comfortable visual container for dense fiscal stats.
- **Bottom Sheets & Drawers**: Engineered with a top-only radius of `24px` (`border-top-left-radius: 24px; border-top-right-radius: 24px`), anchoring the sheet securely against the mobile viewport.
- **Badges & Micro Chips**: Set at `6px` or `8px` roundedness to maintain formal precision without slipping into overly playful pill contours.

## Components

### Buttons & Interactive Controls
- **Primary CTA**: Background `#0A192F`, text `#FFFFFF`, height 52px, border radius 12px, font Inter SemiBold (15px). In active/pressed state: background `#012C5A`.
- **Advisory / High-Value CTA**: Background `#FDB901`, text `#0A192F`, height 52px, border radius 12px. Used exclusively for final underwriting sign-offs and instant match offers.
- **Secondary Ghost Button**: Surface `#FFFFFF`, border `1px solid #E2E8F0`, text `#0A192F`.

### Cards & Lender Containers
- Pure `#FFFFFF` background, `16px` radius, encapsulated by `1px solid #E2E8F0`.
- Top section holds the lending partner seal, tenure range, and max sanction limit.
- Body displays three-column tabular data: Loan Amount, Interest Rate (APR in `#0A192F` bold), and Monthly EMI.

### Input Fields & Selectors
- Height 52px, background `#FFFFFF`, border `1px solid #E2E8F0`, border radius 12px.
- Focus state: border `1.5px solid #012C5A`, without intense glowing halos.
- Label: Inter Medium 13px (`#64748B`), floating or resting cleanly above the input cell.
- Monetary inputs prefix with currency symbol (`₹`) in muted tone, transitioning to `#0A192F` upon keystroke.

### Chips & Filtering Elements
- Padding: 6px 14px, radius 8px, border `1px solid #E2E8F0`, background `#FFFFFF`, text `#64748B`.
- Selected state: background `#0A192F`, text `#FFFFFF`, border-color `#0A192F`.

### Checkboxes & Selection Tiles
- Dimensions: 20x20px with a 6px corner radius.
- Inactive: `#FFFFFF` fill with `1.5px solid #E2E8F0`. Active: `#0A192F` fill containing a sharp white checkmark glyph.

### Bottom Sheet (Lender Details & Breakdown)
- Background `#FFFFFF`, top radii `24px`, top pull-bar indicator 36x4px in `#E2E8F0`.
- Contains granular sanction metrics, amortization breakdowns, and non-disclosure clauses without visual clutter.