# Grimoire Web Ecosystem Design System

Baseline untuk dashboard/aplikasi data. Proyek lain wajib punya DESIGN.md sendiri yang dibuat dari ide proyeknya.

Draft design system specification for the Grimoire Web Ecosystem (Grimoire Dashboard, Arcanum Finance, Ethol Notifier, OpenCode Console).

## Colors

The core palette establishes a modern, focused workspace.

- **Primary:** Deep slate navy (`#0F172A`) for high-contrast text and structural elements.
- **Secondary:** Neutral cool slate (`#475569`) for secondary labels and metadata.
- **Accent:** Deep indigo (`#4338CA`) ensuring WCAG AA contrast against white.
- **Surface:** Clean off-white surface (`#F8FAFC`) with pure white (`#FFFFFF`) card containers.
- **Success:** Emerald green (`#047857`) for surplus cashflow and active health checks.
- **Danger:** Deep crimson (`#B91C1C`) for deficit cashflow and offline indicators.

```yaml
colors:
  primary: "#0F172A"
  secondary: "#475569"
  accent: "#4338CA"
  surface: "#F8FAFC"
  surface-card: "#FFFFFF"
  success: "#047857"
  danger: "#B91C1C"
```

## Typography

A clean, legible typographic hierarchy combining modern sans-serif for UI and monospace for numeric data and telemetry. TODO: Tentukan font display pilihan (Inter, Outfit, Plus Jakarta Sans, atau lainnya).

- **Display & Headings:** Modern sans-serif (Inter / System Sans) with clear geometric structure.
- **Body:** Neutral sans-serif at 15px with comfortable line height (1.5).
- **Data & Telemetry:** Monospace (JetBrains Mono / Fira Code) for financial numbers, timestamps, and server metrics.

```yaml
typography:
  display-lg:
    fontFamily: Inter, sans-serif
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
  headline-md:
    fontFamily: Inter, sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: Inter, sans-serif
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  label-mono:
    fontFamily: JetBrains Mono, monospace
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
```

## Layout

A responsive modular card dashboard layout using an 8px spacing scale.

- **Grid:** Fluid 12-column grid on desktop (max width 1440px), collapsible to single-column on mobile.
- **Spacing:** Base unit 8px with progressive scales (8px, 16px, 24px, 32px).

```yaml
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
```

## Elevation & Depth

Subtle depth is created using delicate borders and soft tonal elevation rather than heavy drop shadows.

- Clean border outlines (`1px solid #E2E8F0`) define cards.
- Interactive cards receive slight elevation on hover.

## Shapes

A balanced modern corner curvature providing an approachable yet precise tool feeling.

```yaml
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
```

## Components

Core interactive component styling across portal and utility modules.

```yaml
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  card-container:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
    padding: 16px
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 6px
  badge-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 6px
```

## Do's and Don'ts

- Do maintain high contrast for all monetary and telemetry figures.
- Do use monospace typography for financial calculations and server logs.
- Don't mix multiple unrelated accent colors across submodules.
- Don't use decorative animations that slow down dashboard responsiveness.
