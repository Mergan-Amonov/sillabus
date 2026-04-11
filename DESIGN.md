# Silabus.uz Design System

## Brand

**Name:** Silabus.uz  
**Tagline:** Syllabus boshqaruv tizimi  
**Domain:** EdTech — university syllabus management for Uzbekistan

## Color Palette

### Primary (Teal)
Used for: CTAs, active nav, links, progress, spinners

| Token         | Hex       | Usage                          |
|---------------|-----------|--------------------------------|
| primary-50    | #E0F2F7   | Light backgrounds, badges      |
| primary-100   | #BAE6F5   | Hover states, icon bg          |
| primary-500   | #0E9DC0   | Progress bars, accents         |
| primary-600   | #0E7490   | Primary buttons, active states |
| primary-700   | #0C647E   | Hover on primary buttons       |

### Accent (Amber)
Used for: Brand dot in logo (.uz), highlights, warnings

| Token         | Hex       | Usage                          |
|---------------|-----------|--------------------------------|
| accent-50     | #FEF3C7   | Light bg                       |
| accent-100    | #FDE68A   | Badge bg                       |
| accent-500    | #F59E0B   | Icons                          |
| accent-600    | #D97706   | Logo ".uz" mark, highlights    |
| accent-700    | #B45309   | Hover                          |

### Sidebar
| Token         | Hex       | Usage               |
|---------------|-----------|---------------------|
| sidebar-bg    | #0F3460   | Sidebar background  |
| sidebar-active| #0E7490   | Active nav item bg  |

### Neutral
- Page background: `#F8F7F5` (warm off-white)
- Card background: `#FFFFFF`
- Text primary: `text-gray-900`
- Text secondary: `text-gray-500`
- Border: `border-gray-200`, warm variant `#E4E2DC`

### Semantic
- Success: `bg-green-100 text-green-800`
- Warning: `bg-yellow-100 text-yellow-800`
- Error: `bg-red-100 text-red-700`
- Draft: `bg-gray-100 text-gray-700`

## Typography

**Font:** Plus Jakarta Sans (Google Fonts)  
**Fallback:** -apple-system, BlinkMacSystemFont, sans-serif

| Scale    | Class              | Usage                     |
|----------|--------------------|---------------------------|
| xs       | text-xs (12px)     | Labels, meta info         |
| sm       | text-sm (14px)     | Body, form inputs, badges |
| base     | text-base (16px)   | Default body              |
| lg       | text-lg (18px)     | Section headings          |
| xl       | text-xl (20px)     | Card titles               |
| 2xl      | text-2xl (24px)    | Page headings             |

## Spacing & Layout

- Sidebar width: `w-64` (256px), fixed, full height
- Main content: `ml-64 p-8`
- Card padding: `p-5` or `p-6`
- Card radius: `rounded-xl`
- Card border: `border border-gray-200`
- Gap between sections: `mb-8`

## Components

### Buttons

**Primary:**
```
bg-primary-600 text-white hover:bg-primary-700 rounded-lg px-4 py-2 text-sm font-medium
```

**Ghost/Outline:**
```
border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-medium
```

**Danger:**
```
bg-red-600 text-white hover:bg-red-700 rounded-lg px-4 py-2 text-sm font-medium
```

### Form Inputs
```
w-full px-3 py-2 border border-gray-300 rounded-lg text-sm 
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
```

### Status Badges (SyllabusStatus)
- `draft` → `bg-gray-100 text-gray-700`
- `pending_review` → `bg-yellow-100 text-yellow-800`
- `approved` → `bg-green-100 text-green-800`
- `rejected` → `bg-red-100 text-red-700`
- `archived` → `bg-gray-200 text-gray-600`

### Spinner / Loading
```
animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600
```

## Sidebar Design

Dark navy sidebar with teal active state. All color via inline styles (not Tailwind) because Tailwind JIT doesn't purge arbitrary custom hex values reliably in sidebar context.

```tsx
// Sidebar bg
style={{ backgroundColor: "#0F3460" }}

// Active nav item
style={{ backgroundColor: "#0E7490", color: "#fff" }}

// Inactive nav item
style={{ color: "rgba(255,255,255,0.68)" }}

// Hover (via onMouseEnter)
style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
```

## Page Backgrounds

- Auth pages: `bg-gray-50` (slightly cooler, focuses attention on card)
- Dashboard: `#F8F7F5` warm off-white (set in globals.css body)
