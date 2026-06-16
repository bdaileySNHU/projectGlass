import { Photo } from "@/types/photo";
import { formatExif } from "@/utils/format";

export type Orientation = "portrait" | "landscape" | "panorama";

/**
 * Derives a readable, title-cased name from a photo id slug.
 * "small-world-tokyo" -> "Small World Tokyo"
 */
export const titleFromId = (id: string): string =>
  id
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * The poster's main title, with a graceful fallback chain.
 * title -> alt -> readable name derived from the id.
 * Always returns a non-empty string. Displayed uppercased via CSS.
 */
export const posterTitle = (photo: Photo): string =>
  photo.title?.trim() || photo.alt?.trim() || titleFromId(photo.id);

/**
 * The poster's small location label (shown above the title).
 * Returns null when there are no location tags so the label can be hidden.
 */
export const posterLocation = (photo: Photo): string | null =>
  photo.tags?.location?.length ? photo.tags.location.join(", ") : null;

/**
 * The tiny metadata line (camera/lens/settings), or undefined when no EXIF.
 */
export const posterMeta = (photo: Photo): string | undefined =>
  formatExif(photo.exif);

/**
 * Classifies a photo's shape so the layout can bound it correctly.
 * Wide panoramas are constrained by width; tall portraits by height.
 */
export const orientation = (photo: Photo): Orientation => {
  if (!photo.width || !photo.height) return "landscape";
  const ratio = photo.width / photo.height;
  if (ratio > 2.2) return "panorama";
  if (ratio < 0.95) return "portrait";
  return "landscape";
};
