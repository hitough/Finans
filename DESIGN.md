# Design System Documentation: The Ethereal Ledger

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Ethereal Ledger."** 

Standard personal finance apps are often dense, utility-driven, and cluttered with rigid borders. We are moving beyond the "spreadsheet" aesthetic toward a high-end editorial experience. This system prioritizes **Atmospheric Clarity**—using light, breath, and tonal depth to guide the user’s eye. 

The goal is to make the user feel a sense of calm and mastery over their finances. We achieve this by breaking the "template" look through intentional whitespace, asymmetrical typography scales, and a complete rejection of mechanical separators in favor of organic, tonal layering.

---

## 2. Colors & Surface Logic

This system utilizes a sophisticated palette derived from Material 3 logic but applied with the precision of iOS HIG.

### The Color Palette
- **Surface (Background):** `#faf9fe` (`surface`) — A crisp, high-end neutral that provides more depth than pure white.
- **Primary (Actions):** `#0058bc` (`primary`) — A deep, authoritative blue for primary buttons and CTAs.
- **Secondary (Success/Balances):** `#006e28` (`secondary`) — Used specifically for positive financial growth and balances.
- **Tertiary (Warnings):** `#894d00` (`tertiary`) — An editorial take on orange/gold for warnings, avoiding the "cheap" look of standard alerts.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts.
- A "Grouped List" section should use `surface_container_low` (#f4f3f8).
- Elements inside that section (cards) use `surface_container_lowest` (#ffffff).
- Contrast is created through tone, not lines.

### Glass & Gradient Implementation
To elevate the UI from "web app" to "premium experience," use the **"Signature Polish"** rule:
- **Floating Elements:** Use `surface_container_lowest` with a 80% opacity and a `20px` backdrop-blur for headers or bottom navigation.
- **Primary CTAs:** Apply a subtle vertical gradient from `primary` (#0058bc) to `primary_container` (#0070eb). This adds a "jewel-like" depth that flat colors lack.

---

## 3. Typography Hierarchy

We use a high-contrast typography scale to create an editorial rhythm. The font family is **Inter** (as the web-standard equivalent to San Francisco), tracked tightly for a premium feel.

- **The Hero Statement (`display-lg`):** Reserved for the primary account balance. At `3.5rem`, it is the centerpiece of the "Ethereal Ledger."
- **Editorial Headers (`headline-lg`):** Use `2rem` for section starts. Ensure significant top-margin (32px+) to allow the layout to breathe.
- **Metadata (`label-md`):** Use `on_surface_variant` (#414755) to provide secondary information. The lower contrast creates visual hierarchy without needing to shrink the font size to unreadable levels.

---

## 4. Elevation & Tonal Layering

Hierarchy is achieved through **Tonal Layering** rather than traditional structural lines.

### The Layering Principle
Depth is created by "stacking" surface tiers. 
1. **Base Layer:** `surface` (#faf9fe)
2. **Section Layer:** `surface_container_low` (#f4f3f8) (Use for grouped list backgrounds)
3. **Interactive Layer:** `surface_container_lowest` (#ffffff) (Use for cards)

### Ambient Shadows
When an element needs to "float" (e.g., a primary action card), use an **Ambient Shadow**:
- **Color:** `on_surface` (#1a1b1f) at **4% opacity**.
- **Blur:** `24px`.
- **Y-Offset:** `8px`.
- *Result:* A shadow that mimics natural light, not a digital drop-shadow.

### The "Ghost Border" Fallback
If a border is required for accessibility, use the **Ghost Border**: `outline_variant` (#c1c6d7) at **20% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Cards & Grouped Lists
Cards use the `md` corner radius (`0.75rem` / 12px). 
- **Constraint:** Never use dividers between list items. Use 16px of vertical whitespace or a 1px `surface_container_high` (#e9e7ed) gap to separate items within a list.

### Buttons
- **Primary:** `primary` (#0058bc) background with `on_primary` (#ffffff) text. Use `full` (9999px) roundedness for a modern, friendly feel.
- **Secondary:** `surface_container_high` (#e9e7ed) background with `primary` text. This feels integrated into the surface.

### Input Fields
Inputs should not be boxes. Use a "Minimalist Underline" or a subtle "Tonal Block."
- **Background:** `surface_container_highest` (#e3e2e7).
- **Radius:** `sm` (0.25rem).
- **Interaction:** On focus, the background transitions to `surface_container_lowest` with a "Ghost Border."

### The "Balance Card" (Signature Component)
A hero component for the main balance. 
- **Style:** Pure white (`surface_container_lowest`) with an Ambient Shadow.
- **Typography:** `display-sm` for the currency symbol and `display-lg` for the amount.
- **Detail:** A 2px subtle accent of `secondary` (#006e28) at the very top or bottom of the card to signify financial health.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace Asymmetry:** Let text align left with generous right-side margins to create an editorial look.
- **Use "On-Surface" Colors:** Always use `on_surface` (#1a1b1f) for text; pure black is too harsh for this system.
- **Prioritize Breathing Room:** If a layout feels "busy," increase the spacing between containers rather than adding lines.

### Don’t:
- **Don't use 1px solid dividers.** They shatter the "Ethereal" feeling and make the UI look like a legacy system.
- **Don't use high-saturation backgrounds.** Keep the interface light and airy.
- **Don't crowd the edges.** Ensure a minimum of `1.5rem` (xl) padding on the horizontal edges of the mobile screen.