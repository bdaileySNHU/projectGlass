# Roadmap — projectGlass

## Product direction

`photos.bdailey.com` has two complementary experiences:

1. **Public Gallery:** calm, mobile-first browsing, filtering, lightbox, and optional narratives.
2. **Office Display:** a hands-free 16:9 framed-print slideshow with intentional metadata and no persistent controls.

Photo ingestion is a third, owner-facing capability. It must make publishing easy without eliminating editorial review.

## Completed or implemented baseline

| Phase | Status | Evidence / verification still needed |
|---|---|---|
| Foundation, gallery, lightbox, deployment, metadata sync | Historical implementation | Existing BMad artifacts; revalidate quality gates as touched. |
| Filtering and narratives | Implemented | `e34ca18`; verify tests, responsiveness, and public deployment. |
| Print inquiry and analytics | Implemented | `c3f0b8a`; verify configuration and privacy behavior. |
| Framed-poster slideshow | Implemented | `0ed5c95`; validate on real office-TV hardware. |

## Planned delivery sequence

### Sprint 001 — Release hardening and operational truth

**Outcome:** A clean quality gate and an accurate, deployable baseline for already implemented features.

- Verify and repair test/lint/type/build failures.
- Reconcile BMad status with source and live behavior.
- Define a photo validator and content release checklist.
- Document actual deployment behavior; do not claim CI/CD until it exists.

### Sprint 002 — Office display validation and polish

**Outcome:** The framed slideshow is genuinely usable on the intended office TV.

- Validate `project-glass/src/app/slideshow/page.tsx` and `Slideshow.tsx` on 16:9 hardware.
- Confirm white matte, black keyline, readable metadata footer, portrait containment, controls, and long-running stability.
- Decide the physical player/kiosk model and document it.

### Sprint 003 — Review-gated photo ingestion

**Outcome:** A repeatable owner workflow that transforms Lightroom/Photos exports into reviewable site additions.

- Use an external or ignored incoming folder.
- Generate web/TV derivatives, extract technical metadata, and create draft entries.
- Validate asset/metadata pairings and create a review branch or PR.
- Require human curation before publication.

### Sprint 004 — CI/CD and safe VPS release automation

**Outcome:** Merges to `main` deploy safely only after validation.

- GitHub Actions runs validation, tests, lint, type-check, and build.
- Deployment is restricted to `main` and uses least-privilege SSH/secrets.
- Post-deploy health/smoke check detects a failed release.
- Rollback path is documented and tested.

### Sprint 005 — Responsive Gallery Navigation and Shareable States

**Outcome:** Visitors can comfortably filter the gallery on small screens and share a stable link to the resulting curated view.

- Replace hidden-overflow mobile filter rows with a discoverable, touch-friendly filter control.
- Keep location and genre selections synchronized to the URL, including Back/Forward navigation and direct loads.
- Provide a clear reset path and retain the existing quiet, photo-first desktop presentation.
- Verify the complete gallery/filter/lightbox journey on mobile and desktop viewport sizes.

## Later backlog

- Display playlists/rotations: Favorites, Japan, Wildlife, seasonal sets.
- Narrative polish and link-preview/SEO improvements.
- Optional privacy-first analytics review after enough real usage.
- Print workflows only if inquiry volume justifies further work.

## Explicitly deferred

Autoplay is limited to the office display route. Do not add it to normal gallery/lightbox browsing. Storefronts, accounts, raw GPS, CMS/admin UI, likes/comments, and social-feed features remain out of scope.
