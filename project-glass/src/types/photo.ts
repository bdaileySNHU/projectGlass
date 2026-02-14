export interface ExifData {
  camera?: string;      // "Sony A7IV"
  lens?: string;        // "24-70mm f/2.8 GM"
  focalLength?: string; // "35mm"
  aperture?: string;    // "f/8"
  shutterSpeed?: string;// "1/250s"
  iso?: string;         // "100"
}

export interface PhotoTags {
  location: string[];   // ["Japan", "Tokyo"] — title case, displayed as-is
  genre: string[];      // ["Street", "Architecture"] — title case, displayed as-is
}

export interface Photo {
  id: string;           // Unique identifier for React keys and routing
  src: string;          // "/photos/amalfi-coast.jpg"
  width: number;        // 4000 (original px — needed for aspect ratio)
  height: number;       // 2667
  alt: string;          // "Amalfi coastline at golden hour"
  title?: string;       // "Amalfi Coast" (shown in lightbox, optional)
  exif?: ExifData;      // Optional EXIF block
  tags: PhotoTags;      // Required (Phase 2)
  priority?: boolean;   // If true, Next.js Image will prioritize loading (LCP)
}
