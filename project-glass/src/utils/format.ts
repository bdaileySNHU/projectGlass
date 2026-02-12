import { ExifData } from "@/types/photo";

export const formatExif = (exif?: ExifData) => {
  if (!exif) return undefined;
  
  const parts = [
    exif.camera,
    exif.lens,
    exif.aperture,
    exif.shutterSpeed,
    exif.iso ? `ISO ${exif.iso}` : undefined
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(" · ") : undefined;
};
