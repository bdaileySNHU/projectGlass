# Story 4.1: Production Build and VPS Deployment

Status: done

## Story

As a **site owner**,
I want the site deployed to my VPS and accessible at photos.bdailey.com,
so that I can share the link with friends and family and publish updates by pushing to main.

## Acceptance Criteria

1. **Given** the application is feature-complete locally **When** `npm run build` is executed **Then** Next.js produces a standalone build in `.next/standalone/` **And** the build completes without errors

2. **Given** the standalone build exists **When** the project is deployed to the VPS **Then** PM2 runs `.next/standalone/server.js` with `NODE_ENV=production` on port 3000 **And** the process auto-restarts on failure **And** PM2 ecosystem config is documented (`ecosystem.config.js`)

3. **Given** PM2 is running the application **When** nginx is configured as a reverse proxy **Then** requests to `photos.bdailey.com` are proxied to `127.0.0.1:3000` **And** proper headers are set (`Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`) **And** TLS is configured via Let's Encrypt / certbot

4. **Given** the site is live at photos.bdailey.com **When** Bryan pushes changes to the main branch **Then** a documented deploy workflow exists (git pull → npm run build → pm2 restart glass) (FR18)

5. **Given** the site is live **When** a visitor loads photos.bdailey.com **Then** the full page loads in under 2 seconds on standard broadband **And** images are served in WebP/AVIF via Next.js Image optimization **And** the site matches the localhost development experience exactly

## Tasks / Subtasks

- [x]Task 1: Verify production build (AC: #1)
  - [x]Run `npm run build` — confirm zero errors
  - [x]Verify `.next/standalone/server.js` exists
  - [x]Verify `.next/static/` directory exists with client JS bundles
- [x]Task 2: Test standalone server locally (AC: #1, #5)
  - [x]Copy `public/` to `.next/standalone/public/`
  - [x]Copy `.next/static/` to `.next/standalone/.next/static/`
  - [x]Run `PORT=3000 NODE_ENV=production node .next/standalone/server.js`
  - [x]Verify `http://localhost:3000` renders the gallery correctly
  - [x]Verify images load (photos are served from `public/photos/`)
  - [x]Verify lightbox opens and shows EXIF data
- [x]Task 3: Create deployment script (AC: #2, #4)
  - [x]Create `deploy.sh` in project root with: build, copy static assets, pm2 restart
  - [x]Create `ecosystem.config.js` in project root for PM2 configuration
- [x]Task 4: Create nginx config template (AC: #3)
  - [x]Create `nginx/photos.bdailey.com.conf` with reverse proxy and header config
  - [x]Include comments for certbot TLS setup
- [x]Task 5: Validate full local production test (AC: #1-5)
  - [x]Run `deploy.sh` locally (build + copy steps only)
  - [x]Start standalone server and verify all features work
  - [x]Confirm `npx tsc --noEmit` still passes

## Dev Notes

### Next.js Standalone Output

`output: "standalone"` is already configured in `next.config.ts` (set in Story 1.1). The standalone build produces a self-contained `server.js` that includes only necessary dependencies — no `node_modules` needed in production.

**Critical:** Next.js standalone does NOT automatically copy `public/` or `.next/static/`. These must be copied manually:
```bash
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```
Without this, photos won't load and client-side JS will 404.

### deploy.sh

```bash
#!/bin/bash
set -e

echo "Building..."
npm run build

echo "Copying static assets..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

echo "Restarting PM2..."
pm2 restart glass --update-env

echo "Deploy complete."
```

### ecosystem.config.js

```js
module.exports = {
  apps: [{
    name: 'glass',
    script: '.next/standalone/server.js',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
    },
  }],
};
```

### nginx config

```nginx
server {
    listen 80;
    server_name photos.bdailey.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
# After placing this config:
#   sudo ln -s /etc/nginx/sites-available/photos.bdailey.com.conf /etc/nginx/sites-enabled/
#   sudo nginx -t && sudo systemctl reload nginx
#   sudo certbot --nginx -d photos.bdailey.com
```

### VPS Deploy Workflow (Manual)

```
1. SSH to VPS
2. cd /path/to/project-glass
3. git pull origin main
4. bash deploy.sh
```

Future: automate via GitHub webhook or Actions.

### What This Story Produces (In Repo)

- `deploy.sh` — build + copy + restart script
- `ecosystem.config.js` — PM2 process config
- `nginx/photos.bdailey.com.conf` — nginx reverse proxy template

### What Happens on VPS (NOT in repo, manual setup)

- DNS: A/AAAA record for `photos.bdailey.com` → VPS IP
- nginx: config installed + certbot TLS
- PM2: initial `pm2 start ecosystem.config.js` then `pm2 save`
- Node.js: must be installed on VPS (v20+)

### Anti-Patterns

- Do NOT include `node_modules` in the standalone deployment — standalone bundles its own dependencies.
- Do NOT forget to copy `public/` and `.next/static/` — the standalone build does not include these.
- Do NOT hardcode the port — use the `PORT` env variable.
- Do NOT run `npm start` in production — use `node .next/standalone/server.js` directly.

### References

- [Source: architecture.md#Deployment Strategy] — Standalone output, PM2, nginx stack
- [Source: architecture.md#Deployment Structure] — File layout, ecosystem.config.js, nginx config
- [Source: prd.md#NFR1] — Full page load < 2 seconds
- [Source: prd.md#NFR4] — WebP/AVIF image optimization
- [Source: epics.md#Story 4.1] — Full acceptance criteria

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

- `npm run build` completed successfully — static pages generated (4/4), zero errors.
- `npx tsc --noEmit` passed with zero errors.
- `npx eslint src/` passed with zero errors.
- Standalone server tested: `PORT=3000 NODE_ENV=production node server.js` — HTTP 200, all 3 photos rendered, images loaded.
- **Code Review Fixes**:
  - Improved `deploy.sh` to handle initial starts via `pm2 start ecosystem.config.js` fallback.
  - Refactored `ecosystem.config.js` to use Node.js filesystem logic instead of shell commands.
  - Added configurable `PORT` env support to `ecosystem.config.js`.
  - Staged all untracked artifacts (`deploy.sh`, `ecosystem.config.js`, `nginx/`) in git.

### Completion Notes List

- AC#1: `npm run build` produces standalone output. Build completes without errors. `.next/standalone/` and `.next/static/` verified.
- AC#2: `ecosystem.config.js` created with PM2 config (name: glass, PORT: 3000, NODE_ENV: production). Auto-restart is PM2's default behavior.
- AC#3: `nginx/photos.bdailey.com.conf` created with reverse proxy config, proper headers, and certbot setup comments.
- AC#4: `deploy.sh` created — documents and automates the full deploy workflow (build → copy static assets → pm2 restart).
- AC#5: Standalone server tested locally — 3 photos render, images load (HTTP 200), page serves correctly in production mode.

### File List

- project-glass/deploy.sh (created)
- project-glass/ecosystem.config.js (created)
- project-glass/nginx/photos.bdailey.com.conf (created)
