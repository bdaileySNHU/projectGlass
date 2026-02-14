---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['planning-artifacts/prd.md', 'planning-artifacts/ux-design-specification.md']
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-10'
project_name: 'projectGlass'
user_name: 'Bryan'
date: '2026-02-10'
lastEdited: '2026-02-13'
editHistory:
  - date: '2026-02-13'
    changes: 'Phase 2 extension — added PhotoTags interface, CategoryFilter component, filter state management in Gallery, FR20-FR26 coverage. Decisions: structured tags object, Gallery owns all state, pure client state filtering, instant swap rendering.'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

19 FRs across 5 capability areas. Architecturally, these reduce to three concerns:

1. **Display photos in a responsive grid** (FR1-5) — The core product surface. Requires responsive layout engine (masonry on tablet/desktop, single-column feed on mobile), continuous scroll, and below-fold discovery.

2. **Immersive photo viewing with metadata** (FR6-11) — Lightbox overlay with EXIF data. Requires overlay management, scroll lock, focus trapping, and graceful handling of optional metadata fields.

3. **Content pipeline** (FR12-19) — Images served optimized from filesystem, metadata from JSON, deployed via git push. Requires static generation, image optimization pipeline, and a clean data schema.

**Non-Functional Requirements:**

| NFR | Architectural Impact |
|-----|---------------------|
| Load < 2s (NFR1) | SSG + CDN, optimized images, minimal JS bundle |
| Instant lightbox (NFR2) | Grid images already loaded; lightbox reuses them |
| CLS < 0.1 (NFR3) | Aspect-ratio placeholders from JSON width/height |
| Next-gen formats (NFR4) | Next.js Image component handles WebP/AVIF serving |
| Alt text (NFR5) | Required field in JSON schema, enforced by TypeScript |
| Semantic HTML (NFR6) | Component structure uses header/main/figure elements |
| Color contrast (NFR7) | Tokyo Night palette pre-verified (11:1 / 8.5:1 / 3.5:1) |

**Scale & Complexity:**

- **Primary domain:** Static web (SSG)
- **Complexity level:** Low
- **Estimated architectural components:** 3 UI components + 1 data layer + 1 page
- No server-side logic, no database, no authentication, no API endpoints, no real-time features, no client-side routing

### Technical Constraints & Dependencies

**Predetermined by stakeholder:**
- Next.js 16.1 (App Router) — framework
- Tailwind CSS v4 — styling
- `react-photo-album` v3.4.0 — grid layout engine
- `yet-another-react-lightbox` v3.28.0 — lightbox component
- Self-hosted VPS — hosting (standalone Node.js + nginx)
- TypeScript — type safety
- Flat-file JSON — content data source

**Implied by requirements:**
- Next.js standalone output mode — required for self-hosted VPS with image optimization
- Next.js `<Image>` component — required for WebP/AVIF and responsive srcset
- No client-side routing — single page, no navigation needed

### Cross-Cutting Concerns

1. **Image optimization** — Affects both grid rendering and lightbox display. Next.js Image component handles format negotiation and srcset, but `sizes` attribute must be correctly configured per breakpoint to avoid serving oversized images.

2. **Responsive layout** — Not just CSS breakpoints. The mobile layout is architecturally different from tablet/desktop (vertical feed vs. masonry grid). This is a component-level concern, not just styling.

3. **Data schema design** — The JSON schema is the contract between Bryan (content author) and the application. It must be simple enough for manual editing, typed enough for TypeScript safety, and flexible enough for optional EXIF data. This is the highest-leverage architectural decision.

4. **Bundle size** — For a <2s load target, every dependency matters. `react-photo-album` + `yet-another-react-lightbox` + Next.js framework JS must stay minimal. No unnecessary dependencies.

## Starter Template Evaluation

### Technical Preferences (Predetermined)

All major technology decisions were made by the stakeholder in the project brief:

- **Language:** TypeScript (non-negotiable)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Hosting:** Self-hosted VPS (standalone Node.js + nginx reverse proxy)
- **Grid library:** `react-photo-album` v3.4.0
- **Lightbox library:** `yet-another-react-lightbox` v3.28.0
- **Data source:** Flat-file JSON

### Version Discovery

| Technology | Version | Source |
|-----------|---------|--------|
| Next.js | **16.1** (latest stable) | [Next.js releases](https://github.com/vercel/next.js/releases) |
| Tailwind CSS | **v4** (CSS-first config) | [Tailwind v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) |
| react-photo-album | **3.4.0** | [npm](https://www.npmjs.com/package/react-photo-album) |
| yet-another-react-lightbox | **3.28.0** | [npm](https://www.npmjs.com/package/yet-another-react-lightbox) |
| React | 19 (bundled with Next.js 16) | Included with Next.js |
| TypeScript | Latest (bundled with create-next-app) | Included with Next.js |

### Selected Starter: `create-next-app`

**Rationale:** The official Next.js CLI starter is the only sensible choice. No third-party boilerplate needed.

**Initialization Command:**

```bash
npx create-next-app@latest project-glass --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-npm
```

**Post-initialization:**

```bash
cd project-glass
npm install react-photo-album yet-another-react-lightbox
```

### Deployment Strategy: Standalone Node.js on VPS

**Decision:** Self-hosted on existing VPS using Next.js standalone output mode, reverse-proxied through nginx.

**Rationale:**
- Bryan already has a VPS — no additional hosting cost
- Standalone mode provides full Next.js Image optimization (WebP/AVIF, responsive srcset, on-demand resizing)
- PM2 keeps the process alive with zero-downtime restarts
- Nginx reverse proxy handles TLS termination and serves as a production-grade front door

**Production Stack:**

| Layer | Technology | Role |
|-------|-----------|------|
| Reverse proxy | nginx | TLS termination, static asset caching, proxy to Node.js |
| Process manager | PM2 | Keep Node.js alive, auto-restart, log management |
| Application | Next.js standalone | Server-side image optimization, static page serving |
| DNS | `photos.bdailey.com` | A/AAAA record pointing to VPS IP |

**Next.js Configuration:**

```js
// next.config.js
const nextConfig = {
  output: 'standalone',
};
```

The `standalone` output produces a self-contained `server.js` that includes only the necessary dependencies — no need for `node_modules` in production.

**Deploy Flow:**

```
git push origin main
  → SSH to VPS (manual or webhook)
  → git pull
  → npm run build
  → pm2 restart glass
```

**Future Enhancement:** A simple webhook listener or GitHub Actions workflow can automate the SSH + build + restart step for push-to-deploy.

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript with strict mode
- React 19 (via Next.js 16)
- Node.js runtime for both build and production serving

**Styling Solution:**
- Tailwind CSS v4 with CSS-first configuration
- No `tailwind.config.js` needed — design tokens defined in CSS via `@theme`
- `@tailwindcss/postcss` plugin pre-configured

**Build Tooling:**
- Turbopack for development (fast HMR)
- Next.js compiler for production builds
- Standalone output for self-hosted deployment

**Code Organization:**
- `src/app/` — App Router pages and layouts
- `src/` directory for all application code
- `@/*` import alias for clean imports
- `public/photos/` for photo assets

**Development Experience:**
- Hot module replacement via Turbopack
- TypeScript type-checking
- ESLint for code quality
- Local dev via `npm run dev`, production preview via `npm run build && npm start`

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. JSON data schema — contract between content author and application
2. Project file structure — where code lives
3. Component ownership — which component owns which state

**Important Decisions (Shape Architecture):**
4. Image sizing strategy — how Next.js `<Image>` `sizes` attribute is configured per breakpoint
5. Lightbox data flow — how photo data reaches the lightbox from the grid

**Deferred Decisions (Post-MVP):**
- CI/CD automation (webhook or GitHub Actions)
- Error tracking (Sentry)
- Analytics integration
- Image preloading strategy

### Data Architecture

**Decision: Flat-file JSON with TypeScript interfaces**

No database. All photo metadata lives in `data/photos.json` and is loaded at request time by the Next.js page component.

**TypeScript Schema:**

```typescript
// src/types/photo.ts
interface ExifData {
  camera?: string;      // "Sony A7IV"
  lens?: string;        // "24-70mm f/2.8 GM"
  focalLength?: string; // "35mm"
  aperture?: string;    // "f/8"
  shutterSpeed?: string;// "1/250s"
  iso?: string;         // "100"
}

interface PhotoTags {
  location: string[];   // ["Japan", "Tokyo"] — title case, displayed as-is
  genre: string[];      // ["Street", "Architecture"] — title case, displayed as-is
}

interface Photo {
  src: string;          // "/photos/amalfi-coast.jpg"
  width: number;        // 4000 (original px — needed for aspect ratio)
  height: number;       // 2667
  alt: string;          // "Amalfi coastline at golden hour"
  title?: string;       // "Amalfi Coast" (shown in lightbox, optional)
  exif?: ExifData;      // Optional EXIF block
  tags: PhotoTags;      // Required — at least one value across both arrays (Phase 2)
}
```

**Design Rationale:**
- `src`, `width`, `height`, `alt` are required — minimum for layout stability and accessibility
- `title` is optional — some photos speak for themselves
- `exif` is entirely optional, and every field within it is optional. No "N/A" placeholders.
- All EXIF fields are strings — displayed exactly as written. No parsing or formatting logic.
- `width`/`height` are original image dimensions — Next.js uses these for aspect ratio, preventing CLS
- Array order in JSON = display order in grid
- `tags` is required (Phase 2) — every photo must have at least one Location or Genre tag
- Tags use title case as-is — no normalization layer. What Bryan types in JSON is what visitors see.
- Two dimensions (Location, Genre) grouped under `tags` object for clean separation and future extensibility

**Sample Data:**

```json
[
  {
    "src": "/photos/amalfi-coast.jpg",
    "width": 4000,
    "height": 2667,
    "alt": "Amalfi coastline at golden hour",
    "title": "Amalfi Coast",
    "tags": {
      "location": ["Italy", "Amalfi Coast"],
      "genre": ["Landscape"]
    },
    "exif": {
      "camera": "Sony A7IV",
      "lens": "24-70mm f/2.8 GM",
      "aperture": "f/8",
      "shutterSpeed": "1/250s",
      "iso": "100"
    }
  }
]
```

**Data Loading:** `page.tsx` reads `data/photos.json` via `fs.readFileSync` at request time (server component). No client-side data fetching. No API endpoint.

### Authentication & Security

**Decision: Not applicable.**

Public site. No user accounts, no protected resources, no API endpoints to secure. Only security consideration is standard nginx hardening on the VPS (TLS via Let's Encrypt, security headers).

### API & Communication Patterns

**Decision: No API.**

No server-side endpoints for MVP. Data flows from JSON file → server component → client components via props. All rendering happens server-side or as static content.

### Frontend Architecture

**State Management:**
- React `useState` only. No global state library. No context providers. No reducers.
- The Gallery component owns all client-side state. `page.tsx` is a thin shell.
- **MVP state:** `selectedPhotoIndex: number | null`
- **Phase 2 state (filtering):**
  - `activeLocation: string | null` — currently selected Location filter (`null` = "All")
  - `activeGenre: string | null` — currently selected Genre filter (`null` = "All")
  - `filteredPhotos: Photo[]` — derived via `useMemo` from full photos array + active filters
  - Unique tag lists (all locations, all genres) derived via `useMemo` on mount — computed once since photos come from server props
- Filter state is pure client state — no URL params, resets on page reload. Filters persist across lightbox open/close because Gallery never unmounts.

**Component Architecture:**

```
src/
  app/
    layout.tsx        — Root layout (html, body, font, dark bg)
    page.tsx          — Home page (loads JSON, renders header + gallery)
    globals.css       — Tailwind directives + Tokyo Night @theme
  components/
    Gallery.tsx       — Grid/feed + lightbox integration (owns all client state)
    PhotoCard.tsx     — Individual photo in grid (Next.js Image + hover)
    CategoryFilter.tsx — Location/Genre tag filter controls (Phase 2)
    Header.tsx        — Site title
  types/
    photo.ts          — Photo, ExifData, & PhotoTags interfaces
data/
  photos.json         — Photo metadata
public/
  photos/             — Image files
```

**Key Decisions:**
- `Gallery.tsx` is a client component (`"use client"`) — it manages lightbox state, filter state, and user interactions
- `CategoryFilter.tsx` is rendered within Gallery (client boundary) — receives tag lists and active filters as props, fires callbacks on selection
- `PhotoCard.tsx` is rendered within Gallery — receives photo data as props
- `Header.tsx` can be a server component — no interactivity
- `page.tsx` is a server component — reads JSON, passes data to Gallery
- `layout.tsx` is a server component — sets up html, body, font loading, background color

**Image Sizing Strategy:**

```tsx
// Next.js Image sizes attribute per breakpoint
// Mobile (<640px): full-width single column
// Tablet (640-1024px): 2 columns → ~50vw
// Desktop (>1024px): 3 columns within max-w-7xl → ~33vw capped
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

This ensures Next.js serves appropriately sized images — not a 4000px image to a phone.

### Infrastructure & Deployment

Covered in Starter Template Evaluation section. Key decisions:
- Standalone Node.js output
- Nginx reverse proxy with TLS
- PM2 process management
- Manual deploy for MVP (git pull + build + restart)

### Categories Explicitly Not Applicable

| Category | Status | Reason |
|----------|--------|--------|
| Database | N/A | Flat-file JSON |
| Authentication | N/A | Public site |
| Authorization | N/A | No protected resources |
| API endpoints | N/A | No server-side API |
| Rate limiting | N/A | No API to rate-limit |
| Multi-tenancy | N/A | Single-user content |
| Scaling | N/A | Personal site, single VPS sufficient |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (create-next-app + dependencies)
2. TypeScript interfaces and JSON schema
3. Root layout with Tokyo Night theme
4. Header component
5. Gallery grid component (mobile feed + masonry)
6. Lightbox integration
7. Deployment configuration (standalone + nginx + PM2)

**Cross-Component Dependencies:**
- `Photo` type is shared across all components — define first
- Gallery depends on PhotoCard — build PhotoCard first
- Lightbox depends on Gallery state — integrate after grid works
- Deployment config is independent — can be set up in parallel

## Implementation Patterns & Consistency Rules

### Relevant Conflict Points

| Conflict Area | Risk | Why It Matters |
|--------------|------|----------------|
| File naming | Medium | PascalCase vs kebab-case for components |
| Component boundaries | Medium | Server vs client component decisions |
| Tailwind patterns | Medium | Utility classes vs custom CSS |
| Import style | Low | Relative vs absolute paths |
| TypeScript style | Low | `interface` vs `type`, export patterns |

### Naming Patterns

**File Naming:**
- React components: `PascalCase.tsx` — `Gallery.tsx`, `PhotoCard.tsx`, `Header.tsx`
- Type definitions: `camelCase.ts` — `photo.ts`
- Page/layout files: `lowercase.tsx` per Next.js convention — `page.tsx`, `layout.tsx`
- CSS files: `lowercase.css` — `globals.css`
- Data files: `camelCase.json` — `photos.json`

**Component Naming:**
- PascalCase for all React components: `Gallery`, `PhotoCard`, `Header`
- Match filename to component name exactly

**Variable/Function Naming:**
- `camelCase` for all variables, functions, and props: `selectedPhotoIndex`, `handlePhotoClick`
- Boolean variables prefixed with `is`/`has`/`should`: `isLightboxOpen`

**JSON Field Naming:**
- `camelCase` in `photos.json`: `shutterSpeed`, `focalLength`
- Matches TypeScript interface field names exactly — no mapping layer needed

### Structure Patterns

**Server vs Client Component Rules:**

| File | Component Type | Reason |
|------|---------------|--------|
| `layout.tsx` | Server | No interactivity — sets up HTML structure |
| `page.tsx` | Server | Reads JSON data, passes to children |
| `Header.tsx` | Server | No interactivity — pure render |
| `Gallery.tsx` | **Client** (`"use client"`) | Manages lightbox state, filter state, handles interactions |
| `CategoryFilter.tsx` | Client | Rendered within Gallery (client boundary), handles filter selection |
| `PhotoCard.tsx` | Client | Rendered within Gallery (client boundary), handles hover |

**Rule:** Only add `"use client"` where interactivity requires it. Gallery is the client boundary — everything inside it is client. Everything outside stays server.

**Import Patterns:**
- Always use absolute imports with `@/` alias: `import { Photo } from '@/types/photo'`
- Never use relative imports like `../../types/photo`
- Exception: imports within the same directory can use `./` — `import PhotoCard from './PhotoCard'`

**Export Patterns:**
- Components: `export default function ComponentName()`
- Types: `export interface Photo { ... }` (named exports)
- No barrel files (`index.ts`) — direct imports only

### Tailwind & Styling Patterns

**Rule: Tailwind utilities only. No custom CSS classes.**

All styling via Tailwind utility classes in JSX. The only CSS file is `globals.css` which contains:
1. Tailwind directives (`@import "tailwindcss"`)
2. Tokyo Night `@theme` configuration (color tokens, font)
3. Any necessary library style overrides for `yet-another-react-lightbox`

**No custom CSS classes** like `.photo-card` or `.gallery-grid`.

**Responsive pattern:** Mobile-first with `sm:` and `lg:` prefixes:
```tsx
// Good — mobile first
<div className="columns-1 sm:columns-2 lg:columns-3">

// Bad — desktop first with mobile override
<div className="columns-3 md:columns-2 sm:columns-1">
```

**Color usage:** Always use Tokyo Night CSS custom properties defined in `@theme`, never hardcoded hex values in components:
```css
/* globals.css @theme block */
@theme {
  --color-night: #1a1b26;
  --color-storm: #24283b;
  --color-dark: #16161e;
  --color-text-primary: #c0caf5;
  --color-text-secondary: #a9b1d6;
  --color-text-tertiary: #565f89;
  --color-accent: #7aa2f7;
}
```

### TypeScript Patterns

- Use `interface` for object shapes (Photo, ExifData), `type` for unions/aliases
- Strict mode enabled (from create-next-app defaults)
- No `any` types. If the type is unclear, define it.
- Props interfaces named `{Component}Props`: `GalleryProps`, `PhotoCardProps`

### Process Patterns

**Error Handling:**
- No try/catch in components — no runtime errors to catch in a static photo gallery
- If `photos.json` is malformed, the build fails — correct behavior (fail loud at build time, never at runtime)
- Missing EXIF fields render nothing — conditional rendering, not error handling

**Loading Behavior:**
- Next.js `<Image>` handles loading states natively via `placeholder` prop
- No custom loading spinners, shimmer animations, or skeleton screens for MVP
- The dark background (`--color-night`) is visible immediately — this IS the loading state

### Enforcement Guidelines

**All AI agents implementing stories MUST:**
1. Check this architecture document before writing any code
2. Use `"use client"` only on `Gallery.tsx` — not on any other component
3. Use absolute imports with `@/` alias
4. Use Tailwind utilities only — no custom CSS classes
5. Follow mobile-first responsive pattern
6. Use Tokyo Night theme variables — never hardcoded hex colors
7. Match JSON field names to TypeScript interface fields exactly
8. Use title case for tag values in `photos.json` — displayed as-is with no transformation
9. Keep filter state in Gallery.tsx — do not lift to page.tsx or create context providers
10. CategoryFilter receives data via props from Gallery — no direct data access

**Anti-Patterns to Avoid:**
- Creating new files not in the defined project structure
- Adding `"use client"` to `page.tsx` or `layout.tsx`
- Installing additional npm packages without architectural review
- Creating API routes (`app/api/`) — this is a static-first app
- Using `useEffect` for data loading — data comes from server component props
- Adding global state management (Redux, Zustand, Context) — `useState` + `useMemo` in Gallery is sufficient
- Adding URL-based filter state (query params, useSearchParams) — pure client state for now
- Adding virtualized rendering for filtering — instant swap with opacity transition is sufficient at current scale

## Project Structure & Boundaries

### Complete Project Directory Structure

```
project-glass/
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── README.md
│
├── data/
│   └── photos.json              # Photo metadata (the "database")
│
├── public/
│   └── photos/                   # Image files (Lightroom exports)
│       ├── amalfi-coast.jpg
│       ├── porto-bridge.jpg
│       └── ...
│
└── src/
    ├── app/
    │   ├── globals.css           # Tailwind directives + Tokyo Night @theme
    │   ├── layout.tsx            # Root layout (html, body, font, bg)
    │   └── page.tsx              # Home page (server component, loads JSON)
    │
    ├── components/
    │   ├── Gallery.tsx           # Grid/feed + lightbox (client component)
    │   ├── PhotoCard.tsx         # Individual photo in grid (client)
    │   └── Header.tsx            # Site title (server component)
    │
    └── types/
        └── photo.ts              # Photo & ExifData interfaces
```

11 source files + data + images (10 MVP + CategoryFilter.tsx for Phase 2).

### Architectural Boundaries

**Component Boundaries:**

```
Server Boundary                    Client Boundary
─────────────────                  ─────────────────
layout.tsx                         Gallery.tsx ("use client")
  └── page.tsx                       ├── CategoryFilter.tsx (Phase 2)
        ├── Header.tsx               ├── PhotoCard.tsx
        └── Gallery.tsx ─────────→   └── Lightbox (from library)
                                   (client boundary starts here)
```

- `page.tsx` reads `data/photos.json` via `fs` (server-side only)
- `page.tsx` passes `Photo[]` array as props to `Gallery`
- `Gallery` manages all client-side state and interactions
- `Header` is a server component — rendered once, no hydration cost

**Data Boundary:**

```
data/photos.json → fs.readFileSync (server) → page.tsx → Gallery (props: Photo[])
                                                           ├── useMemo → unique tags → CategoryFilter (props)
                                                           ├── useMemo → filteredPhotos → PhotoCard[] (props)
                                                           └── filteredPhotos → Lightbox (props)
```

One-way data flow. No mutations. No client-side data fetching. Filtering is a pure client-side derivation from the full photo array.

### Requirements to Structure Mapping

| FR Category | Files |
|-------------|-------|
| Gallery Browsing (FR1-5) | `Gallery.tsx`, `PhotoCard.tsx`, `page.tsx` |
| Photo Viewing (FR6-9) | `Gallery.tsx` (lightbox state + library integration) |
| Photo Metadata (FR10-11) | `photo.ts` (schema), `Gallery.tsx` (Captions plugin) |
| Image Optimization (FR12-15) | `PhotoCard.tsx` (Next.js `<Image>`), `next.config.js` |
| Content Management (FR16-19) | `data/photos.json`, `public/photos/` |
| Photo Organization (FR20-26) | `photo.ts` (PhotoTags), `CategoryFilter.tsx`, `Gallery.tsx` (filter state + useMemo), `data/photos.json` (tags data) |

| NFR | Files |
|-----|-------|
| Performance (NFR1-4) | `next.config.js` (standalone), `PhotoCard.tsx` (sizes attr) |
| Accessibility (NFR5-7) | `photo.ts` (alt required), `layout.tsx` (semantic HTML) |

### Data Flow

```
Bryan's Lightroom
  → Export JPGs to public/photos/
  → Edit data/photos.json (add entries)
  → git push

VPS Build:
  → next build (reads photos.json, generates pages)
  → standalone server.js produced

Runtime Request:
  → nginx receives request for photos.bdailey.com
  → Proxies to Node.js (PM2-managed)
  → page.tsx reads photos.json
  → Server renders HTML with photo grid
  → Client hydrates Gallery component
  → Visitor scrolls, taps, views lightbox
  → Next.js Image serves optimized images on-demand
```

### File Organization Patterns

**Configuration Files (root):**
- `next.config.js` — standalone output, image config
- `tsconfig.json` — TypeScript strict mode, path aliases
- `.eslintrc.json` — code quality rules
- `package.json` — dependencies and scripts

**Source Code (`src/`):**
- `app/` — Next.js App Router (pages, layouts, styles)
- `components/` — React components (flat, no subdirectories)
- `types/` — TypeScript interfaces

**Content (`data/` + `public/photos/`):**
- `data/` sits at project root, not in `src/` — it's content, not code
- `public/photos/` for image files — served directly by Next.js

**No test directory for MVP.** Testing strategy is manual browser testing.

### Deployment Structure

**Standalone build output:**
```
.next/standalone/
  ├── server.js           # Self-contained Node.js server
  ├── public/             # Static assets (copied)
  │   └── photos/
  └── .next/static/       # Client-side JS bundles
```

**PM2 ecosystem file (on VPS, not in repo):**
```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'glass',
    script: '.next/standalone/server.js',
    env: { PORT: 3000, NODE_ENV: 'production' }
  }]
};
```

**Nginx config:**
```nginx
server {
    server_name photos.bdailey.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

TLS via Let's Encrypt / certbot.

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices are compatible with no conflicts. Next.js 16.1 + React 19 + Tailwind CSS v4 + react-photo-album 3.4.0 + yet-another-react-lightbox 3.28.0 work together cleanly. Standalone output mode is the correct choice for VPS deployment with full image optimization retained.

**Pattern Consistency:** Naming conventions are internally consistent across all layers — PascalCase components, camelCase variables, camelCase JSON fields that match TypeScript interfaces directly (no mapping layer). Server vs client boundary is crisp with a single `"use client"` entry point. Mobile-first responsive pattern aligns with Tailwind conventions.

**Structure Alignment:** The 10-file project structure directly supports all architectural decisions. Content separation (data/ at root, public/photos/ for images) is clean. Component directory is flat and purposeful. Types directory isolates the shared data contract.

### Requirements Coverage Validation

**Functional Requirements — All 26 Covered (FR1-19 MVP, FR20-26 Phase 2):**

| FR Category | FRs | Architectural Support |
|-------------|-----|----------------------|
| Gallery Browsing | FR1-5 | Gallery.tsx (masonry via react-photo-album), PhotoCard.tsx, responsive breakpoints |
| Photo Viewing | FR6-9 | Gallery.tsx (lightbox state), yet-another-react-lightbox library |
| Photo Metadata | FR10-11 | photo.ts (optional ExifData interface), Captions plugin, conditional rendering |
| Image Optimization | FR12-15 | Next.js Image (WebP/AVIF, srcset), sizes attribute, width/height for CLS |
| Content Management | FR16-19 | data/photos.json + public/photos/, array order = display order, git push deploy |
| Photo Organization | FR20-22 | photo.ts (PhotoTags interface, tags required), photos.json (location/genre arrays) |
| Filtering | FR23-25 | CategoryFilter.tsx (UI), Gallery.tsx (useMemo filtering, combinable Location + Genre) |
| Filter Persistence | FR26 | Gallery.tsx state persists across lightbox open/close (component never unmounts) |

**Non-Functional Requirements — All 7 Covered:**

| NFR | Architectural Support |
|-----|----------------------|
| NFR1: Load < 2s | Server-rendered page + optimized images + minimal client JS |
| NFR2: Instant lightbox | Grid images already loaded; lightbox reuses them |
| NFR3: CLS < 0.1 | width/height required in schema → aspect-ratio placeholders |
| NFR4: Next-gen formats | Next.js Image handles WebP/AVIF negotiation automatically |
| NFR5: Alt text | `alt` is required in Photo interface (TypeScript enforced) |
| NFR6: Semantic HTML | Component structure uses header, main, figure elements |
| NFR7: Color contrast | Tokyo Night palette pre-verified (11:1 / 8.5:1 / 3.5:1 ratios) |

### Implementation Readiness Validation

**Decision Completeness:** All critical decisions documented with exact versions. Initialization commands, config files, deployment stack, and image sizing strategy all specified. AI agents have everything needed to implement without ambiguity.

**Structure Completeness:** Every source file defined with its role and server/client designation. Component boundary diagram shows data flow. Requirements-to-file mapping covers all FRs and NFRs.

**Pattern Completeness:** Naming, import, export, styling, and TypeScript patterns are comprehensive. Anti-patterns list prevents common implementation mistakes. Enforcement guidelines provide clear guardrails.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gap — LCP Image Priority:**

The architecture specifies the `sizes` attribute for responsive images but should also note the Next.js Image `priority` prop. Above-the-fold images should use `priority={true}` to disable lazy loading and improve Largest Contentful Paint. Implementation stories should mark the first ~6 images (visible on initial viewport) with `priority`.

**Nice-to-Have Gaps (not blocking):**
- Open Graph meta tags — PRD lists as nice-to-have, can be addressed in implementation stories
- Lightbox keyboard navigation — yet-another-react-lightbox supports it natively, just needs enabling

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all requirements covered, no critical gaps, proven technology stack.

**Key Strengths:**
- Extremely focused scope — 10 source files, 3 components, 1 piece of state
- Clear server/client boundary with single entry point
- JSON schema doubles as content author contract and TypeScript type safety
- Self-hosted deployment retains full Next.js image optimization
- Every requirement maps to specific files

**Areas for Future Enhancement:**
- CI/CD automation (webhook or GitHub Actions for push-to-deploy)
- EXIF auto-extraction tooling (reduce manual JSON editing)
- Image preloading strategy refinement
- Error tracking integration (Sentry)

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries — no additional files beyond the defined 10
- Refer to this document for all architectural questions
- Use `priority` prop on above-the-fold images for LCP optimization

**First Implementation Priority:**

```bash
npx create-next-app@latest project-glass --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-npm
cd project-glass
npm install react-photo-album yet-another-react-lightbox
```
