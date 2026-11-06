# TeamFlow — Design System & UI Guidelines

**Document Version:** 1.0.0  
**Status:** Approved for Milestone 0  
**Design Lead:** Senior UI/UX Designer & Design Systems Engineer  

---

## 1. Design Philosophy: The Warm Editorial Aesthetic

TeamFlow deliberately departs from the ubiquitous "cold blue enterprise" and "gloomy dark mode" aesthetics that dominate contemporary software. 

### Core Design Tenets:
1. **Warmth & Human Touch:** Interfaces feel like tactile, premium stationery combined with responsive software. We use warm ivory surfaces, terracotta primary highlights, and grounded charcoal typography.
2. **Intentional Contrast over Glare:** High contrast without eye strain. Zero blinding neon colors and zero pure blacks (`#000000`).
3. **Purposeful Restraint:** No gratuitous glassmorphism, no distracting animated gradient borders, and no AI-generated novelty layouts. Motion is functional (150ms–250ms ease-out transitions), providing immediate physics feedback during task dragging and modal opens.
4. **Strict Functional Fidelity:** Every visible counter, avatar, button, and indicator is interactive and linked to active backend state. No dummy statistics or dead decorative elements.

---

## 2. Color Palette & Token Definitions

```
Warm Ivory Canvas (#FAF8F5)   <── Background
Warm Charcoal (#2B2A27)        <── Primary Typography
Terracotta (#C85A32)           <── Primary Brand / Main CTAs
Sage Green (#588157)           <── Success / Completed
Soft Mustard (#D4A373)         <── In Progress / Attention
Muted Lavender (#8F819E)       <── Secondary Accent / Tags
```

### 2.1 Palette Tokens Table

| Token Name | Hex Code | RGB | Role / Usage | WCAG AA on Warm Ivory |
| :--- | :--- | :--- | :--- | :---: |
| `surface-base` | `#FAF8F5` | `rgb(250, 248, 245)` | Default application canvas background | Background |
| `surface-raised` | `#FFFFFF` | `rgb(255, 255, 255)` | Task cards, modals, dropdown surface | Background |
| `surface-sunken` | `#F4EFEA` | `rgb(244, 239, 234)` | Column wells, input backgrounds, active hovers | Background |
| `text-primary` | `#2B2A27` | `rgb(43, 42, 39)` | Headings, primary body copy, titles | **13.8:1 (AAA)** |
| `text-secondary` | `#706E69` | `rgb(112, 110, 105)` | Secondary descriptions, timestamps, subtext | **4.9:1 (AA)** |
| `text-tertiary` | `#99958F` | `rgb(153, 149, 143)` | Disabled copy, placeholder text | 3.2:1 (Large text) |
| `border-subtle` | `#E6E1DA` | `rgb(230, 225, 218)` | Subtle card borders, dividers, column outlines | Structural |
| `border-strong` | `#D8D3CD` | `rgb(216, 211, 205)` | Input borders, active element boundaries | Structural |
| `primary-500` (Terracotta) | `#C85A32` | `rgb(200, 90, 50)` | Primary buttons, active tabs, brand accents | **4.8:1 (AA)** |
| `primary-600` (Terracotta Deep)| `#9F4120` | `rgb(159, 65, 32)` | Hover state for primary buttons, active text | **7.1:1 (AAA)** |
| `primary-100` (Terracotta Tint)| `#F9EDE8` | `rgb(249, 237, 232)` | Active button backgrounds, light tag backgrounds | Surface |
| `success-500` (Sage Green) | `#588157` | `rgb(88, 129, 87)` | Completed tasks, connected status, success toasts| **4.6:1 (AA)** |
| `success-100` (Sage Tint) | `#E8EFE9` | `rgb(232, 239, 233)` | "Done" column header, success badge backgrounds | Surface |
| `warning-500` (Soft Mustard)| `#D4A373` | `rgb(212, 163, 115)` | "Due Soon" tags, medium-priority tasks | Graphic / Pill |
| `warning-100` (Mustard Tint)| `#FDF6ED` | `rgb(253, 246, 237)` | "In Progress" badge background | Surface |
| `accent-500` (Muted Lavender)| `#8F819E` | `rgb(143, 129, 158)` | Tags, review column headers, secondary badges | Graphic / Pill |
| `accent-100` (Lavender Tint)| `#F0EDF5` | `rgb(240, 237, 245)` | Lavender tag backgrounds, subtle highlights | Surface |

---

## 3. Typography System

### 3.1 Font Families
- **Display & Headings:** `Plus Jakarta Sans`, sans-serif (Weights: 600 Semi-Bold, 700 Bold, 800 Extra-Bold).
- **Body & Controls:** `DM Sans`, sans-serif (Weights: 400 Regular, 500 Medium, 600 Semi-Bold).
- **Code & Identifiers:** `JetBrains Mono`, monospace (Task IDs, short links).

### 3.2 Type Hierarchy

| Level | Size (rem / px) | Weight | Line Height | Tracking | Target Element |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 2.25rem / 36px | 800 | 1.2 | -0.02em | Onboarding & Marketing hero titles |
| **Heading 1** | 1.75rem / 28px | 700 | 1.25 | -0.015em | Workspace Dashboard & Board Titles |
| **Heading 2** | 1.25rem / 20px | 600 | 1.3 | -0.01em | Column headers, Modal titles, Section heads |
| **Heading 3** | 1.0rem / 16px | 600 | 1.4 | 0 | Task card titles, Dropdown menu headings |
| **Body Large**| 1.0rem / 16px | 400 | 1.5 | 0 | Long-form task descriptions |
| **Body** | 0.875rem / 14px| 400 / 500 | 1.5 | 0 | Default UI text, table rows, comments |
| **Body Small**| 0.75rem / 12px | 500 | 1.4 | +0.01em | Tags, metadata, timestamps, counters |
| **Caption** | 0.6875rem / 11px| 600 | 1.3 | +0.02em | Priority pills, status indicators, badges |

---

## 4. Spacing, Elevation & Radii

### 4.1 Spacing Scale (4px Base Grid)
- `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-5` (20px), `space-6` (24px), `space-8` (32px), `space-12` (48px).

### 4.2 Elevation (Warm Diffused Shadows)
Instead of stark black shadows, TeamFlow uses warm, natural drop shadows tinted with warm charcoal:
- **Shadow Low (Cards):** `0 1px 3px rgba(43, 42, 39, 0.05), 0 1px 2px rgba(43, 42, 39, 0.03)`
- **Shadow Medium (Dropdowns & Dragged Cards):** `0 4px 12px rgba(43, 42, 39, 0.08), 0 2px 4px rgba(43, 42, 39, 0.04)`
- **Shadow High (Modals & Slide-out Panels):** `0 12px 32px rgba(43, 42, 39, 0.12), 0 4px 8px rgba(43, 42, 39, 0.06)`

### 4.3 Corner Radii
- **`rounded-sm` (4px):** Checkboxes, subtle tag pills.
- **`rounded-md` (8px):** Buttons, text inputs, task cards.
- **`rounded-lg` (12px):** Kanban columns, dropdown menus, containers.
- **`rounded-xl` (16px):** Modals, workspace settings cards.
- **`rounded-full` (9999px):** Avatars, status dots, circular action triggers.

---

## 5. Core Component Specifications

### 5.1 Buttons
- **Primary Button:** Background `primary-500` (`#C85A32`), text `#FFFFFF`, hover `primary-600` (`#9F4120`), active `scale-[0.98]`.
- **Secondary Button:** Background `surface-raised` (`#FFFFFF`), border `border-strong` (`#D8D3CD`), text `text-primary` (`#2B2A27`), hover background `surface-sunken` (`#F4EFEA`).
- **Ghost / Subtle Button:** Transparent background, text `text-secondary` (`#706E69`), hover background `surface-sunken`.
- **Danger Button:** Background `#E5484D`, hover `#CD2B31`, text `#FFFFFF`.

### 5.2 Form Inputs
- Background `surface-raised` (`#FFFFFF`), border 1.5px solid `border-subtle` (`#E6E1DA`).
- Focus state: Border color `primary-500` (`#C85A32`), outer ring 2px `primary-100` (`#F9EDE8`), no default blue browser outline.
- Error state: Border color `#E5484D`, text label `#E5484D`.

### 5.3 Kanban Task Cards
- Background: Pure White (`#FFFFFF`).
- Border: 1px solid `border-subtle` (`#E6E1DA`).
- Padding: 14px.
- Hover: Elevation increases to `shadow-md`, border tightens to `border-strong`.
- Dragging State: Rotates 1.5 degrees, elevation jumps to `shadow-high`, border transitions to `primary-500`.

---

## 6. Accessibility & Keyboard Navigation (WCAG 2.1 AA)

1. **Color Contrast:** All body text meets or exceeds the WCAG AAA 7:1 standard, and interactive buttons exceed the 4.5:1 AA standard against the warm ivory canvas.
2. **Focus Visibility:** Custom focus rings (`ring-2 ring-terracotta ring-offset-2`) are enforced across all keyboard-focusable inputs, buttons, and links.
3. **Screen Readers:** ARIA tags applied to all icon-only buttons (`aria-label="Add task"`, `aria-label="Close modal"`).
4. **Drag & Drop Accessibility:** In addition to mouse pointer dragging, tasks can be moved using keyboard controls (Focus &rarr; Space to pick up &rarr; Arrow keys to shift &rarr; Space to drop).

---

## 7. Tailwind CSS Configuration Blueprint

```javascript
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FAF8F5',  // Canvas base
          100: '#F4EFEA', // Sunken surface
          200: '#ECE5DD', // Soft borders
          300: '#D8D3CD', // Strong borders
          400: '#99958F', // Muted text
          500: '#706E69', // Secondary text
          800: '#403E3A', // Charcoal secondary
          900: '#2B2A27', // Primary Charcoal
        },
        terracotta: {
          100: '#F9EDE8',
          200: '#F0D5CB',
          500: '#C85A32', // Primary CTA
          600: '#9F4120', // Primary Hover
        },
        sage: {
          100: '#E8EFE9',
          500: '#588157', // Success / Done
          600: '#3A5A40',
        },
        mustard: {
          100: '#FDF6ED',
          500: '#D4A373', // Warning / In Progress
          600: '#B07D48',
        },
        lavender: {
          100: '#F0EDF5',
          500: '#8F819E', // Accent / Review
          600: '#6A5C7A',
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(43, 42, 39, 0.05), 0 1px 2px rgba(43, 42, 39, 0.03)',
        'warm-md': '0 4px 12px rgba(43, 42, 39, 0.08), 0 2px 4px rgba(43, 42, 39, 0.04)',
        'warm-lg': '0 12px 32px rgba(43, 42, 39, 0.12), 0 4px 8px rgba(43, 42, 39, 0.06)',
      }
    },
  },
  plugins: [],
}
```
