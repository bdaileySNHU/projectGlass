# Sprint 004 — Automated Verification and VPS Deployment

**Status:** Planned  
**Goal:** Make a validated merge to `main` deploy reproducibly to the existing VPS while retaining a clear, safe rollback path.

## Commitment

| Story | Commitment |
|---|---|
| E13.1 | Add CI checks for content and application quality. |
| E13.2 | Add a protected, least-privilege deployment path. |
| E13.3 | Add post-deploy evidence and rollback documentation. |

## Acceptance criteria

- [ ] Pull requests and pushes run photo validation, tests, lint, type-check, and production build.
- [ ] A failed workflow cannot reach the deploy job.
- [ ] Only the intended protected `main` workflow can deploy.
- [ ] Credentials use repository/environment secrets; no VPS password, private key, or analytics secret is committed.
- [ ] Deployment invokes the existing standalone/PM2 process safely and preserves static assets.
- [ ] Post-deploy confirms the expected public route responds and exposes the expected release/version signal.
- [ ] Operators have documented commands to inspect logs, identify the prior release, and restore it.

## Likely files

- `project-glass/.github/workflows/ci.yml` (new)
- `project-glass/.github/workflows/deploy.yml` (new) or a single gated workflow
- `project-glass/deploy.sh`
- `project-glass/ecosystem.config.js`
- `project-glass/README.md`
- `docs/operations/deployment.md` (new)
- `.env.example`

## Security boundaries

- Never expose a general-purpose shell endpoint to GitHub.
- Use a narrowly scoped deployment user/key on the VPS.
- Separate build/test credentials from production deployment credentials.
- Fail closed on missing secret, failed build, failed health check, or unexpected target branch.

## Verification record

| Check | Method | Observed result |
|---|---|---|
| CI success path | test PR/branch | Pending |
| CI failure path | intentionally failing fixture/branch | Pending |
| Deploy | authorized main merge | Pending |
| Live smoke check | `https://photos.bdailey.com` and `/slideshow` | Pending |
| Rollback rehearsal | documented process | Pending |

## Out of scope

- Multi-region deployment, containers, Kubernetes, preview environments, or a generalized deployment platform.
