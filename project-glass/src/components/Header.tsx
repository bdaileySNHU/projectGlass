import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-center gap-4 py-6 text-center">
      <h1 className="text-lg font-light tracking-wider text-text-primary">
        photos.bdailey.com
      </h1>
      <Link
        href="/slideshow"
        className="text-xs uppercase tracking-[0.2em] text-text-tertiary transition-colors hover:text-accent"
      >
        Slideshow
      </Link>
    </header>
  );
}
