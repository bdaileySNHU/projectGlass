import { describe, it, expect } from 'vitest';
import { validatePhotos } from './photoValidation';
import type { Photo } from '@/types/photo';

describe('validatePhotos', () => {
  const basePhoto: Photo = {
    id: 'test-photo',
    src: '/photos/test-photo.jpeg',
    width: 1000,
    height: 800,
    alt: 'Test photo description',
    tags: { location: ['Tokyo'], genre: ['Street'] },
  };

  describe('duplicate IDs', () => {
    it('reports duplicate IDs', () => {
      const photos = [
        { ...basePhoto, id: 'duplicate' },
        { ...basePhoto, id: 'duplicate', src: '/photos/other.jpeg' },
      ];
      const assetSources = new Set(['/photos/test-photo.jpeg', '/photos/other.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual({
        id: 'duplicate',
        field: 'id',
        message: expect.stringContaining('duplicate'),
      });
    });

    it('does not report errors for unique IDs', () => {
      const photos = [
        { ...basePhoto, id: 'photo-1' },
        { ...basePhoto, id: 'photo-2', src: '/photos/other.jpeg' },
      ];
      const assetSources = new Set(['/photos/test-photo.jpeg', '/photos/other.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues.filter(i => i.field === 'id')).toHaveLength(0);
    });
  });

  describe('empty or whitespace alt', () => {
    it('reports empty alt text', () => {
      const photos = [{ ...basePhoto, alt: '' }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'alt',
        message: expect.stringContaining('alt'),
      });
    });

    it('reports whitespace-only alt text', () => {
      const photos = [{ ...basePhoto, alt: '   ' }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'alt',
        message: expect.stringContaining('alt'),
      });
    });

    it('accepts non-empty alt text', () => {
      const photos = [{ ...basePhoto, alt: 'Valid alt text' }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues.filter(i => i.field === 'alt')).toHaveLength(0);
    });
  });

  describe('missing asset sources', () => {
    it('reports missing photo.src in assetSources', () => {
      const photos = [{ ...basePhoto, src: '/photos/missing.jpeg' }];
      const assetSources = new Set(['/photos/other.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'src',
        message: expect.stringContaining('not found'),
      });
    });

    it('accepts src that exists in assetSources', () => {
      const photos = [{ ...basePhoto, src: '/photos/test-photo.jpeg' }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues.filter(i => i.field === 'src')).toHaveLength(0);
    });
  });

  describe('malformed tags', () => {
    it('reports missing tags', () => {
      const photos = [{ ...basePhoto, tags: undefined as unknown as Photo['tags'] }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'tags',
        message: expect.stringContaining('tags'),
      });
    });

    it('reports missing location array', () => {
      const photos = [{ ...basePhoto, tags: { location: undefined, genre: ['Street'] } as unknown as Photo['tags'] }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'tags',
        message: expect.stringContaining('location'),
      });
    });

    it('reports missing genre array', () => {
      const photos = [{ ...basePhoto, tags: { location: ['Tokyo'], genre: undefined } as unknown as Photo['tags'] }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'tags',
        message: expect.stringContaining('genre'),
      });
    });

    it('reports non-array location', () => {
      const photos = [{ ...basePhoto, tags: { location: 'Tokyo', genre: ['Street'] } as unknown as Photo['tags'] }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'tags',
        message: expect.stringContaining('location'),
      });
    });

    it('reports non-array genre', () => {
      const photos = [{ ...basePhoto, tags: { location: ['Tokyo'], genre: 'Street' } as unknown as Photo['tags'] }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'tags',
        message: expect.stringContaining('genre'),
      });
    });

    it('reports non-string elements in location array', () => {
      const photos = [{ ...basePhoto, tags: { location: ['Tokyo', 123], genre: ['Street'] } as unknown as Photo['tags'] }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'tags',
        message: expect.stringContaining('location'),
      });
    });

    it('reports non-string elements in genre array', () => {
      const photos = [{ ...basePhoto, tags: { location: ['Tokyo'], genre: ['Street', true] } as unknown as Photo['tags'] }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'tags',
        message: expect.stringContaining('genre'),
      });
    });

    it('reports when both location and genre are empty', () => {
      const photos = [{ ...basePhoto, tags: { location: [], genre: [] } }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual({
        id: 'test-photo',
        field: 'tags',
        message: expect.stringContaining('empty'),
      });
    });

    it('accepts valid tags with location only', () => {
      const photos = [{ ...basePhoto, tags: { location: ['Tokyo'], genre: [] } }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues.filter(i => i.field === 'tags')).toHaveLength(0);
    });

    it('accepts valid tags with genre only', () => {
      const photos = [{ ...basePhoto, tags: { location: [], genre: ['Street'] } }];
      const assetSources = new Set(['/photos/test-photo.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues.filter(i => i.field === 'tags')).toHaveLength(0);
    });
  });

  describe('fully valid collection', () => {
    it('returns empty array for valid photos', () => {
      const photos = [
        { ...basePhoto, id: 'photo-1' },
        { ...basePhoto, id: 'photo-2', src: '/photos/photo-2.jpeg' },
        { ...basePhoto, id: 'photo-3', src: '/photos/photo-3.jpeg' },
      ];
      const assetSources = new Set([
        '/photos/test-photo.jpeg',
        '/photos/photo-2.jpeg',
        '/photos/photo-3.jpeg',
      ]);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toEqual([]);
    });

    it('returns empty array for empty collection', () => {
      const issues = validatePhotos([], new Set());

      expect(issues).toEqual([]);
    });
  });

  describe('multiple issues per photo', () => {
    it('reports multiple issues for a single photo', () => {
      const photos = [
        {
          ...basePhoto,
          alt: '',
          src: '/photos/missing.jpeg',
          tags: { location: [], genre: [] },
        },
      ];
      const assetSources = new Set(['/photos/other.jpeg']);

      const issues = validatePhotos(photos, assetSources);

      expect(issues).toContainEqual(expect.objectContaining({
        id: 'test-photo',
        field: 'alt',
      }));
      expect(issues).toContainEqual(expect.objectContaining({
        id: 'test-photo',
        field: 'src',
      }));
      expect(issues).toContainEqual(expect.objectContaining({
        id: 'test-photo',
        field: 'tags',
      }));
    });
  });
});
