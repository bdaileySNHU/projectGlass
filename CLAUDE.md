# projectGlass

Photo portfolio at https://photos.bdailey.com. App lives in `project-glass/` (Next.js App Router, Tailwind v4, TypeScript). Run all npm commands from `project-glass/`, not the repo root.

## Adding new photos (the curation workflow)

When Bryan says "add the new photos" (or similar), the images are already in `project-glass/public/photos/`. Do this:

1. `npm run sync-photos` — creates entries in `data/photos.json` with EXIF/dimensions and empty `alt`/`title`/`tags`. Heed any size warnings (>2MB → suggest re-export before committing).
2. **Read each new image file with the Read tool and look at it.** Write `alt` (concrete description of what's in the frame), `title` (short display name), and `tags` from what the photo actually shows — never guess from the filename (this has caused real mislabels).
3. Tags: `location` and `genre` arrays, title case. Reuse the existing vocabulary before inventing new tags — check current values in `photos.json` (e.g. Japan, Tokyo, Kyoto, Maine; Theme Park, Nature, Street, Landscape, Wildlife).
4. Optional `description`: Markdown narrative shown in the lightbox (paragraphs, bold, italic, links). Only when Bryan provides the story or asks for one.
5. `npm run validate-photos` — must pass (blank alt or empty tags fail CI too).
6. Commit photo + JSON together; push. CI runs the full gate.

## Quality gates

`npm run validate-photos && npm run lint && npm run type-check && npm test && npm run build` — all must pass; CI (`.github/workflows/ci.yml`) enforces the same on every push.

## Deploy

VPS at `/var/www/projectGlass`, PM2 app `glass` behind nginx. Manual: `git pull`, then `cd project-glass && npm install && ./deploy.sh`. CI auto-deploy job exists but only runs when the repo variable `AUTO_DEPLOY` is `true` (needs `VPS_HOST`/`VPS_USER`/`VPS_SSH_KEY` secrets).

## Planning artifacts

BMad sprint tracking in `_bmad-output/` (`implementation-artifacts/sprint-status.yaml` is the source of truth for story status). Update status only after verification evidence exists.
