# Sprint 003 — Review-Gated Photo Ingestion

**Status:** Planned  
**Goal:** Convert a Lightroom/Photos export into a reviewable, validated website change without committing originals or auto-publishing uncurated work.

## Commitment

| Story | Commitment |
|---|---|
| E12.1 | Define the incoming-photo source boundary and export contract. |
| E12.2 | Generate fit-for-purpose web/TV derivatives and technical metadata. |
| E12.3 | Produce draft metadata plus validation report. |
| E12.4 | Hand off a reviewable change set for human curation and merge. |

## Target workflow

```text
Lightroom / Photos export
  → external or gitignored incoming directory
  → ingest command
  → web/TV derivative + EXIF/dimensions + draft metadata
  → Bryan adds title, alt text, tags, display eligibility
  → validation + reviewable branch/PR
  → merge to main
  → CI/CD deployment (Sprint 004)
```

## Acceptance criteria

- [ ] Original camera files are not committed to the website repository.
- [ ] The ingestion command produces a web/TV derivative with a documented maximum dimension/quality policy.
- [ ] Every draft entry receives stable ID, asset path, dimensions, and available technical EXIF.
- [ ] Draft entries are explicitly unpublished or fail validation until title/alt/tags are curated.
- [ ] Input errors, duplicate IDs, unreadable files, and missing derivatives fail with actionable output.
- [ ] No raw GPS is copied into public JSON automatically.
- [ ] A human must approve/publish content through a reviewable Git change; the tool never pushes or deploys automatically.

## Likely files

- `project-glass/scripts/ingest-photos.ts` (new)
- `project-glass/scripts/__tests__/ingest-photos.test.ts` (new)
- `project-glass/src/types/photo.ts`
- `project-glass/src/utils/photoValidation.ts`
- `project-glass/package.json`
- `project-glass/.gitignore`
- `project-glass/README.md`
- `docs/operations/photo-ingestion.md` (new)

## Technical notes

- Evaluate `sharp` for deterministic resize/format generation; do not assume runtime Next.js optimization alone is the ingestion solution.
- Preserve the existing `sync-photos.ts` behavior where it protects curated metadata from overwrite.
- The source folder should live outside the repository or be explicitly ignored.
- The first implementation supports one owner and one machine; avoid cloud storage, databases, or an admin UI.

## Verification record

| Check | Method | Observed result |
|---|---|---|
| Fixture ingestion | focused tests | Pending |
| Existing sync regression | `npm test` | Pending |
| Validation | `npm run validate-photos` | Pending |
| Quality gate | Definition of Done commands | Pending |
| Review handoff | branch/PR inspection | Pending |
