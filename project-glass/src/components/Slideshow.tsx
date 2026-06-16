"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Photo } from "@/types/photo";
import {
  posterTitle,
  posterLocation,
  posterMeta,
} from "@/utils/poster";

interface SlideshowProps {
  photos: Photo[];
}

const AUTOPLAY_MS = 5000;
const FADE_MS = 700;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Tracks the prefers-reduced-motion media query without SSR hydration issues. */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(REDUCED_MOTION_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export default function Slideshow({ photos }: SlideshowProps) {
  const router = useRouter();
  const count = photos.length;
  const multiple = count > 1;

  // current/previous index pair drives the crossfade
  const [slide, setSlide] = useState({ current: 0, previous: -1 });
  const [isPlaying, setIsPlaying] = useState(true);
  const reducedMotion = useReducedMotion();

  const { current, previous } = slide;
  // Autoplay/crossfade only run when motion is allowed and there's more than one photo.
  const canAnimate = multiple && !reducedMotion;

  const next = useCallback(() => {
    if (!multiple) return;
    setSlide((s) => ({ current: (s.current + 1) % count, previous: s.current }));
  }, [count, multiple]);

  const prev = useCallback(() => {
    if (!multiple) return;
    setSlide((s) => ({
      current: (s.current - 1 + count) % count,
      previous: s.current,
    }));
  }, [count, multiple]);

  const togglePlay = useCallback(() => {
    if (!canAnimate) return;
    setIsPlaying((p) => !p);
  }, [canAnimate]);

  // Autoplay timer — resets on each advance so manual nav gives a fresh interval.
  useEffect(() => {
    if (!isPlaying || !canAnimate) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPlaying, canAnimate, next, current]);

  // Clear the outgoing layer once the crossfade has finished.
  useEffect(() => {
    if (previous < 0) return;
    const id = setTimeout(
      () => setSlide((s) => ({ ...s, previous: -1 })),
      reducedMotion ? 0 : FADE_MS,
    );
    return () => clearTimeout(id);
  }, [previous, current, reducedMotion]);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, togglePlay, router]);

  if (count === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-dark p-6 text-center">
        <p className="text-text-secondary">No photos yet.</p>
        <Link
          href="/"
          className="text-sm tracking-wide text-text-tertiary transition-colors hover:text-accent"
        >
          ← Back to gallery
        </Link>
      </main>
    );
  }

  const photo = photos[current];
  const ratio = photo.width && photo.height ? photo.width / photo.height : 3 / 2;
  const location = posterLocation(photo);
  const title = posterTitle(photo);
  const meta = posterMeta(photo);
  const nextIndex = (current + 1) % count;
  const playing = isPlaying && canAnimate;

  // Fit the print within the viewport: width ≤ 88vw and derived height ≤ 70vh.
  const windowWidth = `min(88vw, calc(70vh * ${ratio}))`;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-dark p-6">
      <Link
        href="/"
        aria-label="Back to gallery"
        className="absolute left-5 top-5 z-20 text-sm tracking-wide text-text-tertiary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        ← Gallery
      </Link>

      {/* The print: off-white mat hugging the photo, framed by the screen edge. */}
      <figure
        role="group"
        aria-roledescription="slide"
        aria-label={location ? `${title}, ${location}` : title}
        className="m-0 flex flex-col bg-[#f5f2e9] px-4 pb-8 pt-4 shadow-2xl sm:px-6 sm:pb-10 sm:pt-6"
        style={{ width: windowWidth }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
          {previous >= 0 && previous !== current && (
            <Image
              key={`prev-${previous}`}
              fill
              src={photos[previous].src}
              alt=""
              aria-hidden
              sizes="88vw"
              className="object-contain"
            />
          )}
          <Image
            key={`cur-${current}`}
            fill
            priority
            src={photo.src}
            alt={posterTitle(photo)}
            sizes="88vw"
            className="poster-fade-in object-contain"
          />
          {/* Hidden layer that warms the cache for the next slide. */}
          {multiple && (
            <Image
              key={`pre-${nextIndex}`}
              fill
              src={photos[nextIndex].src}
              alt=""
              aria-hidden
              sizes="88vw"
              className="pointer-events-none object-contain opacity-0"
            />
          )}
        </div>

        <figcaption className="relative pt-5 text-center">
          {location && (
            <p className="mb-1 text-[0.65rem] uppercase tracking-[0.3em] text-neutral-500">
              {location}
            </p>
          )}
          <h2 className="text-xl font-light uppercase tracking-[0.15em] text-neutral-900 md:text-2xl">
            {title}
          </h2>
          {meta && (
            <p className="mt-3 text-[0.55rem] uppercase tracking-widest text-neutral-400">
              {meta}
            </p>
          )}
        </figcaption>
      </figure>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-6 text-text-tertiary">
        <button
          type="button"
          onClick={prev}
          disabled={!multiple}
          aria-label="Previous photo"
          className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-30 disabled:hover:text-text-tertiary"
        >
          ‹ Prev
        </button>

        <button
          type="button"
          onClick={togglePlay}
          disabled={!canAnimate}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          className="min-w-[3.5rem] transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-30 disabled:hover:text-text-tertiary"
        >
          {playing ? "❚❚ Pause" : "▶ Play"}
        </button>

        <button
          type="button"
          onClick={next}
          disabled={!multiple}
          aria-label="Next photo"
          className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-30 disabled:hover:text-text-tertiary"
        >
          Next ›
        </button>
      </div>

      <p className="mt-3 text-xs tracking-widest text-text-tertiary">
        {current + 1} / {count}
      </p>

      {/* Screen-reader announcement of the current slide. */}
      <p aria-live="polite" className="sr-only">
        {`Photo ${current + 1} of ${count}: ${title}`}
      </p>
    </main>
  );
}
