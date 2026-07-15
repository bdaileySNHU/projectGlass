# projectGlass Agile Workspace

This directory is the operating record for the next delivery phase of `photos.bdailey.com`.

## Current baseline — 2026-07-13

Recent implementation commits materially advanced the project beyond the earlier BMad status files:

| Capability | Evidence | Planning state |
|---|---|---|
| Category filtering and photo narratives | `e34ca18` | Implemented; needs release-quality verification |
| Print inquiry and Umami integration | `c3f0b8a` | Implemented; needs privacy/configuration verification |
| Framed poster slideshow route | `0ed5c95` | Implemented; needs real TV/device validation |
| Automated ingestion and automated deployment | No implementation found | Planned |
| Responsive filter controls and shareable gallery states | No implementation found | Planned for Sprint 005 |

Do not mark a story Done merely because a commit exists. A story becomes Done after its stated quality gate and live/device verification are recorded.

## Documents

- [Roadmap](roadmap.md) — phases and release order.
- [Product backlog](product-backlog.md) — epics, stories, acceptance criteria, and priority.
- [Definition of Done](definition-of-done.md) — release and documentation gates.
- [Decision log](decision-log.md) — durable product and technical decisions.
- [Sprint retrospective template](sprint-retrospective-template.md) — close-out template.
- [Sprint 005 — Responsive Gallery Navigation](sprint-005-responsive-gallery-navigation.md) — planned mobile filter and URL-state work.
- Sprint documents — a focused commitment, acceptance criteria, verification, and close-out record for each sprint.

## Working agreement

1. Preserve the photo-first, low-chrome gallery experience.
2. Automate derivative generation and validation, not editorial judgment or public release.
3. Do not expose precise GPS data unless a photo is deliberately approved for it.
4. Keep the public gallery, TV display route, and ingestion workflow separately testable.
5. End each completed sprint with recorded verification, updated backlog/status, a focused commit, and a clean worktree.
