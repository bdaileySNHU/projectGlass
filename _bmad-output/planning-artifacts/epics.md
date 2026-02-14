---
project: projectGlass
status: complete
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/ux-design-specification.md']
---

# Epics and User Stories: projectGlass

## Requirements Inventory

### Functional Requirements

*Implemented (Epics 1-4 — Done):*
- FR1: Visitor can view all photos in a responsive masonry grid layout
- FR2: Visitor can see enough photos on initial load to understand the breadth of the portfolio
- FR3: Visitor can visually identify that more content exists below the fold
- FR4: Visitor can scroll through the full photo collection
- FR5: Visitor can view the gallery on mobile, tablet, and desktop devices
- FR6: Visitor can select any photo from the gallery to view it in an enlarged, immersive view
- FR7: Visitor can view photos in a distraction-free presentation (photo only, no competing UI)
- FR8: Visitor can close the immersive view and return to the gallery
- FR9: Visitor can navigate between photos while in the immersive view
- FR10: Visitor can view EXIF metadata for a photo (camera body, lens, focal length, aperture, shutter speed, ISO)
- FR11: System gracefully handles photos with incomplete or missing EXIF data
- FR12: System serves images in modern optimized formats (WebP/AVIF)
- FR13: System serves responsive image sizes appropriate to the visitor's viewport
- FR14: System maintains layout stability while images load (no content shift)
- FR15: System delivers the full page in under 2 seconds on standard broadband
- FR16: Site owner can add new photos by placing image files in the designated directory
- FR17: Site owner can define photo metadata (title, alt text, dimensions, EXIF, location tags, genre tags) in a JSON data file
- FR18: Site owner can publish updates by pushing to the main branch (auto-deploy)
- FR19: Site owner can remove or reorder photos by editing the JSON data file

*Phase 2 (New):*
- FR20: Site owner can assign one or more Location tags (e.g., "Japan", "Portugal") to each photo via the JSON data file
- FR21: Site owner can assign one or more Genre tags (e.g., "Street", "Landscape") to each photo via the JSON data file
- FR22: Every photo in the collection has at least one Location or Genre tag assigned
- FR23: Visitor can filter the gallery grid by selecting a Location tag
- FR24: Visitor can filter the gallery grid by selecting a Genre tag
- FR25: Visitor can combine Location and Genre filters to narrow results (e.g., "Japan" + "Street")
- FR26: Active filters persist when the visitor opens and closes the lightbox

### Non-Functional Requirements

- NFR1: Full page load completes in under 2 seconds on standard broadband connections
- NFR2: Lightbox opens and displays the selected photo with no perceptible delay (feels instant)
- NFR3: Gallery layout remains stable during image loading — no visible content shift (CLS < 0.1)
- NFR4: Images are served in next-gen formats (WebP/AVIF) with responsive sizing to minimize transfer
- NFR5: All gallery images include descriptive alt text
- NFR6: Page uses semantic HTML elements (header, main, figure)
- NFR7: Text elements maintain sufficient color contrast against backgrounds

### Additional Requirements

**From Architecture:**
- `PhotoTags` interface with `location: string[]` and `genre: string[]`
- Tags use title case, displayed as-is — no normalization
- `tags` is required on every `Photo` object
- `CategoryFilter.tsx` — new component, child of Gallery
- Gallery owns filter state: `activeLocation`, `activeGenre`, `filteredPhotos` via `useMemo`
- Unique tag lists derived via `useMemo` — computed once
- "All" option per filter dimension resets to `null`
- Pure client state — no URL params, resets on reload
- Instant swap rendering with opacity transition on filter change

**From UX Spec:**
- Category Filter placement: horizontal row, centered below Header, above Gallery Grid
- Typography: Inter, `text-xs`, `font-light`, `tracking-widest`, `uppercase`
- Colors: Inactive `#a9b1d6`, Active `#7aa2f7` with `border-b-2`, Hover `#c0caf5`
- Spacing: `gap-6` between labels, `mb-8` above grid
- Mobile: horizontally scrollable (`overflow-x-auto`, `scrollbar-hide`), edge-to-edge with `px-4`
- Tablet/Desktop: centered flex row

## FR Coverage Map

### Historical (Implemented)
- **Epic 1: Foundation** → FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19 (Done)
- **Epic 2: Gallery** → FR1, FR2, FR3, FR4, FR5 (Done)
- **Epic 3: Lightbox** → FR6, FR7, FR8, FR9, FR10, FR11 (Done)
- **Epic 4: Deployment** → Production Build & VPS Setup (Done)

### Growth Phase
- **Epic 5: Content Pipeline Automation** → FR17 enhancement
- **Epic 6: Photo Categories and Organization** → FR20, FR21, FR22, FR23, FR24, FR25, FR26
- **Epic 7: Lightbox Enhancements & Narratives** → FR9 enhancement
- **Epic 8: Professional Inquiry & Analytics** → Future scope

## Epic List

### Epic 5: Content Pipeline Automation
**Goal:** Automate EXIF data and dimension extraction from image files, eliminating manual technical data entry in `photos.json`.
**Value:** Reduces content management friction (FR17 mitigation).

### Epic 6: Photo Categories and Organization
**Goal:** Enable visitors to filter the photo collection by Location and Genre tags using a two-dimension tagging system.
**Value:** Prevents the single-page grid from becoming overwhelming as the collection grows. Visitors can narrow to exactly what interests them.

### Epic 7: Lightbox Enhancements & Narratives
**Goal:** Add swipe/keyboard navigation to the lightbox and support for photo-specific "stories" using Markdown.
**Value:** Increases immersion and provides context behind the photos.

### Epic 8: Professional Inquiry & Analytics
**Goal:** Add a print inquiry form and basic analytics to see which photos are resonating.
**Value:** Transitions the site from a personal hobby to a professional portfolio.

---

## Epic 5: Content Pipeline Automation
**Goal:** Automate EXIF data and dimension extraction from image files, eliminating manual technical data entry in `photos.json`.

### Story 5.1: Metadata Extraction Script

As the Site Owner,
I want to run a command that automatically extracts EXIF and dimensions from new images,
So that I don't have to type technical data manually.

**Acceptance Criteria:**

- **Given** new images are added to `/public/photos/`
- **When** `npm run sync-photos` is executed
- **Then** it identifies images not yet in `photos.json`
- **And** it extracts Camera, Lens, Focal Length, Aperture, Shutter Speed, and ISO from EXIF data
- **And** it extracts image width and height
- **And** it appends new entries to `photos.json` with extracted dimensions, EXIF data, placeholder `alt` text (""), empty `title`, and empty `tags` scaffolding (`{ "location": [], "genre": [] }`)
- **And** the application builds without errors after sync

### Story 5.2: Smart Merge and Sync

As the Site Owner,
I want the sync script to preserve my existing manual curation when re-running,
So that automation doesn't overwrite my alt text, titles, or tags.

**Acceptance Criteria:**

- **Given** `photos.json` already contains entries with custom `alt` text, `title`, and `tags`
- **When** the sync script runs
- **Then** it updates technical EXIF data and dimensions if missing or empty
- **And** it leaves `alt`, `title`, and `tags` fields untouched on existing entries
- **And** it reports which entries were added and which were updated
- **And** existing array order in `photos.json` is preserved (new entries appended at end)

---

## Epic 6: Photo Categories and Organization
**Goal:** Enable visitors to filter the photo collection by Location and Genre tags using a two-dimension tagging system.

### Story 6.1: Extend Data Schema for Tags

As the Site Owner,
I want to add Location and Genre tags to my photo metadata,
So that I can organize my collection by where and what type of shot each photo is.

**Acceptance Criteria:**

- **Given** `photos.json` and the `Photo` type exist
- **When** the `PhotoTags` interface is added with `location: string[]` and `genre: string[]`
- **Then** the `Photo` interface includes a required `tags: PhotoTags` field
- **And** all existing entries in `photos.json` are updated with a `tags` object containing at least one Location or Genre value
- **And** tag values use title case (e.g., "Japan", "Street")
- **And** the application builds without errors

### Story 6.2: Category Filter UI

As a Visitor,
I want to see filter controls at the top of the gallery,
So that I can narrow the grid to photos I'm interested in.

**Acceptance Criteria:**

- **Given** photos have tags defined in `photos.json`
- **When** the page loads
- **Then** a `CategoryFilter` component renders below the header and above the gallery grid
- **And** unique Location tags are extracted from photo data and displayed as a filter row labeled "Location"
- **And** unique Genre tags are extracted from photo data and displayed as a filter row labeled "Genre"
- **And** each row includes an "All" option as the default active selection
- **And** filter labels use uppercase, `text-xs`, `font-light`, `tracking-widest` styling per the UX spec
- **And** the active filter displays with `#7aa2f7` color and a `border-b-2` underline
- **And** inactive filters display in `#a9b1d6` with hover transition to `#c0caf5`
- **And** on mobile (<640px), each filter row is horizontally scrollable with hidden scrollbar
- **And** on tablet/desktop, filter rows are centered flex layouts

### Story 6.3: Gallery Filtering Logic

As a Visitor,
I want to click a tag and see the gallery instantly update,
So that I only see photos matching my selection.

**Acceptance Criteria:**

- **Given** the Category Filter is displayed with Location and Genre rows
- **When** a Location tag is selected (e.g., "Japan")
- **Then** the gallery grid shows only photos with that Location tag
- **And** the Genre filter row updates to show only Genre tags present in the currently filtered photo set (prevents dead-end filters)
- **When** a Genre tag is also selected (e.g., "Street")
- **Then** the gallery grid narrows to photos matching both the selected Location AND Genre (FR25)
- **When** "All" is selected on either dimension
- **Then** that filter is cleared and the grid expands accordingly
- **And** the opposite dimension's available tags update to reflect the current set
- **And** active filters persist when the lightbox is opened and closed (FR26)
- **And** the grid uses an opacity transition to soften visual changes during filter swaps
- **And** the lightbox navigates only through the currently filtered photo set

---

## Epic 7: Lightbox Enhancements & Narratives
**Goal:** Add swipe/keyboard navigation to the lightbox and support for photo-specific stories using Markdown.

### Story 7.1: Keyboard and Swipe Navigation

As a Visitor,
I want to use arrow keys or swipe gestures to move between photos in the lightbox,
So that I don't have to close and re-open the lightbox for every image.

**Acceptance Criteria:**

- **Given** the lightbox is open
- **When** I press the right arrow key or swipe left on mobile
- **Then** the lightbox transitions to the next image in the current filtered set
- **When** I press the left arrow key or swipe right on mobile
- **Then** the lightbox transitions to the previous image
- **And** navigation wraps around (last photo → first, first photo → last)
- **And** EXIF data and title update to reflect the newly displayed photo
- **And** transitions between photos feel smooth, not jarring

### Story 7.2: Markdown Support for Photo Narratives

As the Site Owner,
I want to add longer descriptions to my photos using Markdown,
So that I can share the story behind my favorite shots.

**Acceptance Criteria:**

- **Given** a photo has a `description` field in `photos.json` containing Markdown text
- **When** the lightbox is open for that photo
- **Then** the description is rendered below the EXIF data using a Markdown parser
- **And** the rendered Markdown supports paragraphs, bold, italic, and links
- **And** the description uses `text-sm`, `#a9b1d6` styling consistent with the lightbox aesthetic
- **And** photos without a `description` field render normally with no empty space
- **And** the `Photo` interface is extended with an optional `description?: string` field

---

## Epic 8: Professional Inquiry & Analytics
**Goal:** Add a print inquiry form and basic analytics to see which photos are resonating.

### Story 8.1: Print Inquiry Action

As a Visitor,
I want to click an "Inquire about Print" button in the lightbox,
So that I can easily ask Bryan about purchasing a physical copy of a photo.

**Acceptance Criteria:**

- **Given** the lightbox is open
- **When** I click the "Inquire" button
- **Then** it opens a pre-filled `mailto:` link with the photo title and ID in the subject line
- **And** the button uses subdued styling consistent with the lightbox aesthetic (`text-xs`, `#a9b1d6`, hover to `#c0caf5`)
- **And** the button is positioned below the EXIF/description area, not competing with the photo
- **And** the button is visible on both mobile and desktop

### Story 8.2: Privacy-First Analytics

As the Site Owner,
I want to track page views and lightbox opens without using cookies,
So that I know which photos are popular while respecting visitor privacy.

**Acceptance Criteria:**

- **Given** the site is live
- **When** a visitor lands on the page
- **Then** a page view event is sent to a privacy-first analytics provider (e.g., Umami or Plausible)
- **When** a visitor opens the lightbox for a specific photo
- **Then** a lightbox open event is sent with the photo identifier
- **And** no cookies are set and no personal data is collected
- **And** analytics does not impact page load performance (async, non-blocking script)
- **And** analytics is configurable via environment variable (can be disabled for local dev)
