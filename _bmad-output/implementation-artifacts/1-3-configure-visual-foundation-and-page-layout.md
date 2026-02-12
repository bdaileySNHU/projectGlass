# Story 1.3: Configure Visual Foundation and Page Layout

Status: done

## Story

As a **visitor**,
I want the site to have a polished dark aesthetic with proper structure,
so that my first impression is a curated, intentional experience.

## Acceptance Criteria

1. **Given** the project is initialized **When** `src/app/globals.css` is configured **Then** it imports Tailwind CSS and defines a `@theme` block with all Tokyo Night color tokens (night, storm, dark, text-primary, text-secondary, text-tertiary, accent)

2. **Given** the theme is configured **When** `src/app/layout.tsx` is created **Then** it sets the page background to Tokyo Night night (`#1a1b26`) **And** it loads the Inter font via `next/font/google` **And** it uses semantic `<html>` and `<body>` elements **And** it sets a page `<title>` and meta description

3. **Given** the layout exists **When** `src/components/Header.tsx` is created **Then** it renders "photos.bdailey.com" centered in `text-lg font-light tracking-wider` in primary text color **And** it uses a semantic `<header>` element **And** it has vertical padding of `py-4` to `py-6` **And** it is a server component (no `"use client"`)

4. **Given** the header and data schema exist **When** `src/app/page.tsx` is created **Then** it reads `data/photos.json` via `fs.readFileSync` (server component) **And** it renders the Header component **And** it renders a placeholder showing the photo count (to verify data loading works) **And** it uses a semantic `<main>` element **And** NFR6 (semantic HTML) is satisfied

## Tasks / Subtasks

- [x] Task 1: Configure globals.css with Tokyo Night theme (AC: #1)
  - [x] Replace current globals.css content with Tailwind import and `@theme` block
  - [x] Define all 7 Tokyo Night color tokens in `@theme`
  - [x] Remove default Geist font references and light/dark mode media query
  - [x] Set body background and text color using theme tokens
- [x] Task 2: Update layout.tsx with Inter font and dark background (AC: #2)
  - [x] Replace Geist font imports with Inter from `next/font/google`
  - [x] Set Inter as the CSS variable `--font-inter`
  - [x] Apply Inter font class to `<body>`
  - [x] Set page background to `bg-night` via Tailwind
  - [x] Set default text color to `text-text-primary`
  - [x] Update metadata: title "photos.bdailey.com" and description
  - [x] Ensure semantic `<html lang="en">` and `<body>` elements
- [x] Task 3: Create Header.tsx component (AC: #3)
  - [x] Create `src/components/` directory
  - [x] Create `Header.tsx` as a server component (no `"use client"`)
  - [x] Render "photos.bdailey.com" centered with `text-lg font-light tracking-wider`
  - [x] Use primary text color (`text-text-primary`)
  - [x] Use semantic `<header>` element with `py-6` padding
- [x] Task 4: Replace page.tsx with data-loading server component (AC: #4)
  - [x] Replace default page.tsx content entirely
  - [x] Import `fs` and `path` for server-side JSON reading
  - [x] Read `data/photos.json` via `fs.readFileSync` and parse as `Photo[]`
  - [x] Import and render `Header` component
  - [x] Render placeholder `<p>` showing photo count (e.g., "3 photos loaded")
  - [x] Wrap content in semantic `<main>` element
  - [x] Import `Photo` type using `@/types/photo` alias
- [x] Task 5: Validate and verify (AC: #1-4)
  - [x] Run `tsc --noEmit` — zero errors
  - [x] Run `npm run dev` — server starts, page renders
  - [x] Verify dark background visible in browser
  - [x] Verify Inter font loads
  - [x] Verify "photos.bdailey.com" header renders centered
  - [x] Verify photo count placeholder displays correct count (3)

## Dev Notes

### globals.css — Exact Implementation

Replace the entire file with:

```css
@import "tailwindcss";

@theme {
  --color-night: #1a1b26;
  --color-storm: #24283b;
  --color-dark: #16161e;
  --color-text-primary: #c0caf5;
  --color-text-secondary: #a9b1d6;
  --color-text-tertiary: #565f89;
  --color-accent: #7aa2f7;
}

body {
  background: var(--color-night);
  color: var(--color-text-primary);
}
```

[Source: architecture.md#Tailwind & Styling Patterns]

**CRITICAL:** Tailwind CSS v4 uses `@theme` (NOT `@theme inline`). The current file uses `@theme inline` — this must change. Remove all `:root` variables, the `prefers-color-scheme` media query, and Geist font references. This is a permanent dark theme — no light/dark toggle.

**Color tokens become Tailwind utilities:** `bg-night`, `bg-storm`, `bg-dark`, `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `text-accent`.

### layout.tsx — Exact Implementation

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "photos.bdailey.com",
  description: "Travel and vacation photography by Bryan Dailey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-night text-text-primary`}>
        {children}
      </body>
    </html>
  );
}
```

[Source: architecture.md#Frontend Architecture, ux-design-specification.md#Typography System]

**KEY CHANGES from current layout.tsx:**
- Replace `Geist` + `Geist_Mono` with `Inter` (weights 300, 400)
- Replace `--font-geist-sans` / `--font-geist-mono` with `--font-inter`
- Add `bg-night text-text-primary` to body
- Update metadata title and description
- Need to register `--font-inter` in `@theme` or use `font-[family-name:var(--font-inter)]`

**NOTE on Tailwind v4 font integration:** The `font-sans` utility in Tailwind v4 uses the `--font-sans` theme token. You may need to add `--font-sans: var(--font-inter);` to the `@theme` block so that `font-sans` resolves to Inter.

### Header.tsx — Exact Implementation

```tsx
export default function Header() {
  return (
    <header className="py-6 text-center">
      <h1 className="text-lg font-light tracking-wider text-text-primary">
        photos.bdailey.com
      </h1>
    </header>
  );
}
```

[Source: architecture.md#Frontend Architecture, ux-design-specification.md#Page Header, epics.md#Story 1.3]

**Rules:**
- NO `"use client"` — this is a server component
- `export default function` — matches architecture export pattern
- Semantic `<header>` element (NFR6)
- `text-lg font-light tracking-wider` — exact UX spec typography
- Primary text color — `text-text-primary` (maps to `#c0caf5`)

### page.tsx — Exact Implementation

```tsx
import fs from "fs";
import path from "path";
import { Photo } from "@/types/photo";
import Header from "@/components/Header";

export default function Home() {
  const filePath = path.join(process.cwd(), "data", "photos.json");
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const photos: Photo[] = JSON.parse(fileContents);

  return (
    <>
      <Header />
      <main>
        <p className="text-center text-text-secondary">
          {photos.length} photos loaded
        </p>
      </main>
    </>
  );
}
```

[Source: architecture.md#Data Architecture, architecture.md#Frontend Architecture]

**Rules:**
- Server component — NO `"use client"`, can use `fs`
- `fs.readFileSync` at request time — NOT `fetch`, NOT API route
- `path.join(process.cwd(), "data", "photos.json")` — correct path resolution
- `Photo` imported via `@/types/photo` alias
- `Header` imported via `@/components/Header` alias
- Semantic `<main>` element (NFR6)
- Placeholder displays photo count — Story 2.1 will replace this with Gallery component

### Previous Story Intelligence

**Story 1.1 (init):**
- `next.config.ts` has `output: "standalone"` only (turbopack.root was removed)
- ESLint flat config `eslint.config.mjs`
- TypeScript strict mode enabled

**Story 1.2 (data schema) — including code review changes:**
- `Photo` interface now has `id: string` (required) and `priority?: boolean` (optional) — added by code review
- `photos.json` has `id` fields on all entries
- 3 placeholder JPGs in `public/photos/`
- `data/photos.json` at project root

**Current files to modify:**
- `src/app/globals.css` — replace entirely (currently has Geist fonts + light/dark mode)
- `src/app/layout.tsx` — replace entirely (currently has Geist fonts + default metadata)
- `src/app/page.tsx` — replace entirely (currently has default create-next-app template)

**New files to create:**
- `src/components/Header.tsx`

### Anti-Patterns

- Do NOT add `"use client"` to layout.tsx, page.tsx, or Header.tsx — all are server components
- Do NOT use hardcoded hex colors in components — use Tailwind theme tokens (`text-text-primary`, `bg-night`)
- Do NOT create a `tailwind.config.js` — Tailwind v4 uses CSS-first config via `@theme`
- Do NOT keep the Geist font — replace with Inter
- Do NOT add the Gallery component — that's Story 2.1
- Do NOT fetch data via API or `useEffect` — use `fs.readFileSync` in server component
- Do NOT install additional packages

### References

- [Source: architecture.md#Tailwind & Styling Patterns] — @theme configuration, color tokens, no custom CSS classes
- [Source: architecture.md#Frontend Architecture] — Component boundaries, server vs client designation
- [Source: architecture.md#Implementation Patterns] — Naming, imports, exports, TypeScript patterns
- [Source: ux-design-specification.md#Color System] — Tokyo Night palette with exact hex values
- [Source: ux-design-specification.md#Typography System] — Inter font, type scale, weight choices
- [Source: ux-design-specification.md#Page Header] — Header spec (text-lg, font-light, tracking-wider, centered)
- [Source: epics.md#Story 1.3] — Acceptance criteria
- [Source: prd.md#NFR6] — Semantic HTML requirement

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- No errors encountered during implementation — all tasks completed cleanly
- `tsc --noEmit` passed with zero errors
- `eslint` passed with zero errors
- Dev server returned HTTP 200, page renders correctly
- Note: `bg-night` and `text-text-primary` classes moved to `globals.css` body rule (via CSS custom properties) rather than on `<body>` element in layout.tsx — background/text color applied via theme tokens in CSS, body element uses `font-sans antialiased` classes
- **Code Review Fixes**:
  - Added `try/catch` error handling and `fs.existsSync` check to `page.tsx` for robust data loading.
  - Staged all uncommitted files in `project-glass` to ensure clean workspace.
  - Verified `src/components/Header.tsx` is tracked in git.

### Completion Notes List

- AC#1: `globals.css` replaced with Tailwind import, `@theme` block containing all 7 Tokyo Night color tokens (night, storm, dark, text-primary, text-secondary, text-tertiary, accent), and `--font-sans: var(--font-inter)` for Tailwind v4 font integration. Body sets background and text color via theme tokens.
- AC#2: `layout.tsx` replaced with Inter font (weights 300, 400) via `next/font/google`. CSS variable `--font-inter` applied. Metadata updated with title "photos.bdailey.com" and description. Semantic `<html lang="en">` and `<body>` elements present.
- AC#3: `Header.tsx` created as server component (no `"use client"`). Renders "photos.bdailey.com" centered with `text-lg font-light tracking-wider text-text-primary`. Uses semantic `<header>` element with `py-6` padding.
- AC#4: `page.tsx` replaced. Reads `data/photos.json` via `fs.readFileSync` (server component). Renders Header component. Shows "3 photos loaded" placeholder. Uses semantic `<main>` element. Imports `Photo` type via `@/types/photo` alias.

### File List

- project-glass/src/app/globals.css (modified — replaced with Tokyo Night theme)
- project-glass/src/app/layout.tsx (modified — replaced with Inter font setup)
- project-glass/src/app/page.tsx (modified — replaced with data-loading server component)
- project-glass/src/components/Header.tsx (created)
