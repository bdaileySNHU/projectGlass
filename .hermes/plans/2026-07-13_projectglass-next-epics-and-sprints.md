# projectGlass — Next Epics and Sprint Plan

> **For Hermes:** Use `subagent-driven-development` to execute one sprint task at a time; run a spec-compliance review and then a code-quality review before moving to the next task.

**Goal:** Turn the currently functional photo gallery into a curated, filterable, reliably deployable portfolio while retaining its intentionally quiet, photo-first experience.

**Architecture:** Keep the current static data flow (`data/photos.json` → server `page.tsx` → client `Gallery.tsx`). Add only small pure utilities for content validation and filtering; `Gallery` remains the one client-state boundary. Continue using `yet-another-react-lightbox` rather than writing a custom viewer. Operational changes remain minimal: GitHub Actions verifies the build and deploys over SSH to the existing standalone Next.js/PM2/nginx setup.

**Tech stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, `react-photo-album`, `yet-another-react-lightbox`, GitHub Actions, existing VPS/PM2/nginx deployment.

---

## Current evidence and planning assumptions

- The deployed site is healthy and currently has **8 photos**. Its existing lightbox opens and supports desktop arrow-key navigation.
- The local worktree contains one uncommitted addition: `project-glass/public/photos/cheetah.jpeg` plus its `data/photos.json` entry. Local metadata has **9 entries**.
- All 9 local entries still have empty tag sets; 5 have empty alt text and title. Category filtering cannot be useful until this content is curated.
- Existing test coverage is limited to the photo-sync script: `scripts/__tests__/sync-photos.test.ts` (27 passing tests). The app has no component or filter-logic tests yet.
- `npm run type-check` and `npm run build` pass. `npm run lint` currently fails on five errors and emits two warnings.
- Existing documentation says push-to-main auto-deploys, but the repository has no CI workflow. Actual deploy is manual through `project-glass/deploy.sh` and PM2.
- "Slideshow" is treated as the existing lightbox navigation experience. **Timed/autoplay playback is out of scope** unless Bryan explicitly decides he wants it; it would work against the calm, visitor-controlled gallery design.

## Priority order

| Priority | Sprint | Epic | Outcome | Why now |
|---|---|---|---|---|
| P0 | Sprint 1 | Release hygiene (enabling work) | Curated, validated, deployable 9-photo baseline | Content is the prerequisite for filters and accessibility. |
| P1 | Sprint 2 | Epic 6 — Categories & Organization | Two-dimensional location/genre filtering | The most valuable planned visitor capability; already designed in the PRD. |
| P2 | Sprint 3 | Epic 7 — Lightbox Enhancements & Narratives | Correctly tracked navigation plus optional photo stories | Deepens viewing without adding competing chrome. |
| P3 | Sprint 4 | Epic 8 — Inquiry & Privacy-first Analytics | Opt-in operational insight and a subdued inquiry path | Only useful after the portfolio is curated and discoverable. |

## Definition of Done for every sprint

1. The sprint acceptance criteria are checked against a local browser and the live site after deploy when deployment is in scope.
2. `npm test`, `npm run lint`, `npm run type-check`, and `npm run build` pass with no errors. Warnings are either resolved or explicitly documented and accepted.
3. `git diff --check` is clean; no generated `.next/` output or unintended photo assets are committed.
4. Story/sprint status is updated only after the verification evidence exists.
5. The sprint ends with a focused commit and a clean working tree.

---

# Sprint 1 — Curated Content and Release Hygiene

**Sprint goal:** Publish the cheetah photo and make the data/deployment baseline trustworthy enough for the filtering feature.

**Epic relationship:** Enabling sprint before Epic 6. It resolves the current gap between planning documents, source data, linting, and deployment reality.

## Sprint acceptance criteria

- All photos in `project-glass/data/photos.json` have unique IDs, a matching asset under `project-glass/public/photos/`, non-empty descriptive `alt` text, and at least one Location or Genre tag.
- Every tag is title case and only uses the documented `location` / `genre` arrays.
- The cheetah photo is curated and live at `photos.bdailey.com`.
- Lint, type-check, unit tests, and production build all pass.
- The deploy path is documented truthfully and has a repeatable verification checklist; no false claim of existing auto-deploy remains.

### Task 1: Establish a data-quality validator

**Objective:** Make the content contract executable before adding a UI that relies on tags.

**Files:**
- Create: `project-glass/src/utils/photoValidation.ts`
- Create: `project-glass/src/utils/photoValidation.test.ts`
- Modify: `project-glass/package.json`

**Steps:**
1. Write unit tests for duplicate IDs, an empty alt string, an entry whose `src` has no matching asset, malformed tag shapes, and an entry with both tag arrays empty.
2. Implement a pure validator with this contract:
   ```ts
   export type PhotoValidationIssue = {
     id: string;
     field: "id" | "src" | "alt" | "tags";
     message: string;
   };

   export function validatePhotos(
     photos: Photo[],
     assetSources: Set<string>,
   ): PhotoValidationIssue[];
   ```
3. Add `"validate-photos": "tsx scripts/validate-photos.ts"` to `package.json` and create `project-glass/scripts/validate-photos.ts` as a small CLI that reads `data/photos.json`, gathers supported files from `public/photos`, prints issues, and exits non-zero on invalid content.
4. Run `npm test -- src/utils/photoValidation.test.ts` first to observe failure, implement the minimum behavior, then rerun to pass.

**Verification:**
```bash
npm test -- src/utils/photoValidation.test.ts
npm run validate-photos
```
Expected: all validator tests pass; the real collection is accepted only after curation is complete.

### Task 2: Curate the full 9-photo collection

**Objective:** Make the data satisfy the site’s accessibility and filtering requirements, including the new cheetah image.

**Files:**
- Modify: `project-glass/data/photos.json`
- Add: `project-glass/public/photos/cheetah.jpeg` (already present locally; confirm it is intentional)

**Steps:**
1. Preserve existing IDs and technical EXIF fields unless an observed error needs correction.
2. Add concise, scene-specific alt text for every currently blank image; describe the image rather than filename, camera, or subjective quality.
3. Add a display title where it materially helps the lightbox; descriptions remain optional.
4. Tag every photo with at least one Location or Genre value. Reuse a small controlled vocabulary (for example `Japan`, `Maine`, `Wildlife`, `Theme Parks`, `Landscape`, `Architecture`) rather than inventing near-duplicate labels.
5. Confirm the cheetah entry uses the exact asset path and has descriptive alt text and tags.
6. Run the validator and inspect the gallery locally at mobile, tablet, and desktop widths.

**Verification:**
```bash
npm run validate-photos
npm run type-check
npm run build
```
Expected: zero validation issues and a successful static build.

### Task 3: Repair lint without weakening rules

**Objective:** Restore a meaningful green lint gate before CI uses it.

**Files:**
- Modify: `project-glass/ecosystem.config.js` or add an ESLint narrow override only if CommonJS must remain for PM2.
- Modify: `project-glass/scripts/__tests__/sync-photos.test.ts`
- Modify: `project-glass/scripts/sync-photos.ts`
- Modify only the relevant ESLint configuration if an exception is demonstrably required.

**Steps:**
1. Replace test `any` values with `Photo[]`, `Partial<Photo>`, or a narrowly defined fixture type.
2. Remove or use `CURATED_FIELDS`; do not suppress the unused-variable warning globally.
3. Resolve CommonJS linting in the PM2 config by either converting to a compatible module format or applying the smallest file-specific configuration exception. Preserve PM2 behavior.
4. Run lint after each small change; do not disable the rules repository-wide.

**Verification:**
```bash
npm run lint
npm test
npm run type-check
npm run build
```
Expected: all commands exit 0.

### Task 4: Make release status explicit and deploy the curated release

**Objective:** Remove ambiguity about what is deployed and prove the release process works.

**Files:**
- Modify: `project-glass/README.md`
- Modify: `project-glass/deploy.sh` only if a real defect is found during dry-run review
- Modify: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Optionally create: `project-glass/docs/operations/deployment.md`

**Steps:**
1. Update README content-management instructions to point at the real `data/photos.json` location and `npm run sync-photos` / `npm run validate-photos` workflow.
2. Document the current manual deployment process and live smoke check: deploy, open the public URL, confirm photo count, open a newly added photo, and inspect browser console for errors.
3. Do **not** claim CI/CD exists yet.
4. Deploy through the existing authorized path; verify the cheetah photo on the live site before marking the sprint done.
5. Commit the coherent sprint release.

**Verification:**
```bash
npm test && npm run lint && npm run type-check && npm run build
# Then use the real deployment path and browser-check https://photos.bdailey.com
```

---

# Sprint 2 — Epic 6: Categories and Organization

**Sprint goal:** Let visitors narrow the gallery by Location and Genre without losing the current minimal, calm visual design.

## Sprint acceptance criteria

- Visitors can select a Location, a Genre, or both; results satisfy intersection semantics.
- The inactive dimension shows only choices still capable of producing results.
- "All" clears one dimension at a time.
- The lightbox uses the currently filtered set and filters remain selected after close.
- Filter rows are horizontally scrollable on mobile and centered on larger viewports.
- Filtering has deterministic unit coverage, and empty-result behavior is intentionally designed rather than accidental.

### Task 1: Add tested, pure filtering selectors

**Objective:** Keep filtering rules out of JSX and prove them independently of layout.

**Files:**
- Create: `project-glass/src/utils/photoFilters.ts`
- Create: `project-glass/src/utils/photoFilters.test.ts`

**Steps:**
1. Write failing cases for: no filters, one Location, one Genre, both filters, a multi-tag photo, available Genres after a Location selection, available Locations after a Genre selection, and a zero-match selection.
2. Implement exact selectors:
   ```ts
   export function filterPhotos(
     photos: Photo[],
     activeLocation: string | null,
     activeGenre: string | null,
   ): Photo[];

   export function availableLocations(
     photos: Photo[],
     activeGenre: string | null,
   ): string[];

   export function availableGenres(
     photos: Photo[],
     activeLocation: string | null,
   ): string[];
   ```
3. Return alphabetically sorted, de-duplicated tag lists; retain `photos.json` order for visible photos.
4. Run the focused test, implement, then run the full test suite.

**Verification:**
```bash
npm test -- src/utils/photoFilters.test.ts
npm test
```

### Task 2: Build the minimal `CategoryFilter` component

**Objective:** Render accessible controls without introducing a heavy UI dependency.

**Files:**
- Create: `project-glass/src/components/CategoryFilter.tsx`
- Create: `project-glass/src/components/CategoryFilter.test.tsx` only if a React test renderer is introduced; otherwise use a documented browser acceptance checklist.
- Modify: `project-glass/src/app/globals.css` only for a necessary library/mobile-scrollbar override.

**Steps:**
1. Accept location/genre options, selected values, and selection callbacks as explicit props; do not read JSON in the component.
2. Render native `<button type="button">` controls with `aria-pressed` and visible focus styles.
3. Follow the existing UX spec: subdued `text-xs font-light tracking-widest uppercase`, active accent plus bottom border, and horizontally scrollable mobile rows.
4. Keep "All" first in each row and make its active state unambiguous.
5. Manually verify keyboard tab/focus/activation and touch horizontal scrolling in a real browser.

**Verification:**
```bash
npm run lint
npm run type-check
npm run build
```

### Task 3: Integrate filters in `Gallery` and scope the lightbox

**Objective:** Make the current gallery and lightbox reflect the same filtered collection.

**Files:**
- Modify: `project-glass/src/components/Gallery.tsx`
- Modify: `project-glass/src/components/PhotoCard.tsx` only if a stable key/accessibility adjustment is needed.

**Steps:**
1. Add `activeLocation` and `activeGenre` state to `Gallery`; derive visible photos using `useMemo` and `filterPhotos`.
2. Pass visible photos—not the complete collection—to both `MasonryPhotoAlbum` and `Lightbox`.
3. Reset the selected lightbox index to `-1` when a filter change would make the selected item invalid.
4. Add a restrained empty-state message only if curated tags can produce zero results; avoid a card-like UI.
5. Add a short opacity transition around the gallery swap; honor `prefers-reduced-motion`.

**Browser acceptance checklist:**
- Location only, Genre only, and combined selection produce the expected set.
- Changing filters while the lightbox is open cannot show an out-of-range slide.
- Closing the lightbox preserves selected filters.
- Lightbox next/previous navigation stays inside the filtered collection.
- At 375px width, rows scroll horizontally without page-level horizontal overflow; at desktop width, rows are centered.

### Task 4: Close Epic 6 with a release and documentation update

**Files:**
- Modify: `project-glass/README.md`
- Modify: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Modify: `_bmad-output/implementation-artifacts/6-1-*.md`, `6-2-*.md`, and `6-3-*.md` after creating them from the existing story definitions.

**Steps:**
1. Document the controlled tag vocabulary and content-author workflow.
2. Update the three Epic 6 story records only after their acceptance tests pass.
3. Run the full quality gate, deploy, and browser-test the public site.
4. Commit as `feat: add gallery category filters`.

---

# Sprint 3 — Epic 7: Lightbox Quality and Photo Narratives

**Sprint goal:** Reconcile the stale navigation story with reality, then add optional stories only where they improve a photo’s context.

## Sprint acceptance criteria

- Story 7.1 is correctly marked as completed **only after** desktop keyboard, mobile swipe, captions, wrap behavior, and filtered-set navigation have been verified on the real site.
- Every current navigation behavior is visitor-controlled; no timed autoplay is introduced.
- A photo can have an optional narrative without turning the lightbox into a content-heavy overlay.
- Narrative content supports only the Markdown subset actually required: paragraphs, emphasis, strong text, and safe links.

### Task 1: Reconcile and prove navigation behavior

**Files:**
- Modify: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Create: `_bmad-output/implementation-artifacts/7-1-keyboard-and-swipe-navigation.md`
- Modify: `project-glass/src/components/Gallery.tsx` only if testing shows wrap-around or touch configuration is missing.

**Steps:**
1. Establish whether `yet-another-react-lightbox` defaults match the documented wrap-around expectation on the installed version.
2. Verify keyboard, previous/next buttons, touch swipe, Escape/close, scroll restoration, and caption updates on a representative mobile and desktop browser.
3. If a gap is found, add only the library configuration needed to meet the documented behavior; do not replace the lightbox library.
4. Record real browser evidence and then close Story 7.1. If wrap-around is not desirable after live testing, explicitly amend the story instead of silently shipping divergent behavior.

### Task 2: Extend the photo type and data contract for narratives

**Files:**
- Modify: `project-glass/src/types/photo.ts`
- Modify: `project-glass/data/photos.json`
- Modify: `project-glass/src/utils/photoValidation.ts`
- Modify: `project-glass/src/utils/photoValidation.test.ts`

**Steps:**
1. Add `description?: string` to `Photo`.
2. Keep it optional and allow it to be absent/empty; content must not become a mandatory curation burden.
3. Add validation limiting only unsafe or malformed values appropriate to the selected renderer; do not over-validate prose.
4. Add one or two real narratives to prove the content shape, leaving other photos unchanged.

### Task 3: Render a constrained Markdown narrative in the lightbox

**Files:**
- Modify: `project-glass/package.json`
- Modify: `project-glass/src/components/Gallery.tsx`
- Create: `project-glass/src/components/PhotoNarrative.tsx`
- Create: `project-glass/src/components/PhotoNarrative.test.tsx` if a React test setup is added.
- Modify: `project-glass/src/app/globals.css` only for a necessary, narrow lightbox override.

**Steps:**
1. Select a maintained renderer that does not render raw HTML by default. Add it only after checking bundle impact and the required Markdown subset.
2. Render the narrative below EXIF, using muted, readable `text-sm` typography and constrained line length.
3. Ensure external links are safe (`rel="noreferrer"` when opening a new tab) and that the absence of a description produces no empty space.
4. Use manual browser checks for typography, mobile viewport, and keyboard focus order.

### Task 4: Release Epic 7

**Files:**
- Modify: `project-glass/README.md`
- Modify: relevant BMad story/status files.

**Verification:**
```bash
npm test && npm run validate-photos && npm run lint && npm run type-check && npm run build
```
Then deploy and test a narrated photo plus a non-narrated photo on mobile and desktop.

---

# Sprint 4 — Epic 8: Inquiry and Privacy-first Analytics

**Sprint goal:** Add only the professional signals that help Bryan understand interest and receive print inquiries, without adding cookies, surveillance, or visual clutter.

**Decision gate before implementation:** Bryan chooses (a) whether print inquiries should exist now, and (b) an analytics provider consistent with the privacy requirement. If there is no clear use for either, defer this sprint rather than adding dormant integrations.

## Sprint acceptance criteria

- Analytics is disabled by default in local development, is loaded asynchronously in production only, sets no cookies, and does not collect personal data.
- A lightbox opening records a photo identifier only when analytics is enabled.
- A print inquiry action is available only if Bryan opts in; it opens a correctly encoded `mailto:` draft and does not expose a personal email in an easy-to-scrape source without a conscious tradeoff decision.
- No buttons or prompts compete with the photo; all additions remain subordinate to the image.

### Task 1: Decide and document provider boundaries

**Files:**
- Create: `project-glass/docs/decisions/001-inquiry-and-analytics.md`
- Create: `project-glass/.env.example`

**Steps:**
1. Compare only providers that meet the no-cookie requirement and fit the existing self-hosted/VPS environment.
2. Define public, non-secret variables such as `NEXT_PUBLIC_ANALYTICS_ENABLED` and provider endpoint/site ID only when needed.
3. Record what events are permitted: page view and `lightbox_open` with `photo.id`; explicitly prohibit full EXIF, alt text, IP storage by application code, and visitor-identifying metadata.
4. Decide whether inquiry is a `mailto:` link or is deferred; do not build a form/backend in this sprint.

### Task 2: Add a small analytics boundary

**Files:**
- Create: `project-glass/src/lib/analytics.ts`
- Create: `project-glass/src/lib/analytics.test.ts`
- Modify: `project-glass/src/app/layout.tsx`
- Modify: `project-glass/src/components/Gallery.tsx`

**Steps:**
1. Encapsulate analytics behind `trackPageView()` and `trackLightboxOpen(photoId)` no-op functions when disabled.
2. Add the provider script using the framework-supported async/script mechanism only when enabled.
3. Trigger `trackLightboxOpen` on a transition from closed to a selected photo, not on every render or next/previous navigation.
4. Unit-test disabled behavior and event payload construction without network calls.

### Task 3: Add the optional inquiry action

**Files:**
- Create: `project-glass/src/utils/printInquiry.ts`
- Create: `project-glass/src/utils/printInquiry.test.ts`
- Modify: `project-glass/src/components/Gallery.tsx`

**Steps:**
1. Implement a pure `buildPrintInquiryUrl(photo: Pick<Photo, "id" | "title">): string` function using `URLSearchParams` for subject/body encoding.
2. Show the subdued action only after the product decision is affirmative and an owner contact configuration exists.
3. Browser-test a title present and title absent photo; confirm URL encoding and mobile visibility.

### Task 4: Measure, release, and decide whether Epic 8 remains justified

**Verification:**
```bash
npm test && npm run validate-photos && npm run lint && npm run type-check && npm run build
```
- Run a browser performance check on the deployed site before and after analytics; investigate if LCP or initial JS payload regresses materially.
- Confirm no analytics request is emitted in local development.
- Deploy only after the privacy behavior is confirmed.

---

## Explicit deferrals

- **Autoplay/timed slideshow:** no user value established; conflicts with visitor-controlled browsing.
- **Storefront, checkout, accounts, and password-protected galleries:** Phase 3 scope; would introduce payment/auth/security work disproportionate to this portfolio’s present need.
- **Admin CMS:** defer while JSON + `sync-photos` + validation keeps curation fast.
- **Search, pagination, social UI, comments, or likes:** violate the defined “quiet gallery” experience.

## Cross-sprint risks and mitigations

| Risk | Mitigation |
|---|---|
| Filters become unusable due to inconsistent tags | Establish controlled vocabulary and machine-check non-empty tags before building UI. |
| Narrative renderer expands JS or introduces unsafe HTML | Use a constrained renderer without raw HTML; measure build output and keep Markdown subset small. |
| CI/CD could deploy a bad content update | Make `validate-photos`, lint, type-check, tests, and build required CI checks before SSH deploy. |
| Manual deploy docs diverge again | Update the README and operations doc in the same sprint as the deployment mechanism change. |
| Feature creep competes with photographs | Use the PRD’s “grid is the product” principle as the release gate for every new UI element. |

## Recommended execution cadence

- **Sprint 1:** one short, focused release-hardening sprint.
- **Sprint 2:** one feature sprint for filters, ending in a deployed user-visible improvement.
- **Sprint 3:** one polish/content sprint; narrative work can be stopped after navigation reconciliation if no real photo stories are ready.
- **Sprint 4:** optional; begin only after Bryan makes the analytics/inquiry decision gate explicit.

This sequence delivers the highest-value visitor feature first (filters), makes the site’s operational claims true, and avoids turning a restrained photo gallery into a generic portfolio platform.
