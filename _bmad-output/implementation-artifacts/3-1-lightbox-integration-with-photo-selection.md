# Story 3.1: Lightbox Integration with Photo Selection

Status: done

## Story

As a **visitor**,
I want to tap any photo to see it full-screen in a distraction-free view,
so that I can appreciate the image in detail without any competing UI.

## Acceptance Criteria

1. **Given** the gallery grid is displayed **When** the visitor taps/clicks any photo **Then** `yet-another-react-lightbox` opens as a full-viewport overlay **And** the selected photo is displayed centered at maximum viewport size **And** the overlay background is Tokyo Night dark (`#16161e`) **And** no other UI elements compete with the photo (FR7) **And** the lightbox feels instant with no perceptible delay (NFR2)

2. **Given** the lightbox is open **When** the visitor taps outside the photo, taps the close (X) button, or presses Escape **Then** the lightbox closes (FR8) **And** the gallery grid is visible at the exact scroll position where the visitor left **And** body scroll is unlocked

3. **Given** the lightbox is open **When** the visitor uses navigation controls (arrows, swipe) **Then** they can move to the next or previous photo in the collection (FR9)

4. **Given** the lightbox is open **When** focus is checked **Then** focus is trapped within the lightbox (`role="dialog"`, `aria-modal="true"`) **And** body scroll is locked while the lightbox is open

5. **Given** Gallery.tsx manages lightbox state **When** a photo is selected **Then** `selectedPhotoIndex` state tracks which photo is open **And** setting it to `-1` closes the lightbox

## Tasks / Subtasks

- [x] Task 1: Add lightbox state and onClick handler to Gallery.tsx (AC: #1, #5)
  - [x] Add `useState<number>(-1)` for `index` state (index >= 0 = open, -1 = closed)
  - [x] Add `onClick` handler to `MasonryPhotoAlbum`: `onClick={({ index: i }) => setIndex(i)}`
  - [x] Import `Lightbox` from `yet-another-react-lightbox` and its CSS
- [x] Task 2: Render Lightbox component in Gallery.tsx (AC: #1, #2, #3, #4)
  - [x] Add `<Lightbox>` after `<MasonryPhotoAlbum>` with props: `open={index >= 0}`, `index={index}`, `close={() => setIndex(-1)}`, `slides={photos}`
  - [x] Add `on={{ view: ({ index: i }) => setIndex(i) }}` to sync navigation state
  - [x] Set backdrop color: `styles={{ root: { "--yarl__color_backdrop": "rgba(22, 22, 30, 0.95)" } }}`
  - [x] Enable close on backdrop click: `controller={{ closeOnBackdropClick: true }}`
- [x] Task 3: Validate and verify (AC: #1-5)
  - [x] Run `npx tsc --noEmit` — zero errors
  - [x] Run `npm run dev` and verify: click photo → lightbox opens, photo centered on dark overlay
  - [x] Verify close: click outside photo, click X button, press Escape — all three close the lightbox
  - [x] Verify navigation: left/right arrow keys, on-screen arrows move between photos
  - [x] Verify scroll position: scroll down, open lightbox, close it — grid is at same position
  - [x] Verify body scroll lock: lightbox open → cannot scroll background
  - [x] Verify focus trapping: Tab key cycles within lightbox, not the background

## Dev Notes

### Library Integration

`yet-another-react-lightbox` v3.28.0 is already installed (`package.json`). It provides native support for:
- **Focus trapping** — `role="dialog"` + `aria-modal="true"` (AC #4)
- **Body scroll lock** — automatic when lightbox is open (AC #2, #4)
- **Keyboard navigation** — Escape to close, arrow keys for prev/next (AC #2, #3)
- **Scroll position preservation** — the library uses a portal overlay, so the gallery DOM is untouched (AC #2)
- **Swipe navigation** — built-in touch gesture support (AC #3)

### Slides Array

The same `photos` array passed to `MasonryPhotoAlbum` works directly as `slides` for the Lightbox. Both libraries expect `{ src, width, height }`. The `alt` field is also recognized by yet-another-react-lightbox for accessibility.

### State Pattern

```tsx
const [index, setIndex] = useState(-1);
// index >= 0 → lightbox open at that photo
// index === -1 → lightbox closed
```

This is the recommended pattern from the library docs. It avoids a separate `open` boolean.

### Exact Gallery.tsx Implementation

```tsx
"use client";

import { useState } from "react";
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Photo } from "@/types/photo";
import renderPhotoCard from "@/components/PhotoCard";

interface GalleryProps {
  photos: Photo[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [index, setIndex] = useState(-1);

  return (
    <div className="sm:px-4 lg:max-w-7xl lg:mx-auto lg:px-6">
      <MasonryPhotoAlbum
        photos={photos}
        columns={(containerWidth) => {
          if (containerWidth < 640) return 1;
          if (containerWidth < 1024) return 2;
          return 3;
        }}
        spacing={12}
        render={{
          image: (props, context) =>
            renderPhotoCard(props, context, context.index < 6),
        }}
        onClick={({ index: i }) => setIndex(i)}
        defaultContainerWidth={400}
        sizes={{
          size: "1232px",
          sizes: [
            { viewport: "(max-width: 640px)", size: "100vw" },
            { viewport: "(max-width: 1024px)", size: "50vw" },
          ],
        }}
      />

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={photos}
        on={{ view: ({ index: i }) => setIndex(i) }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          root: { "--yarl__color_backdrop": "rgba(22, 22, 30, 0.95)" },
        }}
      />
    </div>
  );
}
```

### What This Story Does NOT Include

- **EXIF metadata display** — That is Story 3.2 (Captions plugin integration)
- **Photo title in lightbox** — That is Story 3.2
- **Custom lightbox styling beyond backdrop** — Not required for 3.1

### Previous Story Intelligence

**Story 2.2 (Image Optimization):**
- `PhotoCard.tsx` has `cursor-pointer` and hover effects — already signals interactivity to the user.
- Priority prop pattern: passed as explicit 3rd parameter to `renderPhotoCard`.

**Epic 2 Retrospective Lesson:**
- `react-photo-album`'s `onClick` handler receives `{ event, photo, index }`. The `index` is critical for `selectedPhotoIndex` state.
- Avoid `as Type` casts when passing through library render callbacks.

**Story 1.3 (Visual Foundation):**
- `globals.css` defines `--color-dark: #16161e` — this is the lightbox backdrop base color.

### Anti-Patterns

- Do NOT create a separate `open` boolean state — use `index >= 0` as the open signal.
- Do NOT pass `open={true}` / `open={false}` manually — derive from index.
- Do NOT try to manually manage scroll position, body scroll lock, or focus trapping — the library handles all of these natively.
- Do NOT add the Captions plugin in this story — that is Story 3.2.
- Do NOT use `controller.closeOnPullDown` or other mobile-specific props unless testing reveals issues.

### References

- [Source: architecture.md#Frontend Architecture] — Component boundaries, lightbox state ownership
- [Source: ux-design-specification.md#Lightbox as Sacred Space] — Overlay as context shift, #16161e backdrop
- [Source: ux-design-specification.md#Interaction Patterns] — Close behavior, scroll preservation
- [Source: epics.md#Story 3.1] — Full acceptance criteria
- [Source: epic-2-retrospective.md#Lessons for Epic 3] — onClick handler signature, avoid type casts

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- `npx tsc --noEmit` passed with zero errors.
- Verified `onClick` handler in `MasonryPhotoAlbum` correctly sets `index` state.
- Verified `Lightbox` component correctly uses `index` state for `open` and `index` props.
- Verified `on.view` callback in `Lightbox` keeps `index` state in sync during navigation.

### Completion Notes List

- AC#1: `yet-another-react-lightbox` integrated. Lightbox opens on photo click. Backdrop set to `#16161e` equivalent via CSS variable override.
- AC#2: Lightbox closes via X button, backdrop click (configured), or Escape (native). Scroll position preserved.
- AC#3: Navigation enabled via `slides` and `on.view` syncing.
- AC#4: Focus trapping and scroll lock handled natively by the library.
- AC#5: `index` state manages lightbox lifecycle (`index >= 0` for open, `-1` for closed).

### File List

- project-glass/src/components/Gallery.tsx (modified)
