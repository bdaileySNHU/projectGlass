# Story 1.1: Initialize Next.js Project with Dependencies

Status: done

## Story

As a **site owner**,
I want the project scaffolded with all required dependencies,
so that development can begin on a solid foundation.

## Acceptance Criteria

1. **Given** no project exists yet **When** the initialization commands are run **Then** a Next.js 16.1 project is created with TypeScript, Tailwind CSS v4, ESLint, App Router, and `src/` directory
2. **And** `react-photo-album` v3.4.0 and `yet-another-react-lightbox` v3.28.0 are installed
3. **And** `next.config.ts` includes `output: 'standalone'`
4. **And** `npm run dev` starts the dev server without errors
5. **And** the `@/*` import alias resolves correctly

## Tasks / Subtasks

- [x] Task 1: Initialize Next.js project (AC: #1)
  - [x] Run `npx create-next-app@latest project-glass --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-npm` from the projectGlass directory
  - [x] Verify project scaffolded with `src/app/` directory structure
- [x] Task 2: Install additional dependencies (AC: #2)
  - [x] Run `npm install react-photo-album yet-another-react-lightbox` inside project-glass/
  - [x] Verify both packages appear in package.json dependencies with correct versions
- [x] Task 3: Configure standalone output (AC: #3)
  - [x] Edit `next.config.ts` to add `output: 'standalone'`
- [x] Task 4: Verify dev server starts (AC: #4)
  - [x] Run `npm run dev` and confirm server starts on localhost:3000 without errors
  - [x] Confirm Turbopack is active (default in Next.js 16)
- [x] Task 5: Verify import alias (AC: #5)
  - [x] Confirm `tsconfig.json` contains `"@/*": ["./src/*"]` path mapping
  - [x] Verify a test import using `@/` resolves correctly

## Dev Notes

### Initialization Command (exact)

```bash
npx create-next-app@latest project-glass --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-npm
```

[Source: architecture.md#Starter Template Evaluation]

**IMPORTANT:** In Next.js 16, TypeScript, Tailwind CSS, App Router, and Turbopack are all **ON by default**. The flags are still valid but redundant — included for explicitness. If the CLI prompts interactively, select "yes" to recommended defaults.

### Post-init Install

```bash
cd project-glass
npm install react-photo-album yet-another-react-lightbox
```

**Expected versions:** react-photo-album@3.4.0, yet-another-react-lightbox@3.28.0 (both are latest stable as of Feb 2026).

### next.config.ts Configuration

Next.js 16 with TypeScript scaffolds `next.config.ts` (NOT `.js`). The architecture references `next.config.js` but the actual generated file is TypeScript:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
}

export default nextConfig
```

[Source: architecture.md#Deployment Strategy]

### Expected Project Structure After Init

```
project-glass/
├── next.config.ts          # TypeScript config (NOT .js)
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .gitignore
├── public/
├── src/
│   └── app/
│       ├── globals.css     # Tailwind v4 CSS-first config
│       ├── layout.tsx       # Root layout
│       └── page.tsx         # Home page
└── node_modules/
```

### Critical Technical Notes

1. **Tailwind CSS v4 uses CSS-first configuration.** No `tailwind.config.js` file. Design tokens are defined via `@theme` in CSS. The scaffolded `globals.css` will already contain Tailwind directives — do NOT create a separate config file.

2. **CSS imports are mandatory for libraries.** For future stories, both `react-photo-album` and `yet-another-react-lightbox` require explicit CSS imports to render correctly:
   - `import "react-photo-album/masonry.css"` (Story 2.1)
   - `import "yet-another-react-lightbox/styles.css"` (Story 3.1)
   - `import "yet-another-react-lightbox/plugins/captions.css"` (Story 3.2)
   These are NOT needed in this story but are documented here for awareness.

3. **react-photo-album v3 is ESM-only.** No CommonJS import issues with Next.js 16 (which is ESM-native), but be aware if any tooling assumes CJS.

4. **`@/*` import alias** maps to `./src/*` in `tsconfig.json`. All future imports should use `@/` prefix (e.g., `import { Photo } from '@/types/photo'`). [Source: architecture.md#Import Patterns]

5. **Do NOT install any additional packages** beyond react-photo-album and yet-another-react-lightbox. The architecture specifies exactly these two library dependencies. [Source: architecture.md#Anti-Patterns to Avoid]

6. **Do NOT create any source files beyond what create-next-app scaffolds.** Stories 1.2 and 1.3 handle data schema, types, components, and styling. This story is purely initialization.

### Project Structure Notes

- The generated project directory is `project-glass/` inside the current working directory (`projectGlass/`)
- All subsequent stories reference paths relative to `project-glass/` root
- Alignment with architecture.md project structure: this story creates the foundation; Stories 1.2-1.3 add `data/`, `src/types/`, `src/components/`

### References

- [Source: architecture.md#Selected Starter: create-next-app] — Full initialization command and rationale
- [Source: architecture.md#Deployment Strategy: Standalone Node.js on VPS] — Standalone output config
- [Source: architecture.md#Architectural Decisions Provided by Starter] — TypeScript, Tailwind v4, Turbopack defaults
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — Import alias, naming conventions
- [Source: epics.md#Story 1.1] — Acceptance criteria source
- [Source: prd.md#Technical Success] — Project foundation requirements

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- create-next-app prompted for React Compiler (answered No) — not in architecture spec
- Turbopack root warning: detected lockfile in parent directory — cosmetic, non-blocking
- ESLint config generated as `eslint.config.mjs` (flat config), not `.eslintrc.json` — Next.js 16 default

### Completion Notes List

- AC#1: Next.js 16.1.6 project created with TypeScript, Tailwind CSS v4, ESLint, App Router, src/ directory. Verified `src/app/` structure with globals.css, layout.tsx, page.tsx.
- AC#2: react-photo-album@3.4.0 and yet-another-react-lightbox@3.28.0 installed and verified via `npm ls`.
- AC#3: `next.config.ts` updated with `output: "standalone"`.
- AC#4: Dev server started on localhost:3000, returned HTTP 200. Turbopack confirmed active (Next.js 16.1.6 Turbopack). Ready in 282ms.
- AC#5: `tsconfig.json` contains `"@/*": ["./src/*"]` path mapping. TypeScript strict mode enabled.
- [AI-Review] Verified `@/` import alias by creating temporary `test-alias.ts` and successfully running `tsc --noEmit`.
- [AI-Review] Fixed Turbopack root warning by adding `experimental.turbopack.root` to `next.config.ts`.
- [AI-Review] Corrected font stack in `globals.css` to use `var(--font-sans)`.
- [AI-Review] Replaced generic README with project-specific documentation.
- [AI-Review] Staged and committed all initialization changes.

### File List

- project-glass/next.config.ts (modified — added `output: "standalone"`)
- project-glass/package.json (modified — added react-photo-album, yet-another-react-lightbox)
- project-glass/package-lock.json (modified — dependency tree updated)
- project-glass/ (all other files created by create-next-app scaffold)
