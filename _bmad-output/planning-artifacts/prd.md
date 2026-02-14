---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: []
workflowType: 'prd'
workflow: 'edit'
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
lastEdited: '2026-02-13'
editHistory:
  - date: '2026-02-13'
    changes: 'Added Phase 2 Photo Organization requirements (FR20-FR26): two-dimensional tagging (Location + Genre), multi-tag filtering, filter persistence. Extended Journey 1 with return visit filtering scene. Updated FR17, Phase 2 scope, and success criteria.'
---

# Product Requirements Document - projectGlass

**Author:** Bryan
**Date:** 2026-02-10

## Executive Summary

**Product:** photos.bdailey.com — a premium photo gallery showcasing Bryan's travel and vacation photography.

**Vision:** A blazing-fast, visually immersive single-page photo portfolio that feels like a native app. Visitors get an immediate overview of the collection and can dive into any photo with a distraction-free viewing experience.

**Target Users:**
- **Visitors** — Friends and family receiving a shared link, browsing on mobile or desktop
- **Site Owner (Bryan)** — Manages content via flat-file JSON and git-based deployment

**Differentiator:** Performance-first design. The entire experience loads in under 2 seconds. No auth, no database, no complexity — just photos served fast.

## Success Criteria

### User Success

- Visitors get a compelling overview of the photography collection within 2-3 seconds of landing
- Masonry layout balances image size (large enough for intrigue, dense enough for overview)
- Below-the-fold content is visually obvious
- Lightbox is distraction-free: photo only, no competing UI
- Smooth transitions and keyboard nav are stretch goals, not MVP blockers

### Business Success

- Personal creative showcase — no revenue model for MVP
- Bryan can update the portfolio by editing JSON and adding files — under 2 minutes per photo
- Foundation supports future print sales without requiring a rebuild

### Technical Success

- Full page load under 2 seconds on standard broadband
- Static site generation (SSG) — no server-side rendering overhead
- Image optimization delivers responsive WebP/AVIF with appropriate srcset
- Live at photos.bdailey.com via Vercel with zero-config CI/CD

### Measurable Outcomes

- Page load < 2 seconds (real browser measurement)
- Adding a new photo takes under 2 minutes (drop file + edit JSON)
- Zero runtime errors in production console at launch
- Visitor can narrow the gallery to a specific subset (e.g., Japan street photography) in 2 or fewer interactions

## User Journeys

### Journey 1: The Visitor — "Sarah Browses Bryan's Photos"

**Who:** Sarah, a friend who received a link via text message.

**Opening Scene:** Sarah taps the link on her phone during lunch. The page loads fast — within a second she sees a dense grid of travel photography. Mountains, coastlines, street scenes. She immediately gets Bryan's range. The grid clearly continues past her screen.

**Rising Action:** She scrolls through the masonry layout, pauses on a cliffside village shot, and taps it. The photo fills her screen — nothing else.

**Climax:** She notices the EXIF data — "Sony A7IV, 24-70mm, f/8, 1/250s" — and realizes Bryan's serious about this craft.

**Resolution:** She texts Bryan "your photos are incredible" and shares the link with a friend. Total time on site: 3 minutes.

**Return Visit:** A week later, Sarah opens the link again — this time she wants to find the Japan photos Bryan mentioned. She spots filter controls at the top of the gallery. She taps "Japan" under Location and the grid instantly narrows to just those shots. She then taps "Street" under Genre to drill further — now she's looking at Bryan's Tokyo street photography. She opens the lightbox, swipes through several photos, closes it, and the filters are still active. She switches to "Landscape" and browses a completely different set from the same trip.

**Requirements revealed (return visit):** Location and Genre tag dimensions, multi-tag filtering, combinable filters, instant grid re-render on filter change, filter state persists across lightbox open/close, clear filter reset path.

### Journey 2: The Visitor Edge Case — "Sarah on Slow Airport Wi-Fi"

**Opening Scene:** Sarah tries to show Bryan's site on flaky airport Wi-Fi.

**Rising Action:** The page loads but images are slow. Layout structure appears immediately. She taps a loaded photo — the lightbox opens.

**Resolution:** Responsive srcset serves appropriately sized images for the connection. The site remains usable — no blank screens, no broken layout, no content shift.

**Requirements revealed:** Graceful degradation on slow connections, responsive srcset, layout stability (CLS < 0.1), lightbox functional during partial load.

### Journey 3: Bryan (Owner) — "Adding Photos from a Trip"

**Opening Scene:** Bryan returns from Portugal with 15 Lightroom exports sized for web.

**Rising Action:** He drops images into `/public/photos/`, opens `photos.json`, copies an existing entry for each photo, fills in metadata and EXIF data.

**Climax:** Pushes to `main`. Vercel builds and deploys. Within 2 minutes, the new photos are live.

**Resolution:** Total effort: under 15 minutes for 15 photos. Low enough friction to do regularly.

**Requirements revealed:** Simple copy-paste JSON schema, no build-time image processing, git push auto-deploy, file system as CMS.

### Journey Requirements Summary

| Capability | Revealed By |
|-----------|------------|
| Responsive masonry layout | Journey 1, 2 |
| Below-the-fold visual indicator | Journey 1 |
| Distraction-free lightbox | Journey 1 |
| EXIF metadata display | Journey 1 |
| Mobile-first responsive design | Journey 1, 2 |
| Responsive srcset image optimization | Journey 2 |
| Layout stability (no CLS) | Journey 2 |
| Simple JSON data schema | Journey 3 |
| File-system content management | Journey 3 |
| Git-push auto-deploy (Vercel) | Journey 3 |
| Location and Genre tag dimensions | Journey 1 (return visit) |
| Combinable multi-dimension filtering | Journey 1 (return visit) |
| Filter state persists across lightbox | Journey 1 (return visit) |

## Web App Specific Requirements

### Project-Type Overview

Single-page statically generated (SSG) photo gallery. No client-side routing for MVP. Primary distribution is direct link sharing; SEO is a nice-to-have.

### Browser Support

| Browser | Support Level |
|---------|-------------|
| Chrome (latest 2) | Full |
| Safari (latest 2) | Full |
| Firefox (latest 2) | Full |
| Edge (latest 2) | Full |
| IE11 / Legacy | Not supported |

### Responsive Design

- Mobile-first (primary audience taps links on phones)
- Three breakpoint tiers: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- Masonry columns adapt: 1 → 2 → 3 columns
- Lightbox adapts to viewport — full-screen on all devices

### Performance Targets

- Full page load: < 2 seconds on standard broadband
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Static generation eliminates server response time
- Image optimization via Next.js (WebP/AVIF, responsive srcset)

### SEO Strategy (Nice-to-Have)

- Semantic HTML structure (header, main, figure)
- Open Graph meta tags for link previews when shared
- Page title and meta description
- Alt text on all images (doubles as accessibility)

### Implementation Considerations

- Skip: native device features, CLI commands, real-time infrastructure
- Next.js Image component handles responsive srcset and format optimization
- Static export enables CDN-edge serving via Vercel
- No client-side routing needed

## Product Scope & Phased Development

### MVP Strategy

**Approach:** Experience MVP — deliver a high-quality photo viewing experience. Success = Bryan actively uses the site to share photography.

**Resource Requirements:** Solo developer. No team coordination overhead.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Journey 1 (Visitor browsing) — fully supported
- Journey 2 (Slow connection degradation) — supported via image pipeline
- Journey 3 (Owner adding content) — supported via JSON + file system

**Must-Have:**
- Responsive masonry gallery layout (1/2/3 column breakpoints)
- Distraction-free lightbox photo viewer
- EXIF metadata display in lightbox
- JSON-driven photo data management
- Next.js Image optimization (WebP/AVIF, responsive srcset)
- Vercel deployment at photos.bdailey.com
- Page load under 2 seconds

**Nice-to-Have (include if trivial):**
- SEO meta tags and Open Graph for link previews
- Basic accessibility (alt text, semantic HTML, color contrast)
- Keyboard navigation in lightbox
- Smooth lightbox open/close transitions

### Phase 2 (Growth)

- **Photo Tagging and Filtering:** Two-dimensional tag system — Location tags (e.g., "Japan", "Portugal", "NYC") and Genre tags (e.g., "Street", "Landscape", "Architecture"). Photos support multiple tags per dimension. Every photo requires at least one tag. Visitors filter the gallery by selecting tags, with combinable cross-dimension filtering. Designed to scale from <100 to 1000+ photos.
- Keyboard/swipe navigation in lightbox
- Print inquiry form
- Analytics integration
- MDX support for photo narratives
- EXIF auto-extraction tooling

### Phase 3 (Expansion)

- Print storefront with cart and checkout
- Password-protected client galleries
- Blog/stories integration
- Admin UI for content management
- Social sharing per photo

### Risk Mitigation

**Technical Risks:** Low. All technologies proven. Next.js SSG + Vercel is battle-tested.

**Market Risks:** None. Personal project with no market dependency.

**Content Friction Risk (Primary):** JSON editing is the riskiest assumption. If adding photos is tedious, Bryan won't maintain the site. Mitigation: minimal JSON schema, copy-paste friendly. Post-MVP: EXIF auto-extraction script.

## Functional Requirements

### Gallery Browsing

- FR1: Visitor can view all photos in a responsive masonry grid layout
- FR2: Visitor can see enough photos on initial load to understand the breadth of the portfolio
- FR3: Visitor can visually identify that more content exists below the fold
- FR4: Visitor can scroll through the full photo collection
- FR5: Visitor can view the gallery on mobile, tablet, and desktop devices

### Photo Viewing

- FR6: Visitor can select any photo from the gallery to view it in an enlarged, immersive view
- FR7: Visitor can view photos in a distraction-free presentation (photo only, no competing UI)
- FR8: Visitor can close the immersive view and return to the gallery
- FR9: Visitor can navigate between photos while in the immersive view

### Photo Metadata

- FR10: Visitor can view EXIF metadata for a photo (camera body, lens, focal length, aperture, shutter speed, ISO)
- FR11: System gracefully handles photos with incomplete or missing EXIF data

### Image Optimization

- FR12: System serves images in modern optimized formats (WebP/AVIF)
- FR13: System serves responsive image sizes appropriate to the visitor's viewport
- FR14: System maintains layout stability while images load (no content shift)
- FR15: System delivers the full page in under 2 seconds on standard broadband

### Content Management

- FR16: Site owner can add new photos by placing image files in the designated directory
- FR17: Site owner can define photo metadata (title, alt text, dimensions, EXIF, location tags, genre tags) in a JSON data file
- FR18: Site owner can publish updates by pushing to the main branch (auto-deploy)
- FR19: Site owner can remove or reorder photos by editing the JSON data file

### Photo Organization (Phase 2)

- FR20: Site owner can assign one or more Location tags (e.g., "Japan", "Portugal") to each photo via the JSON data file
- FR21: Site owner can assign one or more Genre tags (e.g., "Street", "Landscape") to each photo via the JSON data file
- FR22: Every photo in the collection has at least one Location or Genre tag assigned
- FR23: Visitor can filter the gallery grid by selecting a Location tag
- FR24: Visitor can filter the gallery grid by selecting a Genre tag
- FR25: Visitor can combine Location and Genre filters to narrow results (e.g., "Japan" + "Street")
- FR26: Active filters persist when the visitor opens and closes the lightbox

## Non-Functional Requirements

### Performance

- NFR1: Full page load completes in under 2 seconds on standard broadband connections
- NFR2: Lightbox opens and displays the selected photo with no perceptible delay (feels instant)
- NFR3: Gallery layout remains stable during image loading — no visible content shift (CLS < 0.1)
- NFR4: Images are served in next-gen formats (WebP/AVIF) with responsive sizing to minimize transfer

### Accessibility (Nice-to-Have)

- NFR5: All gallery images include descriptive alt text
- NFR6: Page uses semantic HTML elements (header, main, figure)
- NFR7: Text elements maintain sufficient color contrast against backgrounds
