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

// Wallpaper pacing: bare number or "12m" = minutes, "30s" = seconds.
const DEFAULT_DWELL_MS = 12 * 60_000;
const FADE_MS = 700;
const CHROME_HIDE_MS = 5000;

function dwellFromUrl(): number {
  if (typeof window === "undefined") return DEFAULT_DWELL_MS;
  const raw = new URLSearchParams(window.location.search).get("dwell");
  const m = raw?.match(/^(\d+)(s|m)?$/);
  if (!m) return DEFAULT_DWELL_MS;
  return Number(m[1]) * (m[2] === "s" ? 1000 : 60_000);
}

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

/** True while the user is interacting; false after a few idle seconds. */
function useChromeVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer = setTimeout(() => setVisible(false), CHROME_HIDE_MS);
    const wake = () => {
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), CHROME_HIDE_MS);
    };
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", wake);
    window.addEventListener("touchstart", wake);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, []);

  return visible;
}

export default function Slideshow({ photos }: SlideshowProps) {
  const router = useRouter();
  const count = photos.length;
  const multiple = count > 1;

  // current/previous index pair drives the crossfade
  const [slide, setSlide] = useState({ current: 0, previous: -1 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [dwellMs] = useState(dwellFromUrl);
  const reducedMotion = useReducedMotion();
  const chromeVisible = useChromeVisible();

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
    const id = setInterval(next, dwellMs);
    return () => clearInterval(id);
  }, [isPlaying, canAnimate, next, current, dwellMs]);

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
  const location = posterLocation(photo);
  const title = posterTitle(photo);
  const meta = posterMeta(photo);
  const nextIndex = (current + 1) % count;
  const playing = isPlaying && canAnimate;
  const chromeClass = chromeVisible
    ? "opacity-100"
    : "pointer-events-none opacity-0";

  return (
    <main className="fixed inset-0 cursor-default overflow-hidden">
      {/* The print: off-white mat filling the screen edge to edge, TV-wallpaper style. */}
      <figure
        role="group"
        aria-roledescription="slide"
        aria-label={location ? `${title}, ${location}` : title}
        className="m-0 flex h-full w-full flex-col bg-[#f5f2e9] px-6 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-10"
      >
        <div className="relative min-h-0 w-full flex-1">
          {previous >= 0 && previous !== current && (
            <Image
              key={`prev-${previous}`}
              fill
              src={photos[previous].src}
              alt=""
              aria-hidden
              sizes="100vw"
              className="object-contain"
            />
          )}
          <Image
            key={`cur-${current}`}
            fill
            priority
            src={photo.src}
            alt={posterTitle(photo)}
            sizes="100vw"
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
              sizes="100vw"
              className="pointer-events-none object-contain opacity-0"
            />
          )}
        </div>

        <figcaption className="relative pt-6 text-center">
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

      {/* Chrome overlay — fades out after a few idle seconds for TV display. */}
      <Link
        href="/"
        aria-label="Back to gallery"
        className={`absolute left-5 top-5 z-20 text-sm tracking-wide text-neutral-500 transition-opacity duration-500 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${chromeClass}`}
      >
        ← Gallery
      </Link>

      <div
        className={`absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-6 rounded-full bg-black/60 px-5 py-2 text-sm text-white/80 transition-opacity duration-500 ${chromeClass}`}
      >
        <button
          type="button"
          onClick={prev}
          disabled={!multiple}
          aria-label="Previous photo"
          className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-30"
        >
          ‹ Prev
        </button>

        <button
          type="button"
          onClick={togglePlay}
          disabled={!canAnimate}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          className="min-w-[3.5rem] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-30"
        >
          {playing ? "❚❚ Pause" : "▶ Play"}
        </button>

        <button
          type="button"
          onClick={next}
          disabled={!multiple}
          aria-label="Next photo"
          className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-30"
        >
          Next ›
        </button>

        <span className="text-xs tracking-widest text-white/60">
          {current + 1} / {count}
        </span>
      </div>

      {/* Screen-reader announcement of the current slide. */}
      <p aria-live="polite" className="sr-only">
        {`Photo ${current + 1} of ${count}: ${title}`}
      </p>
    </main>
  );
}
