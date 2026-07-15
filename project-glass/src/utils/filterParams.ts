export interface FilterSelection {
  location: string | null;
  genre: string | null;
}

/** Parse a location.search string ("?location=Japan&genre=Street") into a validated selection.
 *  Values are matched case-insensitively against the available taxonomies and the CANONICAL
 *  taxonomy value is returned. Missing, malformed, or unknown values yield null (never throw). */
export function parseFilterParams(
  search: string,
  locations: string[],
  genres: string[],
): FilterSelection {
  try {
    const params = new URLSearchParams(search);
    const locationValue = params.get('location');
    const genreValue = params.get('genre');

    return {
      location: resolveValue(locationValue, locations),
      genre: resolveValue(genreValue, genres),
    };
  } catch {
    // Malformed search string: return nulls
    return { location: null, genre: null };
  }
}

/** Serialize a selection to a search string: "?location=Japan&genre=Street",
 *  "?genre=Street", or "" when both null. Uses URLSearchParams encoding. */
export function filterSearch(
  location: string | null,
  genre: string | null,
): string {
  const params = new URLSearchParams();

  if (location !== null) {
    params.set('location', location);
  }
  if (genre !== null) {
    params.set('genre', genre);
  }

  const search = params.toString();
  return search ? `?${search}` : '';
}

/** Resolve a URL param value against a taxonomy via case-insensitive match.
 *  Returns the canonical taxonomy string or null if missing/unknown. */
function resolveValue(value: string | null, taxonomy: string[]): string | null {
  if (!value || value.trim() === '') {
    return null;
  }

  const match = taxonomy.find(
    (t) => t.toLowerCase() === value.toLowerCase(),
  );
  return match ?? null;
}
