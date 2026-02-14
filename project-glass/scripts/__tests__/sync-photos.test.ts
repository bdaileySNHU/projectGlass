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
  syncPhotos,
} from '../sync-photos';

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

    // Sync again — should find nothing new
    const result = await syncPhotos(tmpPhotosDir, tmpDataFile);
    expect(result.added).toEqual([]);
    expect(result.total).toBe(1);
  });

  it('handles empty photos directory', async () => {
    const result = await syncPhotos(tmpPhotosDir, tmpDataFile);
    expect(result.added).toEqual([]);
    expect(result.total).toBe(0);
  });
});
