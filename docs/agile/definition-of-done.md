# Definition of Done — projectGlass

A story is Done only when its acceptance criteria are demonstrably satisfied.

## Code and content

- [ ] Implementation follows the existing Next.js/TypeScript conventions and adds no unrelated refactor.
- [ ] New photo data has a stable ID, matching published asset, descriptive alt text, and at least one curated Location or Genre tag.
- [ ] Display-specific metadata is editorially reviewed; raw GPS is not published by default.
- [ ] New behavior has focused automated coverage where it is deterministic; visual/device behavior has a written browser or TV smoke checklist.

## Quality gate

Run from `project-glass/` and record the observed results:

```bash
npm test
npm run lint
npm run type-check
npm run build
```

For ingestion work, also run the photo validator once it exists. For deployment work, run the CI workflow and an authorized live smoke check.

## Release gate

- [ ] `git diff --check` is clean.
- [ ] The intended public route works in a browser after deployment.
- [ ] TV-display stories have been checked at the target 16:9 resolution and actual input method.
- [ ] Documentation and BMad sprint status reflect observed—not assumed—state.
- [ ] A focused commit exists and the worktree is clean.

## Non-negotiable experience gates

- No feature may add persistent chrome that competes with photographs.
- The gallery must remain responsive and accessible on mobile.
- The display route must preserve complete images (`object-fit: contain`) rather than crop portrait compositions.
- Automation must fail closed: validation or build failure prevents publishing/deployment.
