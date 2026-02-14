# Story 5.1: Metadata Extraction Script

Status: done

## Story

As a Site Owner,
I want to run a command that automatically extracts EXIF and dimensions from new images,
so that I don't have to type technical data manually.

## Acceptance Criteria

1. **[x] New Image Detection**: The script identifies image files in `/public/photos/` that do not have a corresponding entry in `data/photos.json` (matched by `src`).
2. **[x] Metadata Extraction**:
    - Camera body (e.g., "Sony A7IV")
    - Lens (e.g., "FE 24-70mm F2.8 GM II")
    - Focal Length (e.g., "35mm")
    - Aperture (e.g., "f/8")
    - Shutter Speed (e.g., "1/250s")
    - ISO (e.g., "100")
3. **[x] Dimension Extraction**: Extracts the original width and height of the image.
4. **[x] JSON Generation**:
    - Generates a new entry in `data/photos.json`.
    - Includes extracted `width`, `height`, and `exif` object.
    - Includes scaffolding for:
        - `id`: Unique identifier (suggest using filename without extension).
        - `src`: Path to image (e.g., `/photos/filename.jpg`).
        - `alt`: Empty string `""`.
        - `title`: Empty string `""`.
        - `tags`: `{ "location": [], "genre": [] }`.
5. **[x] Execution**: The script is executable via `npm run sync-photos`.
6. **[x] Robustness**: The application builds and runs without errors after the script appends new data.

## Tasks / Subtasks

- [x] Install dependencies (`exifr`, `image-size`)
- [x] Create `scripts/sync-photos.ts`
- [x] Implement logic to read `/public/photos/` and compare with `data/photos.json`
- [x] Implement EXIF extraction using `exifr`
- [x] Implement dimension extraction using `image-size`
- [x] Implement JSON append logic (preserving existing order)
- [x] Add `sync-photos` script to `package.json`
- [x] Verify script with sample images

## Dev Notes

- **Libraries**: 
    - Use `exifr` for fast, zero-dependency EXIF reading.
    - Use `image-size` for header-only dimension extraction.
- **File Location**: The script should live in `project-glass/scripts/sync-photos.ts`.
- **TypeScript Execution**: Since this is a Next.js project, you can use `tsx` or `ts-node` to run the script. `tsx` is recommended for speed and compatibility.
- **Path Handling**: Ensure `src` paths are correctly relative to the `public` directory but prefixed with `/photos/` as expected by the application.
- **Graceful Failure**: If a file is not a valid image or EXIF data is missing, the script should skip it or fill in as much as possible without crashing.

### Project Structure Notes

- **Data Path**: `data/photos.json` (at project root).
- **Photos Path**: `public/photos/`.
- **Types**: Imported from `@/types/photo` to ensure a single source of truth.

### References

- [Source: planning-artifacts/architecture.md#Data Architecture]
- [Source: planning-artifacts/epics.md#Story 5.1: Metadata Extraction Script]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Fixed `image-size` v2 API: changed from default export `sizeOf(path)` to named export `imageSize(buffer)` — v2 requires reading the file into a buffer first.
- Refactored to import types from `src/types/photo.ts` after code review.
- Added `fs.mkdirSync` for `data/` directory protection.
- Optimized I/O: read file to buffer once and share between `image-size` and `exifr`.

### Completion Notes List
- All 8 tasks complete, all 6 acceptance criteria met.
- Installed dev dependencies: `exifr`, `image-size`, `tsx`, `vitest`.
- Script generates entries with `tags: { location: [], genre: [] }` scaffolding for forward compatibility with Epic 6.
- EXIF extraction is graceful — missing fields result in `{}` exif (omitted from entry).
- 18 unit/integration tests passing via vitest.
- `npm run sync-photos` confirmed working — correctly detects no new images when all photos already exist.
- `npm run build` passes cleanly after implementation.

### File List
- `project-glass/scripts/sync-photos.ts` — Main sync script (new)
- `project-glass/scripts/__tests__/sync-photos.test.ts` — Test suite (new)
- `project-glass/src/types/photo.ts` — Updated with `PhotoTags` and `tags` field (modified)
- `project-glass/vitest.config.ts` — Vitest configuration (new)
- `project-glass/package.json` — Added `sync-photos`, `test` scripts and dev dependencies (modified)
- `project-glass/package-lock.json` — Dependency updates (modified)
