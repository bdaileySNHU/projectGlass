# Story 5.2: Smart Merge and Sync

Status: done

## Story

As the Site Owner,
I want the sync script to preserve my existing manual curation when re-running,
So that automation doesn't overwrite my alt text, titles, or tags.

## Acceptance Criteria

1. **[x] Preserve Curated Fields**: When `photos.json` already contains entries with custom `alt`, `title`, and `tags`, the sync script preserves them.
2. **[x] Backfill Technical Data**: The script updates only technical EXIF data and dimensions if they are missing or empty on existing entries.
3. **[x] Curated Fields Untouched**: `alt`, `title`, and `tags` fields are left completely untouched on existing entries.
4. **[x] Reporting**: The script reports which entries were **added** and which were **updated** (with counts and filenames).
5. **[x] Preserve Order**: Existing array order in `photos.json` is preserved; new entries appended at the end.

## Tasks / Subtasks

- [x] Add `mergeExistingEntry()` function — compares existing entry against fresh disk data, backfills missing technical fields only
- [x] Add `tags` scaffold to entries missing it (backward compat for pre-5.1 entries)
- [x] Update `syncPhotos()` to iterate existing entries and attempt merge before processing new images
- [x] Update return type to include `updated: string[]` alongside `added`
- [x] Update console output to distinguish `+ added` vs `~ updated` entries
- [x] Add unit tests for merge logic (curated fields preserved, technical fields backfilled, no-op when complete)
- [x] Verify existing tests still pass
- [x] Run `npm run sync-photos` end-to-end and confirm idempotent behavior

## Dev Notes

- **Curated fields** (NEVER overwrite): `alt`, `title`, `tags`, `priority`
- **Technical fields** (backfill if missing/empty): `width`, `height`, `exif.*` (camera, lens, focalLength, aperture, shutter speed, iso)
- **Scaffold fields** (add if absent): `tags: { location: [], genre: [] }`
- The 4 older entries (donald-duck, frozen-tokyo, small-world-tokyo, tangled) were missing the `tags` field — merge added the empty scaffold.
- The merge is **idempotent**: running twice produces "No changes needed."
- `priority` field is preserved if present (curated).

### Key Design Decision

The merge function works at the **field level**, not entry level:
- For each existing entry, re-reads the image from disk
- Compares each technical field: if existing value is missing/empty/undefined AND disk value exists, backfills it
- Never touches curated fields regardless of their content

### References

- [Source: planning-artifacts/epics.md#Story 5.2: Smart Merge and Sync]
- [Builds on: 5-1-metadata-extraction-script.md]
- Script: `project-glass/scripts/sync-photos.ts`
- Tests: `project-glass/scripts/__tests__/sync-photos.test.ts`
- Types: `project-glass/src/types/photo.ts`

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- No issues encountered during implementation.

### Completion Notes List
- All 8 tasks complete, all 5 acceptance criteria met.
- Added `mergeExistingEntry()` exported function with field-level merge logic.
- Updated `syncPhotos()` return type: `{ added: string[]; updated: string[]; total: number }`.
- Console output distinguishes `+ added` vs `~ updated` entries.
- 27 tests passing (18 existing + 9 new merge/integration tests).
- `npm run build` passes cleanly.
- `npm run sync-photos` confirmed: 4 pre-5.1 entries updated (tags scaffold + missing EXIF backfilled), second run idempotent.

### File List
- `project-glass/scripts/sync-photos.ts` — Added `mergeExistingEntry()`, updated `syncPhotos()` (modified)
- `project-glass/scripts/__tests__/sync-photos.test.ts` — Added 9 new tests for merge logic (modified)
- `project-glass/data/photos.json` — 4 entries updated with tags scaffold + backfilled EXIF (modified)
