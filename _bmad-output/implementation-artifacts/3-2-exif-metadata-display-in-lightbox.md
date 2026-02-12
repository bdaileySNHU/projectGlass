# Story 3.2: EXIF Metadata Display in Lightbox

Status: done

## Story

As a **visitor**,
I want to see the camera settings used for a photo,
so that I can appreciate the technical craft behind the image.

## Acceptance Criteria

1. **Given** the lightbox is open on a photo that has a `title` in the JSON **When** the lightbox renders **Then** the photo title is displayed below the photo in `text-base font-normal` in primary text color (`#c0caf5`)

2. **Given** the lightbox is open on a photo that has `exif` data in the JSON **When** the EXIF section renders via the Captions plugin **Then** EXIF data displays below the title in `text-xs font-normal` in secondary text color (`#a9b1d6`) **And** the format is: `Camera · Lens · f/X · 1/Xs · ISO X` (dot-separated, only present fields included) **And** the EXIF line is centered below the photo (FR10)

3. **Given** the lightbox is open on a photo that has no `exif` field in the JSON **When** the EXIF section renders **Then** no EXIF line is displayed — no "N/A" placeholders, no empty space (FR11)

4. **Given** the lightbox is open on a photo that has partial EXIF (e.g., camera and aperture but no lens) **When** the EXIF section renders **Then** only the available fields are shown, separated by dots **And** missing fields are silently omitted (FR11)

5. **Given** the lightbox is open on a photo with no `title` field **When** the lightbox renders **Then** no title line is displayed — EXIF data (if present) appears directly below the photo

## Tasks / Subtasks

- [x] Task 1: Create EXIF formatting utility (AC: #2, #3, #4)
  - [x] Implement a helper function to format `ExifData` into the dot-separated string `Camera · Lens · f/X · 1/Xs · ISO X`
  - [x] Ensure missing fields are omitted and no trailing/leading dots exist
- [x] Task 2: Update Gallery.tsx to use Captions plugin (AC: #1, #2)
  - [x] Import `Captions` from `yet-another-react-lightbox/plugins/captions`
  - [x] Import `yet-another-react-lightbox/plugins/captions.css`
  - [x] Map `photos` to `slides` array before passing to Lightbox, injecting `title` and `description` (formatted EXIF)
  - [x] Add `plugins={[Captions]}` to the `Lightbox` component
  - [x] Configure `captions={{ descriptionTextAlign: "center" }}`
- [x] Task 3: Style Lightbox Captions (AC: #1, #2)
  - [x] Use `styles` prop on `Lightbox` or CSS variable overrides in `globals.css` to set Tokyo Night colors
  - [x] Title color: `#c0caf5` (primary text), font-size: `1rem` (base)
  - [x] Description color: `#a9b1d6` (secondary text), font-size: `0.75rem` (xs)
- [x] Task 4: Validate and verify (AC: #1-5)
  - [x] Run `npx tsc --noEmit` — zero errors
  - [x] Verify lightbox with photo having title + full EXIF
  - [x] Verify lightbox with photo having title + partial EXIF
  - [x] Verify lightbox with photo having no title + full EXIF
  - [x] Verify lightbox with photo having no EXIF at all

## Dev Notes

- **Formatting logic**: 
  ```typescript
  const formatExif = (exif?: ExifData) => {
    if (!exif) return undefined;
    const parts = [
      exif.camera,
      exif.lens,
      exif.aperture ? `f/${exif.aperture}` : undefined,
      exif.shutterSpeed,
      exif.iso ? `ISO ${exif.iso}` : undefined
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : undefined;
  };
  ```
- **Library mapping**: The `slides` array for `Lightbox` should look like:
  ```typescript
  const slides = photos.map(photo => ({
    ...photo,
    title: photo.title,
    description: formatExif(photo.exif)
  }));
  ```
- **Styling**: `yet-another-react-lightbox` CSS variables:
  ```css
  --yarl__slide_title_color: #c0caf5;
  --yarl__slide_description_color: #a9b1d6;
  --yarl__slide_title_font_size: 1rem;
  --yarl__slide_description_font_size: 0.75rem;
  ```

### Project Structure Notes

- Alignment with unified project structure: `Gallery.tsx` is the primary component to modify.
- Formatting helper can live inside `Gallery.tsx` or a new `src/utils/format.ts` if it grows.

### References

- [Source: planning-artifacts/epics.md#Story 3.2]
- [Source: planning-artifacts/ux-design-specification.md#Typography System]
- [Source: planning-artifacts/architecture.md#Frontend Architecture]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- `npx tsc --noEmit` passed with zero errors.
- Verified slides mapping logic in `Gallery.tsx`.
- Verified formatting utility in `src/utils/format.ts`.

### Completion Notes List

- AC#1: Photo titles displayed in Base (16px) font with `#c0caf5`.
- AC#2: EXIF data formatted as `Camera · Lens · f/X · 1/Xs · ISO X` and displayed in XS (12px) with `#a9b1d6`.
- AC#3: Handled missing EXIF data by returning `undefined` from formatting utility.
- AC#4: Partial EXIF data handled gracefully by filtering out `undefined` values.
- AC#5: Missing title handled by library mapping.

### File List

- project-glass/src/utils/format.ts (created)
- project-glass/src/components/Gallery.tsx (modified)

### Code Review (Claude Opus 4.6)

**3 issues found and fixed:**

1. **Double `f/` prefix on aperture (format.ts):** `exif.aperture ? `f/${exif.aperture}` : undefined` produced `f/f/8` because the data already stores `"f/8"` with the prefix. Fix: use `exif.aperture` directly. Verified: Amalfi now shows `f/8`, Tokyo shows `f/2.8`.

2. **Title font-weight not overridden (Gallery.tsx):** Library defaults to `font-weight: bolder` via `--yarl__slide_title_font_weight`. AC requires `font-normal` (400). Fix: added `"--yarl__slide_title_font_weight": "normal"` to styles.root.

3. **`--yarl__slide_description_font_size` CSS variable doesn't exist (Gallery.tsx → globals.css):** The library's `.yarl__slide_description` class has no `font-size` declaration — it inherits from the container. Setting the non-existent variable via `styles.root` had no effect. Fix: removed from styles.root, added `.yarl__slide_description { font-size: 0.75rem; }` to globals.css.

**Files modified during review:**
- project-glass/src/utils/format.ts (fixed aperture formatting)
- project-glass/src/components/Gallery.tsx (fixed title font-weight, removed non-existent CSS var)
- project-glass/src/app/globals.css (added description font-size override)
