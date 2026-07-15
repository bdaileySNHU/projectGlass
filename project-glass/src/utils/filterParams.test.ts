import { describe, it, expect } from 'vitest';
import {
  parseFilterParams,
  filterSearch,
  type FilterSelection,
} from './filterParams';

describe('filterParams', () => {
  const locations = ['Japan', 'Paris', 'New Hampshire', 'Tokyo'];
  const genres = ['Architecture', 'Portrait', 'Street'];

  describe('parseFilterParams', () => {
    describe('basic parsing', () => {
      it('parses both location and genre', () => {
        const result = parseFilterParams(
          '?location=Japan&genre=Street',
          locations,
          genres,
        );
        expect(result).toEqual({ location: 'Japan', genre: 'Street' });
      });

      it('parses location only', () => {
        const result = parseFilterParams('?location=Japan', locations, genres);
        expect(result).toEqual({ location: 'Japan', genre: null });
      });

      it('parses genre only', () => {
        const result = parseFilterParams('?genre=Street', locations, genres);
        expect(result).toEqual({ location: null, genre: 'Street' });
      });

      it('parses empty search string', () => {
        const result = parseFilterParams('', locations, genres);
        expect(result).toEqual({ location: null, genre: null });
      });

      it('parses search string without leading ?', () => {
        const result = parseFilterParams(
          'location=Japan&genre=Street',
          locations,
          genres,
        );
        expect(result).toEqual({ location: 'Japan', genre: 'Street' });
      });
    });

    describe('case-insensitive matching', () => {
      it('restores canonical case for location (lowercase input)', () => {
        const result = parseFilterParams('?location=japan', locations, genres);
        expect(result.location).toBe('Japan');
      });

      it('restores canonical case for genre (lowercase input)', () => {
        const result = parseFilterParams('?genre=street', locations, genres);
        expect(result.genre).toBe('Street');
      });

      it('restores canonical case for mixed input', () => {
        const result = parseFilterParams(
          '?location=TOKYO&genre=architecture',
          locations,
          genres,
        );
        expect(result).toEqual({ location: 'Tokyo', genre: 'Architecture' });
      });

      it('handles title case mismatch', () => {
        const result = parseFilterParams(
          '?location=pARIs&genre=pORTrait',
          locations,
          genres,
        );
        expect(result).toEqual({ location: 'Paris', genre: 'Portrait' });
      });
    });

    describe('URL encoding', () => {
      it('decodes %20 encoded spaces', () => {
        const result = parseFilterParams(
          '?location=New%20Hampshire',
          locations,
          genres,
        );
        expect(result.location).toBe('New Hampshire');
      });

      it('decodes + encoded spaces', () => {
        const result = parseFilterParams(
          '?location=New+Hampshire',
          locations,
          genres,
        );
        expect(result.location).toBe('New Hampshire');
      });

      it('handles multiple encoded characters', () => {
        const taxon = ['Île de France'];
        const result = parseFilterParams(
          '?location=%C3%8Ele%20de%20France',
          taxon,
          genres,
        );
        expect(result.location).toBe('Île de France');
      });
    });

    describe('unknown values', () => {
      it('returns null for unknown location', () => {
        const result = parseFilterParams(
          '?location=Unknown',
          locations,
          genres,
        );
        expect(result.location).toBeNull();
      });

      it('returns null for unknown genre', () => {
        const result = parseFilterParams('?genre=Unknown', locations, genres);
        expect(result.genre).toBeNull();
      });

      it('returns null for both unknown', () => {
        const result = parseFilterParams(
          '?location=Unknown&genre=Unknown',
          locations,
          genres,
        );
        expect(result).toEqual({ location: null, genre: null });
      });

      it('handles one valid, one unknown', () => {
        const result = parseFilterParams(
          '?location=Japan&genre=Unknown',
          locations,
          genres,
        );
        expect(result).toEqual({ location: 'Japan', genre: null });
      });
    });

    describe('malformed input', () => {
      it('tolerates empty param values', () => {
        const result = parseFilterParams('?location=', locations, genres);
        expect(result.location).toBeNull();
      });

      it('tolerates XSS-like input', () => {
        const result = parseFilterParams(
          '?location=<script>alert("xss")</script>',
          locations,
          genres,
        );
        expect(result.location).toBeNull();
      });

      it('handles duplicate params (first wins)', () => {
        const result = parseFilterParams(
          '?location=Japan&location=Tokyo',
          locations,
          genres,
        );
        expect(result.location).toBe('Japan');
      });

      it('ignores unrelated params', () => {
        const result = parseFilterParams(
          '?location=Japan&foo=bar&genre=Street',
          locations,
          genres,
        );
        expect(result).toEqual({ location: 'Japan', genre: 'Street' });
      });

      it('handles whitespace-only values', () => {
        const result = parseFilterParams('?location=   ', locations, genres);
        expect(result.location).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('handles empty taxonomies', () => {
        const result = parseFilterParams('?location=Japan', [], genres);
        expect(result.location).toBeNull();
      });

      it('returns null for all params with empty taxonomies', () => {
        const result = parseFilterParams(
          '?location=Japan&genre=Street',
          [],
          [],
        );
        expect(result).toEqual({ location: null, genre: null });
      });

      it('preserves return type as FilterSelection', () => {
        const result: FilterSelection = parseFilterParams(
          '',
          locations,
          genres,
        );
        expect(result).toEqual({ location: null, genre: null });
      });
    });
  });

  describe('filterSearch', () => {
    describe('basic serialization', () => {
      it('serializes both location and genre', () => {
        const result = filterSearch('Japan', 'Street');
        expect(result).toBe('?location=Japan&genre=Street');
      });

      it('serializes location only', () => {
        const result = filterSearch('Japan', null);
        expect(result).toBe('?location=Japan');
      });

      it('serializes genre only', () => {
        const result = filterSearch(null, 'Street');
        expect(result).toBe('?genre=Street');
      });

      it('returns empty string when both are null', () => {
        const result = filterSearch(null, null);
        expect(result).toBe('');
      });
    });

    describe('encoding', () => {
      it('encodes spaces (URLSearchParams uses +)', () => {
        const result = filterSearch('New Hampshire', null);
        expect(result).toBe('?location=New+Hampshire');
      });

      it('encodes special characters', () => {
        const result = filterSearch('Île de France', null);
        expect(result).toContain('location=');
        // Verify it's decodable
        const params = new URLSearchParams(result.slice(1));
        expect(params.get('location')).toBe('Île de France');
      });

      it('handles both params with spaces', () => {
        const result = filterSearch('New Hampshire', 'Street');
        expect(result).toContain('New+Hampshire');
        expect(result).toContain('genre=Street');
      });
    });

    describe('edge cases', () => {
      it('handles null location explicitly', () => {
        const result = filterSearch(null, 'Street');
        expect(result).not.toContain('location');
        expect(result).toContain('genre=Street');
      });

      it('handles null genre explicitly', () => {
        const result = filterSearch('Japan', null);
        expect(result).toContain('location=Japan');
        expect(result).not.toContain('genre');
      });

      it('omits undefined from param string', () => {
        const result = filterSearch(null, null);
        expect(result).toBe('');
      });

      it('preserves empty string as null', () => {
        // Empty string should be treated as a value, but in practice
        // we expect callers to pass null, not empty strings
        const result = filterSearch('', null);
        expect(result).toBe('?location=');
      });
    });
  });

  describe('round-trip conversion', () => {
    it('round-trips simple selection', () => {
      const original: FilterSelection = { location: 'Japan', genre: 'Street' };
      const search = filterSearch(original.location, original.genre);
      const parsed = parseFilterParams(search, locations, genres);
      expect(parsed).toEqual(original);
    });

    it('round-trips location only', () => {
      const original: FilterSelection = { location: 'Japan', genre: null };
      const search = filterSearch(original.location, original.genre);
      const parsed = parseFilterParams(search, locations, genres);
      expect(parsed).toEqual(original);
    });

    it('round-trips genre only', () => {
      const original: FilterSelection = { location: null, genre: 'Street' };
      const search = filterSearch(original.location, original.genre);
      const parsed = parseFilterParams(search, locations, genres);
      expect(parsed).toEqual(original);
    });

    it('round-trips null selection', () => {
      const original: FilterSelection = { location: null, genre: null };
      const search = filterSearch(original.location, original.genre);
      const parsed = parseFilterParams(search, locations, genres);
      expect(parsed).toEqual(original);
    });

    it('round-trips with spaces', () => {
      const original: FilterSelection = {
        location: 'New Hampshire',
        genre: 'Street',
      };
      const search = filterSearch(original.location, original.genre);
      const parsed = parseFilterParams(search, locations, genres);
      expect(parsed).toEqual(original);
    });

    it('round-trips case-insensitive input', () => {
      const search = '?location=japan&genre=street';
      const parsed = parseFilterParams(search, locations, genres);
      const reserialized = filterSearch(parsed.location, parsed.genre);
      const reparsed = parseFilterParams(reserialized, locations, genres);
      expect(reparsed).toEqual(parsed);
      expect(parsed).toEqual({ location: 'Japan', genre: 'Street' });
    });
  });

  describe('integration scenarios', () => {
    it('handles user clicking filter button', () => {
      const search = '';
      const parsed = parseFilterParams(search, locations, genres);
      expect(parsed).toEqual({ location: null, genre: null });

      const updated = filterSearch('Tokyo', null);
      expect(updated).toBe('?location=Tokyo');

      const reparsed = parseFilterParams(updated, locations, genres);
      expect(reparsed).toEqual({ location: 'Tokyo', genre: null });
    });

    it('handles user clearing a filter', () => {
      const search = '?location=Japan&genre=Street';
      const parsed = parseFilterParams(search, locations, genres);

      const cleared = filterSearch(null, parsed.genre);
      expect(cleared).toBe('?genre=Street');

      const reparsed = parseFilterParams(cleared, locations, genres);
      expect(reparsed).toEqual({ location: null, genre: 'Street' });
    });

    it('handles user clearing all filters', () => {
      const cleared = filterSearch(null, null);
      expect(cleared).toBe('');

      const reparsed = parseFilterParams(cleared, locations, genres);
      expect(reparsed).toEqual({ location: null, genre: null });
    });

    it('handles URL with unknown filter values gracefully', () => {
      const malformedSearch = '?location=UnknownPlace&genre=UnknownStyle';
      const parsed = parseFilterParams(
        malformedSearch,
        locations,
        genres,
      );
      expect(parsed).toEqual({ location: null, genre: null });

      // User sees empty filters and can select valid ones
      const userSelection = filterSearch('Japan', 'Street');
      expect(parseFilterParams(userSelection, locations, genres)).toEqual({
        location: 'Japan',
        genre: 'Street',
      });
    });
  });
});
