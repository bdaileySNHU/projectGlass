# Product Backlog — projectGlass

## Status legend

- **Implemented — unverified:** source exists; needs recorded quality/live verification before Done.
- **Ready:** sufficiently defined for a sprint.
- **Backlog:** valuable but not scheduled.
- **Decision gate:** requires Bryan’s explicit product or hardware decision before work begins.

## Implemented baseline awaiting verification

### E6 — Categories and Photo Narratives

**Status:** Implemented — unverified (`e34ca18`)

- Filter gallery by Location and Genre.
- Preserve filter state across lightbox use.
- Render optional photo narratives.

**Verification:** quality gate, mobile/desktop filtering, filtered lightbox navigation, narrative rendering with/without description.

### E8 — Inquiry and Privacy-first Analytics

**Status:** Implemented — unverified (`c3f0b8a`)

- Print inquiry link includes the current photo identity.
- Umami is conditionally configured through environment variables.

**Verification:** disabled local-development behavior, production configuration, no-cookie/provider behavior, encoded mail link, no visual clutter.

### E9 — Framed Office Slideshow

**Status:** Implemented — unverified (`0ed5c95`)

- Dedicated slideshow route presents one image in a framed-poster treatment.
- Controls support playback and manual navigation.

**Verification:** real 16:9 TV, portrait/landscape composition, readable footer, fullscreen/kiosk behavior, overnight stability.

## Ready

### E10 — Release Hardening and Content Validation

**Priority:** P0  
**Sprint:** 001

**Stories:**

1. **E10.1 Quality gate repair** — restore green tests, lint, types, and build without weakening standards.
2. **E10.2 Photo validator** — fail on unmatched asset, duplicate ID, blank alt text, or empty tag taxonomy.
3. **E10.3 Operational truth** — document actual manual deployment and evidence-based story status.

**Acceptance criteria:** every quality command exits 0; the validator reports actionable failures; docs reflect observed deployment behavior.

### E11 — Office Display Validation and Kiosk Readiness

**Priority:** P1  
**Sprint:** 002

**Stories:**

1. **E11.1 Visual fidelity** — white/off-white matte, black keyline, editorial footer, no photo cropping.
2. **E11.2 TV interaction** — timed rotation, pause/play, next/previous, transient controls, reduced-motion behavior.
3. **E11.3 Device runbook** — choose and document player hardware, URL, fullscreen/kiosk setup, startup/recovery behavior.

**Acceptance criteria:** a real office display runs the route for a sustained session; all photo orientations look intentional; metadata is readable from normal office distance.

### E12 — Review-Gated Photo Ingestion

**Priority:** P1  
**Sprint:** 003

**Stories:**

1. **E12.1 Incoming source boundary** — ignored/external incoming directory and documented Lightroom/Photos export preset.
2. **E12.2 Derivative generation** — generate web/TV output, retain stable IDs, extract EXIF/dimensions.
3. **E12.3 Draft curation queue** — create metadata drafts and validation report without auto-publication.
4. **E12.4 Review handoff** — create a branch/PR or equivalent reviewable change set after curation.

**Acceptance criteria:** an exported image becomes a validated draft with no original file committed; human review is required before `main` receives it.

### E13 — Automated Verification and Deployment

**Priority:** P1  
**Sprint:** 004

**Stories:**

1. **E13.1 CI checks** — run validation, tests, lint, type-check, and production build for pull requests and `main`.
2. **E13.2 Controlled deployment** — deploy only after green `main` checks using configured secrets.
3. **E13.3 Post-deploy evidence and rollback** — record health check result and document restoration of a known-good release.

**Acceptance criteria:** a failing check cannot deploy; a passing merge deploys repeatably; an operator can confirm or roll back a release.

### E17 — Responsive Gallery Navigation and Shareable States

**Priority:** P1  
**Sprint:** 005

**Stories:**

1. **E17.1 Responsive filter controls** — provide a discoverable mobile filter interface with 44px-or-larger touch targets, an active-filter summary, and an explicit clear/reset action while preserving the low-chrome desktop layout.
2. **E17.2 URL-synchronized gallery state** — encode selected location and genre in public query parameters; restore them on direct load and support browser Back/Forward without losing the current filtered collection.

**Acceptance criteria:** mobile users can see, select, and clear every available filter without relying on an invisible horizontal-scroll affordance; a copied URL restores the same location/genre selection; invalid or unavailable parameters fail safely to an unfiltered or valid state; filtering, lightbox navigation, and the existing visual design remain usable at mobile and desktop widths.

**Verification:** focused unit/component coverage for query parsing and state synchronization; manual keyboard/touch checks; browser tests at 320px, 375px, 768px, and desktop widths; `npm run lint && npm run type-check && npm test && npm run build`.

## Backlog

### E14 — Display Playlists and Scheduling

**Priority:** P2 · **Decision gate:** define real office needs first.

Curated rotations such as Favorites, Japan, Wildlife, seasonal sets, or a quiet-hours schedule. Add only after the base display has device evidence.

### E16 — Discovery and Metadata Polish

**Priority:** P3

Open Graph preview image, more structured metadata, and an audit of accessibility descriptions.
