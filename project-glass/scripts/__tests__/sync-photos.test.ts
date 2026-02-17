import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  extractDimensions,
  getImageFiles,
  loadPhotosJson,
  findNewImages,
  buildPhotoEntry,
  mergeExistingEntry,
  syncPhotos,
} from '../sync-photos';
import type { Photo, ExifData } from '../../src/types/photo';

// Use a real JPEG from the project for EXIF/dimension tests
const FIXTURES_DIR = path.resolve(__dirname, '..', '..', 'public', 'photos');
const SAMPLE_JPEG = path.join(FIXTURES_DIR, 'donald-duck.jpeg');

// Temp directory for integration tests
let tmpDir: string;
let tmpPhotosDir: string;
let tmpDataFile: string;

function setupTmpDirs() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-photos-test-'));
  tmpPhotosDir = path.join(tmpDir, 'photos');
  tmpDataFile = path.join(tmpDir, 'photos.json');
  fs.mkdirSync(tmpPhotosDir, { recursive: true });
}

function cleanupTmpDirs() {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }
}

describe('extractDimensions', () => {
  it('returns width and height for a valid JPEG buffer', () => {
    const buffer = fs.readFileSync(SAMPLE_JPEG);
    const result = extractDimensions(buffer);
    expect(result).not.toBeNull();
    expect(result!.width).toBeGreaterThan(0);
    expect(result!.height).toBeGreaterThan(0);
  });

  it('returns null for an invalid buffer', () => {
    const result = extractDimensions(Buffer.from('not an image'));
    expect(result).toBeNull();
  });
});

describe('getImageFiles', () => {
  it('returns image files from a directory', () => {
    const files = getImageFiles(FIXTURES_DIR);
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain('donald-duck.jpeg');
    expect(files).toContain('frozen-tokyo.jpeg');
  });

  it('returns sorted filenames', () => {
    const files = getImageFiles(FIXTURES_DIR);
    const sorted = [...files].sort();
    expect(files).toEqual(sorted);
  });

  it('returns empty array for non-existent directory', () => {
    const files = getImageFiles('/nonexistent/dir');
    expect(files).toEqual([]);
  });
});

describe('loadPhotosJson', () => {
  beforeEach(setupTmpDirs);
  afterEach(cleanupTmpDirs);

  it('returns empty array when file does not exist', () => {
    const photos = loadPhotosJson('/nonexistent/photos.json');
    expect(photos).toEqual([]);
  });

  it('parses existing JSON file', () => {
    const data = [{ id: 'test', src: '/photos/test.jpg', width: 100, height: 100, alt: '', tags: { location: [], genre: [] } }];
    fs.writeFileSync(tmpDataFile, JSON.stringify(data));
    const photos = loadPhotosJson(tmpDataFile);
    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBe('test');
  });
});

describe('findNewImages', () => {
  it('identifies images not yet in photos.json', () => {
    const imageFiles = ['a.jpg', 'b.jpg', 'c.jpg'];
    const existingPhotos = [
      { id: 'a', src: '/photos/a.jpg', width: 100, height: 100, alt: '', tags: { location: [], genre: [] } },
    ] as any[];

    const newImages = findNewImages(imageFiles, existingPhotos);
    expect(newImages).toEqual(['b.jpg', 'c.jpg']);
  });

  it('returns empty array when all images already exist', () => {
    const imageFiles = ['a.jpg'];
    const existingPhotos = [
      { id: 'a', src: '/photos/a.jpg', width: 100, height: 100, alt: '', tags: { location: [], genre: [] } },
    ] as any[];

    const newImages = findNewImages(imageFiles, existingPhotos);
    expect(newImages).toEqual([]);
  });

  it('returns all images when photos.json is empty', () => {
    const imageFiles = ['a.jpg', 'b.jpg'];
    const newImages = findNewImages(imageFiles, []);
    expect(newImages).toEqual(['a.jpg', 'b.jpg']);
  });
});

describe('buildPhotoEntry', () => {
  it('creates a photo entry with dimensions and EXIF from a real image', async () => {
    const entry = await buildPhotoEntry(SAMPLE_JPEG, 'donald-duck.jpeg');

    expect(entry).not.toBeNull();
    if (entry) {
      expect(entry.id).toBe('donald-duck');
      expect(entry.src).toBe('/photos/donald-duck.jpeg');
      expect(entry.width).toBeGreaterThan(0);
      expect(entry.height).toBeGreaterThan(0);
      expect(entry.alt).toBe('');
      expect(entry.title).toBe('');
      expect(entry.tags).toEqual({ location: [], genre: [] });
    }
  });

  it('includes EXIF data when available', async () => {
    const entry = await buildPhotoEntry(SAMPLE_JPEG, 'donald-duck.jpeg');

    expect(entry?.exif).toBeDefined();
    if (entry?.exif) {
      expect(entry.exif.camera).toBeDefined();
    }
  });

  it('sets id from filename without extension', async () => {
    const entry = await buildPhotoEntry(SAMPLE_JPEG, 'my-photo.jpeg');
    expect(entry?.id).toBe('my-photo');
  });
});

describe('syncPhotos (integration)', () => {
  beforeEach(setupTmpDirs);
  afterEach(cleanupTmpDirs);

  it('adds new images to an empty photos.json', async () => {
    // Copy a real image into tmp photos dir
    fs.copyFileSync(SAMPLE_JPEG, path.join(tmpPhotosDir, 'test-photo.jpeg'));

    const result = await syncPhotos(tmpPhotosDir, tmpDataFile);

    expect(result.added).toEqual(['test-photo.jpeg']);
    expect(result.total).toBe(1);

    // Verify JSON was written
    const data = JSON.parse(fs.readFileSync(tmpDataFile, 'utf-8'));
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('test-photo');
    expect(data[0].src).toBe('/photos/test-photo.jpeg');
    expect(data[0].width).toBeGreaterThan(0);
    expect(data[0].tags).toEqual({ location: [], genre: [] });
  });

  it('preserves existing entries and appends new ones', async () => {
    // Seed photos.json with an existing entry
    const existing = [{
      id: 'existing',
      src: '/photos/existing.jpeg',
      width: 100,
      height: 100,
      alt: 'Existing photo',
      title: 'Keep me',
      tags: { location: ['Tokyo'], genre: ['Street'] },
    }];
    fs.writeFileSync(tmpDataFile, JSON.stringify(existing));

    // Add a new image
    fs.copyFileSync(SAMPLE_JPEG, path.join(tmpPhotosDir, 'new-photo.jpeg'));

    const result = await syncPhotos(tmpPhotosDir, tmpDataFile);

    expect(result.added).toEqual(['new-photo.jpeg']);
    expect(result.total).toBe(2);

    const data = JSON.parse(fs.readFileSync(tmpDataFile, 'utf-8'));
    expect(data).toHaveLength(2);
    // Existing entry preserved
    expect(data[0].alt).toBe('Existing photo');
    expect(data[0].title).toBe('Keep me');
    expect(data[0].tags.location).toEqual(['Tokyo']);
    // New entry appended
    expect(data[1].id).toBe('new-photo');
  });

  it('creates data directory if it does not exist', async () => {
    const nestedDataFile = path.join(tmpDir, 'new-dir', 'photos.json');
    fs.copyFileSync(SAMPLE_JPEG, path.join(tmpPhotosDir, 'photo.jpeg'));
    
    await syncPhotos(tmpPhotosDir, nestedDataFile);
    
    expect(fs.existsSync(nestedDataFile)).toBe(true);
  });

  it('reports no new images when all are synced', async () => {
    // Copy image and sync once
    fs.copyFileSync(SAMPLE_JPEG, path.join(tmpPhotosDir, 'photo.jpeg'));
    await syncPhotos(tmpPhotosDir, tmpDataFile);

    // Sync again — should find nothing new or updated
    const result = await syncPhotos(tmpPhotosDir, tmpDataFile);
    expect(result.added).toEqual([]);
    expect(result.updated).toEqual([]);
    expect(result.total).toBe(1);
  });

  it('handles empty photos directory', async () => {
    const result = await syncPhotos(tmpPhotosDir, tmpDataFile);
    expect(result.added).toEqual([]);
    expect(result.updated).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('backfills missing tags scaffold on existing entries', async () => {
    // Entry without tags (pre-5.1 format)
    const existing = [{
      id: 'donald-duck',
      src: '/photos/donald-duck.jpeg',
      width: 5425,
      height: 3616,
      alt: 'Donald Duck event',
      title: 'Donald Duck',
      exif: { camera: 'Nikon Zf' },
    }];
    fs.writeFileSync(tmpDataFile, JSON.stringify(existing));
    fs.copyFileSync(SAMPLE_JPEG, path.join(tmpPhotosDir, 'donald-duck.jpeg'));

    const result = await syncPhotos(tmpPhotosDir, tmpDataFile);

    expect(result.updated).toContain('donald-duck.jpeg');
    const data = JSON.parse(fs.readFileSync(tmpDataFile, 'utf-8'));
    // Tags scaffold added
    expect(data[0].tags).toEqual({ location: [], genre: [] });
    // Curated fields preserved
    expect(data[0].alt).toBe('Donald Duck event');
    expect(data[0].title).toBe('Donald Duck');
  });

  it('backfills missing exif fields without overwriting existing ones', async () => {
    // Entry with partial exif
    const existing = [{
      id: 'donald-duck',
      src: '/photos/donald-duck.jpeg',
      width: 5425,
      height: 3616,
      alt: 'Custom alt',
      title: 'Custom title',
      tags: { location: ['Tokyo'], genre: ['Street'] },
      exif: { camera: 'My Custom Camera' },
    }];
    fs.writeFileSync(tmpDataFile, JSON.stringify(existing));
    fs.copyFileSync(SAMPLE_JPEG, path.join(tmpPhotosDir, 'donald-duck.jpeg'));

    const result = await syncPhotos(tmpPhotosDir, tmpDataFile);

    const data = JSON.parse(fs.readFileSync(tmpDataFile, 'utf-8'));
    // Custom camera name preserved (not overwritten by EXIF)
    expect(data[0].exif.camera).toBe('My Custom Camera');
    // Other EXIF fields should be backfilled from disk
    expect(data[0].exif.lens).toBeDefined();
    // Curated fields untouched
    expect(data[0].alt).toBe('Custom alt');
    expect(data[0].title).toBe('Custom title');
    expect(data[0].tags.location).toEqual(['Tokyo']);
  });

  it('is idempotent — second run produces no changes', async () => {
    fs.copyFileSync(SAMPLE_JPEG, path.join(tmpPhotosDir, 'photo.jpeg'));

    // First sync: adds the image
    await syncPhotos(tmpPhotosDir, tmpDataFile);
    const firstRun = fs.readFileSync(tmpDataFile, 'utf-8');

    // Second sync: should be a no-op
    const result = await syncPhotos(tmpPhotosDir, tmpDataFile);
    const secondRun = fs.readFileSync(tmpDataFile, 'utf-8');

    expect(result.added).toEqual([]);
    expect(result.updated).toEqual([]);
    expect(firstRun).toBe(secondRun);
  });
});

describe('mergeExistingEntry', () => {
  const baseEntry: Photo = {
    id: 'test',
    src: '/photos/test.jpg',
    width: 1000,
    height: 800,
    alt: 'My curated alt text',
    title: 'My title',
    tags: { location: ['Tokyo'], genre: ['Street'] },
    exif: { camera: 'Nikon Zf', aperture: 'f/4' },
  };

  it('preserves all curated fields', () => {
    const freshExif: ExifData = { camera: 'DIFFERENT CAMERA', lens: 'New Lens' };
    const freshDims = { width: 9999, height: 9999 };

    const { merged } = mergeExistingEntry(baseEntry, freshExif, freshDims);

    expect(merged.alt).toBe('My curated alt text');
    expect(merged.title).toBe('My title');
    expect(merged.tags).toEqual({ location: ['Tokyo'], genre: ['Street'] });
    // Existing exif.camera NOT overwritten
    expect(merged.exif!.camera).toBe('Nikon Zf');
    // Existing dimensions NOT overwritten
    expect(merged.width).toBe(1000);
    expect(merged.height).toBe(800);
  });

  it('backfills missing exif fields', () => {
    const entryWithPartialExif: Photo = {
      ...baseEntry,
      exif: { camera: 'Nikon Zf' },
    };
    const freshExif: ExifData = { camera: 'OTHER', lens: 'NIKKOR Z 24-70mm', iso: '100' };

    const { merged, changed } = mergeExistingEntry(entryWithPartialExif, freshExif, null);

    expect(changed).toBe(true);
    expect(merged.exif!.camera).toBe('Nikon Zf'); // preserved
    expect(merged.exif!.lens).toBe('NIKKOR Z 24-70mm'); // backfilled
    expect(merged.exif!.iso).toBe('100'); // backfilled
  });

  it('adds tags scaffold when missing', () => {
    const entryNoTags = { ...baseEntry, tags: undefined as any };
    const { merged, changed } = mergeExistingEntry(entryNoTags, {}, null);

    expect(changed).toBe(true);
    expect(merged.tags).toEqual({ location: [], genre: [] });
  });

  it('returns changed=false when entry is already complete', () => {
    const freshExif: ExifData = { camera: 'OTHER' };
    const { merged, changed } = mergeExistingEntry(baseEntry, freshExif, { width: 500, height: 500 });

    expect(changed).toBe(false);
    expect(merged).toEqual(baseEntry);
  });

  it('backfills dimensions when missing', () => {
    const entryNoDims: Photo = { ...baseEntry, width: 0, height: 0 };
    const { merged, changed } = mergeExistingEntry(entryNoDims, {}, { width: 2000, height: 1500 });

    expect(changed).toBe(true);
    expect(merged.width).toBe(2000);
    expect(merged.height).toBe(1500);
  });

  it('preserves priority field', () => {
    const entryWithPriority: Photo = { ...baseEntry, priority: true };
    const { merged } = mergeExistingEntry(entryWithPriority, {}, null);

    expect(merged.priority).toBe(true);
  });
});
