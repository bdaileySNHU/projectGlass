---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-02-10'
inputDocuments: ['planning-artifacts/prd.md', 'planning-artifacts/architecture.md', 'planning-artifacts/ux-design-specification.md']
workflowType: 'epics'
project_name: 'projectGlass'
user_name: 'Bryan'
date: '2026-02-10'
---

# projectGlass - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for projectGlass, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Visitor can view all photos in a responsive masonry grid layout
FR2: Visitor can see enough photos on initial load to understand the breadth of the portfolio
FR3: Visitor can visually identify that more content exists below the fold
FR4: Visitor can scroll through the full photo collection
FR5: Visitor can view the gallery on mobile, tablet, and desktop devices
FR6: Visitor can select any photo from the gallery to view it in an enlarged, immersive view
FR7: Visitor can view photos in a distraction-free presentation (photo only, no competing UI)
FR8: Visitor can close the immersive view and return to the gallery
FR9: Visitor can navigate between photos while in the immersive view
FR10: Visitor can view EXIF metadata for a photo (camera body, lens, focal length, aperture, shutter speed, ISO)
FR11: System gracefully handles photos with incomplete or missing EXIF data
FR12: System serves images in modern optimized formats (WebP/AVIF)
FR13: System serves responsive image sizes appropriate to the visitor's viewport
FR14: System maintains layout stability while images load (no content shift)
FR15: System delivers the full page in under 2 seconds on standard broadband
FR16: Site owner can add new photos by placing image files in the designated directory
FR17: Site owner can define photo metadata (title, alt text, dimensions, EXIF) in a JSON data file
FR18: Site owner can publish updates by pushing to the main branch (auto-deploy)
FR19: Site owner can remove or reorder photos by editing the JSON data file

### NonFunctional Requirements

NFR1: Full page load completes in under 2 seconds on standard broadband connections
NFR2: Lightbox opens and displays the selected photo with no perceptible delay (feels instant)
NFR3: Gallery layout remains stable during image loading — no visible content shift (CLS < 0.1)
NFR4: Images are served in next-gen formats (WebP/AVIF) with responsive sizing to minimize transfer
NFR5: All gallery images include descriptive alt text
NFR6: Page uses semantic HTML elements (header, main, figure)
NFR7: Text elements maintain sufficient color contrast against backgrounds

### Additional Requirements

**From Architecture:**
- Starter template: `create-next-app@latest project-glass --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-npm` — defines Epic 1 Story 1
- Post-init: `npm install react-photo-album yet-another-react-lightbox`
- Next.js standalone output mode (`output: 'standalone'` in next.config.js) for VPS deployment
- PM2 process management + nginx reverse proxy with TLS (Let's Encrypt)
- TypeScript interfaces (`Photo`, `ExifData`) in `src/types/photo.ts`
- `react-photo-album` v3.4.0 + `yet-another-react-lightbox` v3.28.0 library integration
- Tailwind CSS v4 with `@theme` configuration for Tokyo Night palette in `globals.css`
- `data/photos.json` as flat-file data source, read via `fs.readFileSync` in server component (`page.tsx`)
- Single client boundary: `Gallery.tsx` with `"use client"`
- Image `priority` prop on above-the-fold images (~first 6) for LCP optimization
- Image `sizes` attribute: `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`

**From UX Design:**
- Tokyo Night color palette: night `#1a1b26`, storm `#24283b`, dark `#16161e`, primary text `#c0caf5`, secondary text `#a9b1d6`, tertiary text `#565f89`, accent `#7aa2f7`
- Inter font with light weights (300/400), restrained type scale (text-lg, text-base, text-xs)
- Direction A: Tight & Lively — 12px grid gaps, centered header, scale-on-hover (1.03)
- EXIF below photo in lightbox via Captions plugin, format: `Camera · Lens · f/X · 1/Xs · ISO X`
- Mobile (<640px): full-width single-column feed, edge-to-edge (`px-0`), `gap-3` (12px)
- Tablet (640-1024px): 2-column masonry, `spacing={12}`, `px-4`
- Desktop (>1024px): 3-column masonry, `spacing={12}`, `max-w-7xl mx-auto`, `px-6`
- Desktop hover: `scale-[1.03]` with `transition: transform 0.3s ease`, `cursor: pointer`
- Lightbox overlay on `#16161e` with body scroll lock and focus trapping
- Scroll position preservation on lightbox close
- WCAG AA contrast ratios verified (11:1, 8.5:1, 3.5:1)
- Keyboard support: Tab through photos, Enter/Space to open lightbox, Escape to close
- Touch targets: entire photo tappable, close button min 44x44px
- No pagination, no "load more" — continuous scroll only

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Responsive masonry grid layout |
| FR2 | Epic 2 | Enough photos visible on initial load |
| FR3 | Epic 2 | Below-the-fold visual indicator |
| FR4 | Epic 2 | Scroll through full collection |
| FR5 | Epic 2 | Mobile, tablet, and desktop support |
| FR6 | Epic 3 | Select photo for enlarged view |
| FR7 | Epic 3 | Distraction-free presentation |
| FR8 | Epic 3 | Close immersive view, return to gallery |
| FR9 | Epic 3 | Navigate between photos in immersive view |
| FR10 | Epic 3 | EXIF metadata display |
| FR11 | Epic 3 | Graceful handling of missing EXIF |
| FR12 | Epic 2 | Optimized image formats (WebP/AVIF) |
| FR13 | Epic 2 | Responsive image sizes |
| FR14 | Epic 2 | Layout stability during loading |
| FR15 | Epic 2 | Page load under 2 seconds |
| FR16 | Epic 1 | Add photos to designated directory |
| FR17 | Epic 1 | Define metadata in JSON file |
| FR18 | Epic 4 | Publish via git push |
| FR19 | Epic 1 | Remove/reorder via JSON editing |

## Epic List

### Epic 1: Project Foundation & Visual Identity
Bryan has a running Next.js project with the Tokyo Night aesthetic, data schema, and page structure — viewable on localhost.
**FRs covered:** FR16, FR17, FR19
**NFRs covered:** NFR5, NFR6, NFR7

### Epic 2: Photo Gallery Browsing
Visitors can browse all photos in a responsive, fast-loading grid on any device — mobile feed, tablet masonry, desktop masonry with hover effects.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR12, FR13, FR14, FR15
**NFRs covered:** NFR1, NFR3, NFR4

### Epic 3: Immersive Photo Viewing
Visitors can tap any photo for a distraction-free, full-screen view with EXIF metadata — and return to exactly where they were in the grid.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11
**NFRs covered:** NFR2

### Epic 4: Production Deployment
The site is live at photos.bdailey.com — Bryan can share the link and publish updates via git push.
**FRs covered:** FR18
**NFRs covered:** (deployment enables all NFRs in production)

## Epic 1: Project Foundation & Visual Identity

Bryan has a running Next.js project with the Tokyo Night aesthetic, data schema, and page structure — viewable on localhost.

### Story 1.1: Initialize Next.js Project with Dependencies

As a **site owner**,
I want the project scaffolded with all required dependencies,
So that development can begin on a solid foundation.

**Acceptance Criteria:**

**Given** no project exists yet
**When** the initialization commands are run
**Then** a Next.js 16.1 project is created with TypeScript, Tailwind CSS v4, ESLint, App Router, and `src/` directory
**And** `react-photo-album` v3.4.0 and `yet-another-react-lightbox` v3.28.0 are installed
**And** `next.config.js` includes `output: 'standalone'`
**And** `npm run dev` starts the dev server without errors
**And** the `@/*` import alias resolves correctly

### Story 1.2: Create Data Schema and Sample Content

As a **site owner**,
I want a defined photo data schema with sample content,
So that I can manage photos by editing JSON and adding image files to a directory.

**Acceptance Criteria:**

**Given** the project is initialized
**When** `src/types/photo.ts` is created
**Then** it exports `Photo` and `ExifData` interfaces matching the architecture specification
**And** `alt` is a required string field on `Photo`
**And** all `ExifData` fields are optional strings

**Given** the type definitions exist
**When** `data/photos.json` is created with at least 3 sample entries
**Then** each entry includes required fields (`src`, `width`, `height`, `alt`)
**And** at least one entry includes a full `exif` object
**And** at least one entry omits the `exif` field entirely
**And** at least one entry includes a `title` and at least one omits it

**Given** sample JSON entries exist
**When** corresponding sample images are placed in `public/photos/`
**Then** each `src` path in the JSON resolves to an actual image file

### Story 1.3: Configure Visual Foundation and Page Layout

As a **visitor**,
I want the site to have a polished dark aesthetic with proper structure,
So that my first impression is a curated, intentional experience.

**Acceptance Criteria:**

**Given** the project is initialized
**When** `src/app/globals.css` is configured
**Then** it imports Tailwind CSS and defines a `@theme` block with all Tokyo Night color tokens (night, storm, dark, text-primary, text-secondary, text-tertiary, accent)

**Given** the theme is configured
**When** `src/app/layout.tsx` is created
**Then** it sets the page background to Tokyo Night night (`#1a1b26`)
**And** it loads the Inter font via `next/font/google`
**And** it uses semantic `<html>` and `<body>` elements
**And** it sets a page `<title>` and meta description

**Given** the layout exists
**When** `src/components/Header.tsx` is created
**Then** it renders "photos.bdailey.com" centered in `text-lg font-light tracking-wider` in primary text color
**And** it uses a semantic `<header>` element
**And** it has vertical padding of `py-4` to `py-6`
**And** it is a server component (no `"use client"`)

**Given** the header and data schema exist
**When** `src/app/page.tsx` is created
**Then** it reads `data/photos.json` via `fs.readFileSync` (server component)
**And** it renders the Header component
**And** it renders a placeholder showing the photo count (to verify data loading works)
**And** it uses a semantic `<main>` element
**And** NFR6 (semantic HTML) is satisfied

## Epic 2: Photo Gallery Browsing

Visitors can browse all photos in a responsive, fast-loading grid on any device — mobile feed, tablet masonry, desktop masonry with hover effects.

### Story 2.1: Gallery Component with Responsive Photo Grid

As a **visitor**,
I want to see all photos in a responsive grid that adapts to my device,
So that I can browse the full collection whether I'm on my phone, tablet, or desktop.

**Acceptance Criteria:**

**Given** the page loads with photo data from `photos.json`
**When** `src/components/Gallery.tsx` is created as a client component (`"use client"`)
**Then** it receives a `Photo[]` array as props from `page.tsx`
**And** `page.tsx` renders Gallery instead of the placeholder from Story 1.3

**Given** the visitor is on mobile (<640px)
**When** the gallery renders
**Then** photos display in a single-column vertical feed
**And** photos are full-width, edge-to-edge (`px-0`)
**And** vertical spacing between photos is `gap-3` (12px)

**Given** the visitor is on tablet (640-1024px)
**When** the gallery renders
**Then** photos display in a 2-column masonry layout via `react-photo-album`
**And** grid spacing is 12px
**And** page has `px-4` horizontal margins

**Given** the visitor is on desktop (>1024px)
**When** the gallery renders
**Then** photos display in a 3-column masonry layout via `react-photo-album`
**And** grid spacing is 12px
**And** layout is constrained to `max-w-7xl mx-auto` with `px-6` margins

**Given** the gallery is rendered
**When** `src/components/PhotoCard.tsx` renders each photo
**Then** it uses Next.js `<Image>` component with `width`, `height`, and `alt` from the photo data
**And** each image is wrapped in a `<figure>` element for semantic HTML

### Story 2.2: Image Optimization, Layout Stability, and Gallery Polish

As a **visitor**,
I want photos to load fast, never shift around, and feel interactive on desktop,
So that the browsing experience feels polished and instant.

**Acceptance Criteria:**

**Given** PhotoCard renders a Next.js `<Image>`
**When** the `sizes` attribute is configured
**Then** it uses `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`
**And** Next.js serves appropriately sized images per viewport (FR13)
**And** images are served in WebP/AVIF format automatically (FR12)

**Given** the gallery loads on any connection speed
**When** images are loading
**Then** aspect-ratio placeholders from `width`/`height` prevent layout shift (FR14, NFR3)
**And** CLS remains < 0.1

**Given** above-the-fold images exist
**When** the first ~6 photos render
**Then** they use `priority={true}` to disable lazy loading for LCP optimization (NFR1)

**Given** the visitor is on desktop
**When** they hover over a photo in the grid
**Then** the photo scales to `1.03` with `transition: transform 0.3s ease`
**And** cursor changes to `pointer`
**And** hover effect is not applied on touch devices

**Given** the gallery has more photos than fit in the viewport
**When** the page loads
**Then** the last visible photo is partially cut off at the viewport edge, visually indicating more content below (FR3)

## Epic 3: Immersive Photo Viewing

Visitors can tap any photo for a distraction-free, full-screen view with EXIF metadata — and return to exactly where they were in the grid.

### Story 3.1: Lightbox Integration with Photo Selection

As a **visitor**,
I want to tap any photo to see it full-screen in a distraction-free view,
So that I can appreciate the image in detail without any competing UI.

**Acceptance Criteria:**

**Given** the gallery grid is displayed
**When** the visitor taps/clicks any photo
**Then** `yet-another-react-lightbox` opens as a full-viewport overlay
**And** the selected photo is displayed centered at maximum viewport size
**And** the overlay background is Tokyo Night dark (`#16161e`)
**And** no other UI elements compete with the photo (FR7)
**And** the lightbox feels instant with no perceptible delay (NFR2)

**Given** the lightbox is open
**When** the visitor taps outside the photo, taps the close (X) button, or presses Escape
**Then** the lightbox closes (FR8)
**And** the gallery grid is visible at the exact scroll position where the visitor left (scroll position preserved)
**And** body scroll is unlocked

**Given** the lightbox is open
**When** the visitor uses navigation controls (arrows, swipe)
**Then** they can move to the next or previous photo in the collection (FR9)

**Given** the lightbox is open
**When** focus is checked
**Then** focus is trapped within the lightbox (`role="dialog"`, `aria-modal="true"`)
**And** body scroll is locked while the lightbox is open

**Given** Gallery.tsx manages lightbox state
**When** a photo is selected
**Then** `selectedPhotoIndex` state tracks which photo is open
**And** setting it to `null` closes the lightbox

### Story 3.2: EXIF Metadata Display in Lightbox

As a **visitor**,
I want to see the camera settings used for a photo,
So that I can appreciate the technical craft behind the image.

**Acceptance Criteria:**

**Given** the lightbox is open on a photo that has a `title` in the JSON
**When** the lightbox renders
**Then** the photo title is displayed below the photo in `text-base font-normal` in primary text color (`#c0caf5`)

**Given** the lightbox is open on a photo that has `exif` data in the JSON
**When** the EXIF section renders via the Captions plugin
**Then** EXIF data displays below the title in `text-xs font-normal` in secondary text color (`#a9b1d6`)
**And** the format is: `Camera · Lens · f/X · 1/Xs · ISO X` (dot-separated, only present fields included)
**And** the EXIF line is centered below the photo (FR10)

**Given** the lightbox is open on a photo that has no `exif` field in the JSON
**When** the EXIF section renders
**Then** no EXIF line is displayed — no "N/A" placeholders, no empty space (FR11)

**Given** the lightbox is open on a photo that has partial EXIF (e.g., camera and aperture but no lens)
**When** the EXIF section renders
**Then** only the available fields are shown, separated by dots
**And** missing fields are silently omitted (FR11)

**Given** the lightbox is open on a photo with no `title` field
**When** the lightbox renders
**Then** no title line is displayed — EXIF data (if present) appears directly below the photo

## Epic 4: Production Deployment

The site is live at photos.bdailey.com — Bryan can share the link and publish updates via git push.

### Story 4.1: Production Build and VPS Deployment

As a **site owner**,
I want the site deployed to my VPS and accessible at photos.bdailey.com,
So that I can share the link with friends and family and publish updates by pushing to main.

**Acceptance Criteria:**

**Given** the application is feature-complete locally
**When** `npm run build` is executed
**Then** Next.js produces a standalone build in `.next/standalone/`
**And** the build completes without errors

**Given** the standalone build exists
**When** the project is deployed to the VPS
**Then** PM2 runs `.next/standalone/server.js` with `NODE_ENV=production` on port 3000
**And** the process auto-restarts on failure
**And** PM2 ecosystem config is documented (`ecosystem.config.js`)

**Given** PM2 is running the application
**When** nginx is configured as a reverse proxy
**Then** requests to `photos.bdailey.com` are proxied to `127.0.0.1:3000`
**And** proper headers are set (`Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`)
**And** TLS is configured via Let's Encrypt / certbot

**Given** the site is live at photos.bdailey.com
**When** Bryan pushes changes to the main branch
**Then** a documented deploy workflow exists (git pull → npm run build → pm2 restart glass) (FR18)

**Given** the site is live
**When** a visitor loads photos.bdailey.com
**Then** the full page loads in under 2 seconds on standard broadband
**And** images are served in WebP/AVIF via Next.js Image optimization
**And** the site matches the localhost development experience exactly
