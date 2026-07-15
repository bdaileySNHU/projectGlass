# Decision Log — projectGlass

| ID | Date | Decision | Status | Rationale |
|---|---|---|---|---|
| D-001 | 2026-02-10 | Use Next.js, flat JSON metadata, and filesystem-backed photos. | Accepted | Keeps a personal portfolio simple and fast. |
| D-002 | 2026-02-10 | Use a dark, minimal public gallery with a lightbox. | Accepted | The grid and photographs remain the product. |
| D-003 | 2026-07-13 | Treat timed slideshow playback as a separate `/slideshow` or `/display` mode, not normal lightbox behavior. | Accepted | Public browsing remains visitor-controlled; office display has different needs. |
| D-004 | 2026-07-13 | TV display visual language: warm-white matte, thin black keyline, complete photo, editorial footer metadata. | Accepted | Matches the supplied framed-print references and remains readable at a distance. |
| D-005 | 2026-07-13 | Never auto-publish incoming photos. | Accepted | Automation handles derivatives, EXIF, validation, and PR creation; Bryan retains curation and release approval. |
| D-006 | 2026-07-13 | Do not publish precise location/GPS data by default. | Accepted | Public metadata should use deliberate city/region labels only. |
| D-007 | 2026-07-13 | Generate web/TV derivatives rather than commit original camera files. | Proposed | Keeps repository/deploy payload manageable while retaining 4K-quality display assets. |
| D-008 | 2026-07-13 | Add CI validation before any automated VPS deployment. | Proposed | A deployment must fail closed when content, lint, tests, types, or build are invalid. |
| D-009 | 2026-07-15 | Represent public gallery filter state in query parameters and use a dedicated mobile filter affordance. | Proposed | Links should restore a curated view, while small screens need discoverable controls with accessible touch targets rather than hidden horizontal overflow. |
