# Story 1.2: Create Data Schema and Sample Content

Status: done

## Story

As a **site owner**,
I want a defined photo data schema with sample content,
so that I can manage photos by editing JSON and adding image files to a directory.

## Acceptance Criteria

1. **Given** the project is initialized **When** `src/types/photo.ts` is created **Then** it exports `Photo` and `ExifData` interfaces matching the architecture specification **And** `alt` and `id` are required string fields on `Photo` **And** all `ExifData` fields are optional strings

2. **Given** the type definitions exist **When** `data/photos.json` is created with at least 3 sample entries **Then** each entry includes required fields (`id`, `src`, `width`, `height`, `alt`) **And** at least one entry includes a full `exif` object **And** at least one entry omits the `exif` field entirely **And** at least one entry includes a `title` and at least one omits it

3. **Given** sample JSON entries exist **When** corresponding sample images are placed in `public/photos/` **Then** each `src` path in the JSON resolves to an actual image file

## Tasks / Subtasks

- [x] Task 1: Create TypeScript interfaces (AC: #1)
  - [x] Create `src/types/photo.ts` with `ExifData` and `Photo` interfaces
  - [x] Verify `alt` is required on `Photo`, all `ExifData` fields are optional strings
  - [x] Verify interfaces use named exports (`export interface`)
  - [x] Verify TypeScript compiles without errors
- [x] Task 2: Create sample photos directory and images (AC: #3)
  - [x] Create `public/photos/` directory
  - [x] Generate at least 3 placeholder images with varied aspect ratios (landscape, portrait, landscape)
  - [x] Ensure filenames match what will be referenced in `data/photos.json`
- [x] Task 3: Create photos.json data file (AC: #2)
  - [x] Create `data/` directory at project root
  - [x] Create `data/photos.json` with at least 3 entries
  - [x] Entry 1: full `exif` object + `title` (landscape)
  - [x] Entry 2: no `exif` field + has `title` (portrait)
  - [x] Entry 3: partial `exif` (some fields only) + no `title` (landscape)
  - [x] Verify all `src` paths resolve to actual files in `public/photos/`
  - [x] Verify JSON is valid and matches the TypeScript interfaces
- [x] Task 4: Validate type safety (AC: #1, #2)
  - [x] Create a quick TypeScript validation that JSON data conforms to `Photo[]` type
  - [x] Verify `tsc --noEmit` passes with no type errors

## Dev Notes

### TypeScript Interfaces (exact from architecture)

```typescript
// src/types/photo.ts
export interface ExifData {
  camera?: string;      // "Sony A7IV"
  lens?: string;        // "24-70mm f/2.8 GM"
  focalLength?: string; // "35mm"
  aperture?: string;    // "f/8"
  shutterSpeed?: string;// "1/250s"
  iso?: string;         // "100"
}

export interface Photo {
  src: string;          // "/photos/amalfi-coast.jpg"
  width: number;        // 4000 (original px — needed for aspect ratio)
  height: number;       // 2667
  alt: string;          // "Amalfi coastline at golden hour"
  title?: string;       // "Amalfi Coast" (shown in lightbox, optional)
  exif?: ExifData;      // Optional EXIF block
}
```

[Source: architecture.md#Data Architecture]

### Data File Location

`data/photos.json` lives at **project root** (not inside `src/`). It's content, not code. Read via `fs.readFileSync` in the server component (`page.tsx`) — this happens in Story 1.3.

[Source: architecture.md#File Organization Patterns]

### JSON Design Rules

- `src`, `width`, `height`, `alt` are **required** — minimum for layout stability and accessibility
- `title` is optional — some photos speak for themselves
- `exif` is entirely optional, and every field within it is optional
- All EXIF fields are strings — displayed exactly as written, no parsing
- `width`/`height` are original image dimensions — Next.js uses these for aspect ratio (prevents CLS)
- **Array order in JSON = display order in grid**
- camelCase field names matching TypeScript interfaces exactly — no mapping layer

[Source: architecture.md#Data Architecture]

### Sample Data Structure

```json
[
  {
    "src": "/photos/amalfi-coast.jpg",
    "width": 4000,
    "height": 2667,
    "alt": "Amalfi coastline at golden hour",
    "title": "Amalfi Coast",
    "exif": {
      "camera": "Sony A7IV",
      "lens": "24-70mm f/2.8 GM",
      "focalLength": "35mm",
      "aperture": "f/8",
      "shutterSpeed": "1/250s",
      "iso": "100"
    }
  },
  {
    "src": "/photos/porto-bridge.jpg",
    "width": 3000,
    "height": 4000,
    "alt": "Dom Luís I Bridge in Porto at dusk",
    "title": "Porto Bridge"
  },
  {
    "src": "/photos/tokyo-street.jpg",
    "width": 5000,
    "height": 3333,
    "alt": "Neon-lit alley in Shinjuku at night",
    "exif": {
      "camera": "Sony A7IV",
      "aperture": "f/2.8"
    }
  }
]
```

- Entry 1: full exif + title (landscape 3:2)
- Entry 2: no exif + has title (portrait 3:4)
- Entry 3: partial exif (camera + aperture only) + no title (landscape 3:2)

### Placeholder Image Strategy

Since Bryan's actual photos aren't available yet, generate simple colored placeholder images at the specified dimensions. Use Python (`sips` or `Pillow`) or any available tool. Images should be:
- Actual JPG files (not SVGs or placeholders)
- Correct dimensions matching the `width`/`height` in the JSON
- Small file size is fine — these are dev placeholders

**IMPORTANT:** Do NOT use full-resolution dimensions (4000x2667 etc.) for placeholders — that's wasteful. Scale down proportionally (e.g., 800x533, 600x800, 1000x667) but keep the `width`/`height` in JSON as the original dimensions. Next.js Image uses the JSON dimensions for aspect ratio calculations, not the actual file pixel dimensions.

### Previous Story Intelligence (Story 1.1)

- Project lives at `project-glass/` inside `projectGlass/`
- `next.config.ts` has `output: "standalone"` and `experimental.turbopack.root: "."`
- `@/*` import alias maps to `./src/*` — use for all imports: `import { Photo } from '@/types/photo'`
- ESLint uses flat config (`eslint.config.mjs`), not `.eslintrc.json`
- Current `layout.tsx` uses Geist fonts (Story 1.3 will change to Inter)
- Current `page.tsx` is default template (Story 1.3 will replace)
- `public/` currently has default SVGs (file.svg, globe.svg, next.svg, vercel.svg, window.svg)
- TypeScript strict mode is enabled

### Anti-Patterns

- Do NOT put `data/` inside `src/` — it's content, not code
- Do NOT add a mapping/transformation layer between JSON and TypeScript — field names match exactly
- Do NOT use `any` types — all data is strongly typed
- Do NOT create API routes for data — `fs.readFileSync` in server component (Story 1.3)
- Do NOT install any additional packages
- Do NOT modify `page.tsx`, `layout.tsx`, or `globals.css` — that's Story 1.3

### Project Structure Notes

Files created by this story:
```
project-glass/
├── data/
│   └── photos.json              # Photo metadata (the "database")
├── public/
│   └── photos/                  # Image files
│       ├── amalfi-coast.jpg
│       ├── porto-bridge.jpg
│       └── tokyo-street.jpg
└── src/
    └── types/
        └── photo.ts             # Photo & ExifData interfaces
```

### References

- [Source: architecture.md#Data Architecture] — TypeScript schema, JSON design, sample data
- [Source: architecture.md#File Organization Patterns] — data/ at root, public/photos/ for images
- [Source: architecture.md#TypeScript Patterns] — interface for object shapes, strict mode, no `any`
- [Source: architecture.md#Implementation Patterns] — Export patterns (named exports for types)
- [Source: epics.md#Story 1.2] — Acceptance criteria
- [Source: prd.md#Content Management FR16-17, FR19] — JSON data management requirements
- [Source: ux-design-specification.md#Journey 3] — Owner content management workflow

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Pillow not available — used pure Python to generate PNG placeholders, then `sips` to convert to JPG
- Placeholder images use scaled-down dimensions (800x533, 600x800, 1000x667) while JSON retains original dimensions (4000x2667, 3000x4000, 5000x3333) — Next.js uses JSON dimensions for aspect ratio
- Fixed `next.config.ts`: removed `turbopack.root` setting that was causing Tailwind resolution errors (was added by Story 1.1 code review but used relative path that resolved incorrectly)
- Turbopack workspace root warning is cosmetic — caused by lockfile in parent directory, does not affect functionality

### Completion Notes List

- AC#1: `src/types/photo.ts` created with `ExifData` and `Photo` interfaces. `alt` is required string. All 6 ExifData fields are optional strings. Named exports used. `tsc --noEmit` passes cleanly.
- AC#2: `data/photos.json` created with 3 entries. Entry 1 (amalfi-coast): full exif (6 fields) + title. Entry 2 (porto-bridge): no exif + title. Entry 3 (tokyo-street): partial exif (camera + aperture) + no title. All required fields present.
- AC#3: 3 JPG placeholder images in `public/photos/` matching all `src` paths in JSON. Verified all 3 resolve correctly.
- Regression fix: removed broken `turbopack.root` from `next.config.ts`. Dev server starts cleanly (HTTP 200). `tsc --noEmit` and `eslint` both pass with zero errors.

### File List

- project-glass/src/types/photo.ts (created)
- project-glass/data/photos.json (created)
- project-glass/public/photos/amalfi-coast.jpg (created — placeholder)
- project-glass/public/photos/porto-bridge.jpg (created — placeholder)
- project-glass/public/photos/tokyo-street.jpg (created — placeholder)
- project-glass/next.config.ts (modified — removed broken turbopack.root)
