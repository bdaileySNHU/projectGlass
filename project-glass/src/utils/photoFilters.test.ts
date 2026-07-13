import { describe, it, expect } from 'vitest';
import { filterPhotos, availableLocations, availableGenres } from './photoFilters';
import type { Photo } from '@/types/photo';

describe('photoFilters', () => {
  const basePhoto: Photo = {
    id: 'test-photo',
    src: '/photos/test-photo.jpeg',
    width: 1000,
    height: 800,
    alt: 'Test photo',
    tags: { location: ['Tokyo'], genre: ['Street'] },
  };

  const photos: Photo[] = [
    {
      ...basePhoto,
      id: 'photo-1',
      tags: { location: ['Tokyo'], genre: ['Street'] },
    },
    {
      ...basePhoto,
      id: 'photo-2',
      tags: { location: ['Tokyo'], genre: ['Architecture'] },
    },
    {
      ...basePhoto,
      id: 'photo-3',
      tags: { location: ['Paris'], genre: ['Street'] },
    },
    {
      ...basePhoto,
      id: 'photo-4',
      tags: { location: ['Paris'], genre: ['Architecture'] },
    },
    {
      ...basePhoto,
      id: 'photo-5',
      tags: { location: ['Tokyo', 'Japan'], genre: ['Portrait'] },
    },
  ];

  describe('filterPhotos', () => {
    it('returns all photos when both filters are null', () => {
      const result = filterPhotos(photos, null, null);
      expect(result).toEqual(photos);
    });

    it('filters by location only', () => {
      const result = filterPhotos(photos, 'Tokyo', null);
      expect(result).toHaveLength(3);
      expect(result.map((p) => p.id)).toEqual(['photo-1', 'photo-2', 'photo-5']);
    });

    it('filters by genre only', () => {
      const result = filterPhotos(photos, null, 'Street');
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual(['photo-1', 'photo-3']);
    });

    it('filters by both location and genre (intersection)', () => {
      const result = filterPhotos(photos, 'Tokyo', 'Street');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('photo-1');
    });

    it('handles multi-tag photos correctly', () => {
      const result = filterPhotos(photos, 'Japan', null);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('photo-5');
    });

    it('returns empty array when no photos match', () => {
      const result = filterPhotos(photos, 'London', 'Landscape');
      expect(result).toHaveLength(0);
    });

    it('preserves input order', () => {
      const result = filterPhotos(photos, 'Paris', null);
      expect(result.map((p) => p.id)).toEqual(['photo-3', 'photo-4']);
    });
  });

  describe('availableLocations', () => {
    it('returns all locations when genre is null', () => {
      const result = availableLocations(photos, null);
      expect(result).toEqual(['Japan', 'Paris', 'Tokyo']);
    });

    it('returns locations for photos with selected genre', () => {
      const result = availableLocations(photos, 'Street');
      expect(result).toEqual(['Paris', 'Tokyo']);
    });

    it('returns sorted and deduplicated locations', () => {
      const result = availableLocations(photos, null);
      expect(result).toEqual(result.sort());
    });

    it('handles multi-tag photos in location results', () => {
      const result = availableLocations(photos, 'Portrait');
      expect(result).toEqual(['Japan', 'Tokyo']);
    });

    it('returns empty array when no photos match the genre', () => {
      const result = availableLocations(photos, 'Landscape');
      expect(result).toEqual([]);
    });
  });

  describe('availableGenres', () => {
    it('returns all genres when location is null', () => {
      const result = availableGenres(photos, null);
      expect(result).toEqual(['Architecture', 'Portrait', 'Street']);
    });

    it('returns genres for photos with selected location', () => {
      const result = availableGenres(photos, 'Paris');
      expect(result).toEqual(['Architecture', 'Street']);
    });

    it('returns sorted and deduplicated genres', () => {
      const result = availableGenres(photos, null);
      expect(result).toEqual(result.sort());
    });

    it('handles multi-tag photos in genre results', () => {
      const result = availableGenres(photos, 'Japan');
      expect(result).toEqual(['Portrait']);
    });

    it('returns empty array when no photos match the location', () => {
      const result = availableGenres(photos, 'London');
      expect(result).toEqual([]);
    });
  });

  describe('cross-filter interactions', () => {
    it('availableGenres respects location selection', () => {
      const tokyoGenres = availableGenres(photos, 'Tokyo');
      expect(tokyoGenres).toEqual(['Architecture', 'Portrait', 'Street']);
    });

    it('availableLocations respects genre selection', () => {
      const streetLocations = availableLocations(photos, 'Street');
      expect(streetLocations).toEqual(['Paris', 'Tokyo']);
    });

    it('filtering by both reduces available options', () => {
      const genresAfterLocation = availableGenres(photos, 'Tokyo');
      const genresAfterBoth = availableGenres(
        filterPhotos(photos, 'Tokyo', null),
        null,
      );
      expect(genresAfterBoth).toEqual(genresAfterLocation);
    });
  });

  describe('edge cases', () => {
    it('handles empty photo array', () => {
      expect(filterPhotos([], null, null)).toEqual([]);
      expect(availableLocations([], null)).toEqual([]);
      expect(availableGenres([], null)).toEqual([]);
    });

    it('handles photos with empty tag arrays', () => {
      const photoWithEmptyTags: Photo = {
        ...basePhoto,
        id: 'empty-tags',
        tags: { location: [], genre: [] },
      };
      const testPhotos = [...photos, photoWithEmptyTags];

      expect(filterPhotos(testPhotos, 'Tokyo', null)).toHaveLength(3);
      expect(availableLocations(testPhotos, null)).toContain('Tokyo');
    });
  });
});
