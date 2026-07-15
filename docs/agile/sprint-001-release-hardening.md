# Sprint 001 — Release Hardening and Operational Truth

**Status:** Planned  
**Goal:** Establish a trustworthy, green baseline before adding more capability on top of recently implemented features.

## Commitment

| Story | Commitment |
|---|---|
| E10.1 | Repair the full quality gate without suppressing rules broadly. |
| E10.2 | Add deterministic photo-content validation and tests. |
| E10.3 | Reconcile source, status documents, and deployment documentation. |

## Scope

- Start from current source baseline: filters/narratives, analytics/inquiry, and slideshow are implemented but not yet recorded as verified in Agile docs.
- Fix existing lint/test/type/build failures found by the quality gate.
- Add `npm run validate-photos` or equivalent with unit coverage.
- Define a controlled location/genre vocabulary in owner documentation.
- Verify live public routes after an authorized deployment.

## Not in scope

- New display visuals or TV hardware configuration.
- Image derivative processing.
- CI/CD implementation.
- New visitor-facing features.

## Acceptance criteria

- [ ] `npm test` exits 0.
- [ ] `npm run lint` exits 0 with no suppressed project-wide rules.
- [ ] `npm run type-check` exits 0.
- [ ] `npm run build` exits 0.
- [ ] The validator fails test fixtures with duplicate IDs, missing assets, blank alt text, and empty tag sets.
- [ ] The real photo collection validates after curation.
- [ ] Deployment instructions describe the current real process and live smoke checks confirm the deployed behavior.
- [ ] BMad/Agile status marks completed work only after evidence exists.

## Likely files

- `project-glass/package.json`
- `project-glass/scripts/validate-photos.ts` (new)
- `project-glass/src/utils/photoValidation.ts` (new)
- `project-glass/src/utils/photoValidation.test.ts` (new)
- `project-glass/data/photos.json`
- `project-glass/README.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `docs/agile/*`

## Verification record

Populate during execution; do not pre-check items.

| Check | Command / method | Observed result |
|---|---|---|
| Tests | `npm test` | Pending |
| Lint | `npm run lint` | Pending |
| Types | `npm run type-check` | Pending |
| Build | `npm run build` | Pending |
| Validator | `npm run validate-photos` | Pending |
| Live smoke test | gallery, filter, lightbox, inquiry | Pending |

## Definition of Done

Use [definition-of-done.md](definition-of-done.md), then create the sprint retrospective and a focused close-out commit.
