# Epic 2 Retrospective: Photo Gallery Browsing

**Epic Goal:** Visitors can browse all photos in a responsive, fast-loading grid on any device — mobile feed, tablet masonry, desktop masonry with hover effects.

**Status:** Done
**Stories:** 2.1, 2.2 — all completed
**Agents:** Claude Opus 4.6 (2.1 dev + 2.2 code review), Gemini 2.0 Flash (2.1 code review + 2.2 create-story + 2.2 dev)

---

## What Went Well

- **react-photo-album v3 integration was smooth.** The library's `render.image` callback with `RenderImageProps` + `RenderImageContext` types made it clean to inject Next.js `<Image>` with custom rendering. The `columns` function prop for responsive breakpoints worked as documented.
- **Multi-agent workflow worked.** Claude handled 2.1 dev and 2.2 review; Gemini handled 2.1 review, 2.2 create-story, and 2.2 dev. The story files provided enough context for both agents to work independently without drift.
- **Code reviews caught real issues.** Gemini's 2.1 review improved `defaultContainerWidth` (1200→400 for mobile-first SSR), added aspect-ratio safety fallback, and added `figcaption`. Claude's 2.2 review caught the broken priority prop and removed a fragile type cast.
- **Semantic HTML maintained.** `<figure>` wrapping each photo, `<figcaption>` for titles (screen-reader only), `<main>` wrapper — NFR6 satisfied throughout.

## What Didn't Go Well

- **Priority prop smuggling failed silently.** Gemini's approach of injecting `priority` via `{ ...context.photo, priority: context.index < 6 } as Photo` compiled without error but the prop didn't reach the `<Image>` component in the HTML. The `as Photo` type assertion masked the problem. Lesson: **type assertions bypass safety — avoid them when passing props through library callbacks.**
- **Next.js 16 `fetchpriority` behavior is undocumented.** We expected `priority={true}` to emit `fetchpriority="high"` in the HTML (as in Next.js 14/15). Next.js 16 only removes `loading="lazy"` — the LCP optimization still works but the observable behavior changed. This wasted investigation time during code review.
- **Story 2.2 had no `onClick` handler prep.** Story 2.1's story spec mentioned adding an `onClick` handler to prep for Story 3.1 (lightbox), but it was correctly not implemented (dead code). However, the spec should have been clearer — it created ambiguity about completeness.

## Lessons for Epic 3

1. **Avoid `as Type` casts when passing through library render callbacks.** Pass additional data as separate function parameters instead of smuggling through the library's photo object.
2. **Next.js 16 Image `priority` prop removes `loading="lazy"` but does NOT add `fetchpriority="high"`.** Don't rely on HTML attribute inspection to verify priority — check for the *absence* of `loading="lazy"` instead.
3. **react-photo-album's `onClick` handler receives `{ event, photo, index }`.** Story 3.1 will need this for lightbox integration. The `index` is critical for `selectedPhotoIndex` state.
4. **`defaultContainerWidth={400}` is correct for mobile-first SSR.** This ensures the initial server render matches the primary audience (mobile link-sharing). Desktop users get a brief reflow on hydration — acceptable tradeoff.
5. **The `render.image` function signature is `(RenderImageProps, RenderImageContext) => ReactNode`.** Additional parameters can be appended since it's our wrapper function, not a direct library callback.

## Technical Debt

- **None.** The priority fix was applied. Type casts are removed. Code is clean.
- The `photo.title` and `photo.src` fields are accessed via the library's `Photo` type (which includes `title` and `src`), so the `as Photo` cast removal in PhotoCard didn't break any functionality.

## Metrics

| Story | Agent (Dev) | Agent (Review) | Tasks | Issues During Dev | Code Review Changes |
|-------|-------------|----------------|-------|-------------------|-------------------|
| 2.1   | Claude Opus 4.6 | Gemini 2.0 Flash | 5 | None | defaultContainerWidth fix, aspect-ratio fallback, figcaption, sizes alignment |
| 2.2   | Gemini 2.0 Flash | Claude Opus 4.6 | 4 | Type casting for priority | Priority prop fix (parameter vs smuggling), removed type cast |
