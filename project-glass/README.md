# projectGlass: Photography Portfolio

A premium, blazing-fast photo gallery showcasing travel and vacation photography.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** [react-photo-album](https://react-photo-album.com/), [yet-another-react-lightbox](https://yet-another-react-lightbox.com/)
- **Language:** TypeScript
- **Optimization:** Next.js Image component (WebP/AVIF)
- **Deployment:** Standalone Node.js on a VPS (PM2 + nginx)

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Content Management

Photos are managed via `data/photos.json` and image files in `public/photos/`.

To add photos:

1. Drop the image file(s) into `public/photos/`.
2. Run `npm run sync-photos` — extracts EXIF and dimensions, merges new entries into `data/photos.json` without touching curated fields.
3. Fill in `alt`, `title`, and `tags` (`location` / `genre`, title case) for the new entries. Optional `description` supports Markdown (paragraphs, bold, italic, links) and renders in the lightbox.
4. Run `npm run validate-photos` — fails on duplicate ids, empty alt text, missing assets, or empty tags.

## Deployment

Deployment is **manual** — there is no CI/CD pipeline. The site runs as a standalone Next.js build under PM2 (app name `glass`) behind nginx on the VPS, cloned at `/var/www/projectGlass`.

```bash
# on the VPS
cd /var/www/projectGlass && git pull
cd project-glass
npm install        # when dependencies changed
./deploy.sh        # builds, copies static assets, restarts PM2
```

Post-deploy smoke check:

1. Open https://photos.bdailey.com and confirm the photo count.
2. Open a newly added photo in the lightbox; check title/EXIF/description.
3. Check the browser console for errors.

Analytics (Umami) is optional and off by default; set `NEXT_PUBLIC_UMAMI_SRC` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` in `.env.local` on the server **before** building to enable it (see `.env.example`).