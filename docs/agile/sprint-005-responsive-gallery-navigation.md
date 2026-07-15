# Sprint 005 — Responsive Gallery Navigation and Shareable States

**Status:** Planned  
**Goal:** Make gallery filtering comfortable and discoverable on small screens, while letting visitors share and restore a filtered public-gallery view.

## Commitment

| Story | Commitment |
|---|---|
| E17.1 | Replace the hidden-overflow mobile filter treatment with a discoverable, accessible, touch-friendly control. |
| E17.2 | Synchronize location and genre selections with public URL query parameters and browser navigation. |

## Acceptance criteria

- [ ] At mobile widths, every available location and genre filter is discoverable without relying on an invisible horizontal-scroll affordance.
- [ ] Interactive filter controls have a minimum 44px target in both dimensions and retain clear active/inactive state.
- [ ] Visitors can clear all active filters in one explicit action.
- [ ] The selected location and genre are represented by documented, shareable query parameters.
- [ ] Loading a valid filtered URL restores the matching gallery selection before a visitor interacts.
- [ ] Browser Back/Forward changes the visible gallery state predictably.
- [ ] Missing, malformed, or unavailable query values do not throw or leave the UI in an impossible state.
- [ ] Filtering continues to constrain available companion tags; lightbox navigation remains within the filtered collection.
- [ ] The current low-chrome, photo-first desktop presentation remains intact.

## Likely files

- `project-glass/src/components/CategoryFilter.tsx`
- `project-glass/src/components/Gallery.tsx`
- `project-glass/src/utils/photoFilters.ts`
- `project-glass/src/components/__tests__/CategoryFilter.test.tsx` (new or equivalent)
- `project-glass/src/components/__tests__/Gallery.test.tsx` (new or equivalent)
- `project-glass/src/app/page.tsx` if server/client query-state boundaries require it

## Implementation notes

- Use documented query parameter names for location and genre; normalize and validate values against the available taxonomy rather than trusting arbitrary input.
- Keep shareable state limited to public filter selections. Do not add accounts, persistent visitor profiles, or analytics-dependent behavior.
- Prefer a compact filter trigger/drawer, accordion, or wrapped control group below the small-screen breakpoint. Preserve the existing inline centered controls from `sm` upward unless implementation evidence shows a better shared design.
- Preserve ARIA pressed state and visible keyboard focus. Do not use color alone to communicate active state.
- Retain the current behavior where the available genres depend on the selected location and vice versa.

## Verification record

| Check | Method | Observed result |
|---|---|---|
| Query parsing and normalization | focused unit/component tests | 45 tests in `filterParams.test.ts` pass (valid, unknown, case-insensitive, encoded, garbage, round-trip) |
| Filter interaction | keyboard, pointer, and touch-emulation checks | Pending — manual browser check on live site |
| Responsive layout | browser screenshots/inspection at 320px, 375px, 768px, and desktop widths | Pending — manual browser check on live site |
| History and sharing | direct-load, copy/paste, Back, and Forward checks | Pending — manual browser check on live site |
| Filtered lightbox | open/navigate/close after applying each filter combination | Pending — manual browser check on live site |
| Quality gate | `npm run lint && npm run type-check && npm test && npm run build` | All pass, 128 tests, zero lint errors/warnings (2026-07-15) |

## Out of scope

- Individual-photo deep links and lightbox URL state.
- New taxonomy, featured collections, caption overlays, downloads, storefronts, accounts, or CMS/admin features.
- Changes to the separate office-display slideshow route.
