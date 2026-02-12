# projectGlass: Photography Portfolio

A premium, blazing-fast photo gallery showcasing travel and vacation photography.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** [react-photo-album](https://react-photo-album.com/), [yet-another-react-lightbox](https://yet-another-react-lightbox.com/)
- **Language:** TypeScript
- **Optimization:** Next.js Image component (WebP/AVIF)
- **Deployment:** Standalone Node.js / Vercel

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

Photos are managed via `src/data/photos.json` (to be implemented) and image files in the `public/` directory.

## Deployment

This project is configured for standalone output:

```bash
npm run build
```