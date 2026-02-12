# Epic 1 Retrospective: Project Foundation & Visual Identity

**Epic Goal:** Bryan has a running Next.js project with the Tokyo Night aesthetic, data schema, and page structure — viewable on localhost.

**Status:** Done
**Stories:** 1.1, 1.2, 1.3 — all completed
**Agent:** Claude Opus 4.6 (dev), Gemini (code review)

---

## What Went Well

- **Story specs were precise.** The dev notes in each story file included exact code implementations, anti-patterns, and previous-story intelligence. This eliminated ambiguity and kept implementation fast.
- **Incremental validation worked.** Each story ended with `tsc --noEmit`, ESLint, and HTTP 200 checks. Caught issues early rather than accumulating debt.
- **Code review caught real issues.** Gemini reviews added `id` and `priority` fields to the Photo interface (1.2), and `try/catch` error handling to page.tsx (1.3). Both were substantive improvements, not nitpicks.
- **Tailwind v4 CSS-first config landed cleanly.** The `@theme` block approach with color tokens and `--font-sans` registration worked on the first pass in Story 1.3 — no Tailwind config file needed.
- **Server component data loading pattern is simple.** `fs.readFileSync` in page.tsx with no API routes — reads well, works well.

## What Didn't Go Well

- **turbopack.root caused cascading issues across stories.** Story 1.1 code review added `experimental.turbopack.root: "."` to fix a cosmetic warning. Story 1.2 dev discovered it broke Tailwind resolution (`Can't resolve 'tailwindcss'`). Root cause: relative path `"."` resolved to wrong directory. Tried `__dirname`, also failed. Final fix: removed entirely. The cosmetic warning (caused by `~/package-lock.json`) was never worth fixing.
- **Code review introduced a regression (turbopack.root).** The 1.1 review fix was well-intentioned but untested in the full dev server context. Lesson: config changes to bundler resolution paths need a full `npm run dev` + page render test, not just `tsc --noEmit`.
- **Placeholder image generation was clunky.** Pillow wasn't available, so fell back to raw Python PNG generation + `sips` conversion to JPG. Worked but was fragile. For Epic 2, real image handling via Next.js Image will replace this.

## Lessons for Epic 2

1. **Test config changes with full dev server**, not just type checks. Bundler config (turbopack, webpack) has runtime implications that `tsc` won't catch.
2. **The turbopack workspace root warning is harmless.** Don't try to fix it — it's caused by `~/package-lock.json` and doesn't affect functionality. If it appears in Epic 2, ignore it.
3. **Code review changes should be noted in the next story's "Previous Story Intelligence" section.** The `id` and `priority` fields added to Photo in 1.2 review were important context for 1.3.
4. **`@theme` is the only Tailwind v4 config mechanism.** No `tailwind.config.js`. Color tokens defined in `@theme` become utilities (`bg-night`, `text-text-primary`). Font registration via `--font-sans: var(--font-inter)` makes `font-sans` resolve to Inter.
5. **Story 2.1 (Gallery) will be the first `"use client"` component.** All Epic 1 components are server components. The Gallery will need react-photo-album CSS imports and client-side interactivity.

## Technical Debt

- **None identified.** The codebase is minimal and clean. All stories completed their full acceptance criteria.
- The cosmetic turbopack workspace root warning persists but is documented as harmless.

## Metrics

| Story | Tasks | Issues During Dev | Code Review Changes |
|-------|-------|-------------------|-------------------|
| 1.1   | 5     | create-next-app interactive prompt (piped "No") | Added turbopack.root (later reverted), fixed font stack, updated README |
| 1.2   | 4     | Pillow unavailable (workaround), turbopack.root broke Tailwind (removed) | Added `id` and `priority` to Photo interface |
| 1.3   | 5     | None | Added try/catch to page.tsx data loading |
