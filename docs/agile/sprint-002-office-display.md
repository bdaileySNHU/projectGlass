# Sprint 002 — Office Display Validation and Kiosk Readiness

**Status:** Planned  
**Goal:** Prove that the framed-poster slideshow works as an actual office display, not merely as a desktop route.

## Commitment

| Story | Commitment |
|---|---|
| E11.1 | Validate and tune framed-print composition. |
| E11.2 | Validate long-running playback and device controls. |
| E11.3 | Create a device-specific setup/recovery runbook. |

## Visual contract

- 16:9 display canvas with warm-white/off-white matte.
- Thin black keyline around the image.
- Full image remains visible; portrait photos are never cropped to fill the screen.
- Footer uses large, calm, readable metadata: camera/device and location left; exposure and lens/focal data right.
- Persistent controls are forbidden. Controls may appear transiently after input.

## Acceptance criteria

- [ ] `/slideshow` operates correctly at the target display’s native resolution.
- [ ] Landscape, portrait, and missing-metadata photos produce an intentional layout.
- [ ] Rotation duration, pause/play, next/previous, and no-immediate-repeat behavior are verified.
- [ ] The route handles keyboard/remote or kiosk input without exposing normal gallery chrome.
- [ ] `prefers-reduced-motion` disables or simplifies transitions.
- [ ] The display runs continuously for an agreed soak period without a blank page, runaway memory, or failure to advance.
- [ ] A runbook documents player device, fullscreen/kiosk URL, launch-on-boot behavior, network recovery, and manual exit.

## Decision gate

Choose the actual player before declaring the sprint Done: browser-capable TV, Apple TV-adjacent solution, Mac mini, or small dedicated kiosk. The route remains web-based; this sprint documents the operational choice rather than adding a native client.

## Likely files

- `project-glass/src/app/slideshow/page.tsx`
- `project-glass/src/components/Slideshow.tsx`
- `project-glass/src/utils/poster.ts`
- `project-glass/src/utils/poster.test.ts`
- `project-glass/src/app/globals.css`
- `docs/operations/office-display.md` (new)

## Verification record

| Check | Method | Observed result |
|---|---|---|
| Automated tests | `npm test` | Pending |
| Full quality gate | Definition of Done commands | Pending |
| Resolution/layout | target TV/device | Pending |
| Input controls | target remote/keyboard | Pending |
| Soak test | agreed duration | Pending |

## Out of scope

- New image-ingestion automation.
- Public gallery autoplay.
- Playlist scheduling beyond a simple default rotation.
