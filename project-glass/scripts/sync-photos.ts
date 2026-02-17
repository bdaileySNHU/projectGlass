import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import exifr from 'exifr';
import { imageSize } from 'image-size';
import { Photo, ExifData } from '../src/types/photo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PHOTOS_DIR = path.join(PROJECT_ROOT, 'public', 'photos');
const DATA_FILE = path.join(PROJECT_ROOT, 'data', 'photos.json');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

function formatShutterSpeed(exposureTime: number | undefined): string | undefined {
  if (!exposureTime) return undefined;
  if (exposureTime >= 1) return `${exposureTime}s`;
  return `1/${Math.round(1 / exposureTime)}s`;
}

function formatAperture(fNumber: number | undefined): string | undefined {
  if (!fNumber) return undefined;
  return `f/${fNumber}`;
}

function formatFocalLength(fl: number | undefined): string | undefined {
  if (!fl) return undefined;
  return `${Math.round(fl)}mm`;
}

function formatISO(iso: number | undefined): string | undefined {
  if (!iso) return undefined;
  return String(iso);
}

export async function extractExif(buffer: Buffer): Promise<ExifData> {
  try {
    const data = await exifr.parse(buffer, {
      pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO'],
    });

    if (!data) return {};

    const camera = [data.Make, data.Model]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim() || undefined;

    return {
      camera,
      lens: data.LensModel || undefined,
      focalLength: formatFocalLength(data.FocalLength),
      aperture: formatAperture(data.FNumber),
      shutterSpeed: formatShutterSpeed(data.ExposureTime),
      iso: formatISO(data.ISO),
    };
  } catch {
    return {};
  }
}

export function extractDimensions(buffer: Buffer): { width: number; height: number } | null {
  try {
    const result = imageSize(buffer);
    if (result.width && result.height) {
      return { width: result.width, height: result.height };
    }
    return null;
  } catch {
    return null;
  }
}

export function getImageFiles(photosDir: string): string[] {
  if (!fs.existsSync(photosDir)) return [];
  return fs.readdirSync(photosDir)
    .filter(file => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .sort();
}

export function loadPhotosJson(dataFile: string): Photo[] {
  if (!fs.existsSync(dataFile)) return [];
  const content = fs.readFileSync(dataFile, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error parsing ${dataFile}:`, err);
    return [];
  }
}

export function findNewImages(imageFiles: string[], existingPhotos: Photo[]): string[] {
  const existingSrcs = new Set(existingPhotos.map(p => p.src));
  return imageFiles.filter(file => {
    const src = `/photos/${file}`;
    return !existingSrcs.has(src);
  });
}

export async function buildPhotoEntry(filePath: string, filename: string): Promise<Photo | null> {
  const id = path.parse(filename).name;
  const src = `/photos/${filename}`;

  try {
    const buffer = fs.readFileSync(filePath);
    const dimensions = extractDimensions(buffer);
    const exif = await extractExif(buffer);

    if (!dimensions) {
      console.warn(`⚠️ Could not extract dimensions for ${filename}. Skipping.`);
      return null;
    }

    const hasExifData = Object.values(exif).some(v => v !== undefined);

    return {
      id,
      src,
      width: dimensions.width,
      height: dimensions.height,
      alt: '',
      title: '',
      tags: { location: [], genre: [] },
      ...(hasExifData ? { exif } : {}),
    };
  } catch (err) {
    console.error(`❌ Failed to process ${filename}:`, err);
    return null;
  }
}

/** Curated fields that must never be overwritten by automation */
const CURATED_FIELDS = ['alt', 'title', 'tags', 'priority'] as const;

/**
 * Merge fresh disk data into an existing photo entry.
 * - Curated fields (alt, title, tags, priority) are NEVER overwritten.
 * - Technical fields (width, height, exif.*) are backfilled only if missing/empty.
 * - Adds tags scaffold if missing entirely.
 * Returns the merged entry and whether any changes were made.
 */
export function mergeExistingEntry(
  existing: Photo,
  freshExif: ExifData,
  freshDimensions: { width: number; height: number } | null
): { merged: Photo; changed: boolean } {
  let changed = false;
  const merged = { ...existing };

  // Ensure tags scaffold exists
  if (!merged.tags) {
    merged.tags = { location: [], genre: [] };
    changed = true;
  }

  // Backfill dimensions if missing
  if (freshDimensions) {
    if (!merged.width) {
      merged.width = freshDimensions.width;
      changed = true;
    }
    if (!merged.height) {
      merged.height = freshDimensions.height;
      changed = true;
    }
  }

  // Backfill EXIF fields if missing
  const hasAnyFreshExif = Object.values(freshExif).some(v => v !== undefined);
  if (hasAnyFreshExif) {
    const existingExif = merged.exif || {};
    const mergedExif = { ...existingExif };
    let exifChanged = false;

    for (const key of Object.keys(freshExif) as (keyof ExifData)[]) {
      if (!mergedExif[key] && freshExif[key]) {
        mergedExif[key] = freshExif[key];
        exifChanged = true;
      }
    }

    if (exifChanged) {
      merged.exif = mergedExif;
      changed = true;
    }
  }

  return { merged, changed };
}

export async function syncPhotos(
  photosDir: string = PHOTOS_DIR,
  dataFile: string = DATA_FILE
): Promise<{ added: string[]; updated: string[]; total: number }> {
  const imageFiles = getImageFiles(photosDir);
  const existingPhotos = loadPhotosJson(dataFile);

  // Phase 1: Merge existing entries (backfill technical data, add tags scaffold)
  const updatedNames: string[] = [];
  const mergedPhotos: Photo[] = [];

  for (const photo of existingPhotos) {
    const filename = path.basename(photo.src);
    const filePath = path.join(photosDir, filename);

    if (fs.existsSync(filePath)) {
      try {
        const buffer = fs.readFileSync(filePath);
        const freshDimensions = extractDimensions(buffer);
        const freshExif = await extractExif(buffer);
        const { merged, changed } = mergeExistingEntry(photo, freshExif, freshDimensions);
        mergedPhotos.push(merged);
        if (changed) {
          updatedNames.push(filename);
          console.log(`  ~ ${photo.src} (updated)`);
        }
      } catch {
        // If we can't read the file, keep the existing entry as-is
        mergedPhotos.push(photo);
      }
    } else {
      // Image file no longer on disk — keep the entry anyway
      mergedPhotos.push(photo);
    }
  }

  // Phase 2: Add new images
  const newImages = findNewImages(imageFiles, existingPhotos);
  const newEntries: Photo[] = [];

  for (const filename of newImages) {
    const filePath = path.join(photosDir, filename);
    console.log(`Processing: ${filename}`);
    const entry = await buildPhotoEntry(filePath, filename);
    if (entry) {
      newEntries.push(entry);
    }
  }

  const allPhotos = [...mergedPhotos, ...newEntries];

  // Only write if there were actual changes
  if (newEntries.length === 0 && updatedNames.length === 0) {
    console.log('No changes needed.');
    return { added: [], updated: [], total: existingPhotos.length };
  }

  // Ensure directory exists
  const dataDir = path.dirname(dataFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(dataFile, JSON.stringify(allPhotos, null, 2) + '\n');

  // Report
  if (newEntries.length > 0) {
    console.log(`\nAdded ${newEntries.length} new photo(s):`);
    for (const entry of newEntries) {
      console.log(`  + ${entry.src} (${entry.width}x${entry.height})`);
    }
  }
  if (updatedNames.length > 0) {
    console.log(`\nUpdated ${updatedNames.length} existing photo(s).`);
  }
  console.log(`Total: ${allPhotos.length}`);

  return {
    added: newEntries.map(e => path.basename(e.src)),
    updated: updatedNames,
    total: allPhotos.length,
  };
}

// CLI entry point
const isMain = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(__filename));
if (isMain) {
  syncPhotos().catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
  });
}
