import type { Photo } from '@/types/photo';

export function filterPhotos(
  photos: Photo[],
  activeLocation: string | null,
  activeGenre: string | null,
): Photo[] {
  return photos.filter((photo) => {
    const matchesLocation =
      activeLocation === null ||
      photo.tags.location.includes(activeLocation);
    const matchesGenre =
      activeGenre === null ||
      photo.tags.genre.includes(activeGenre);
    return matchesLocation && matchesGenre;
  });
}

export function availableLocations(
  photos: Photo[],
  activeGenre: string | null,
): string[] {
  const filtered =
    activeGenre === null
      ? photos
      : photos.filter((photo) => photo.tags.genre.includes(activeGenre));

  const locations = [...new Set(filtered.flatMap((p) => p.tags.location))];
  return locations.sort();
}

export function availableGenres(
  photos: Photo[],
  activeLocation: string | null,
): string[] {
  const filtered =
    activeLocation === null
      ? photos
      : photos.filter((photo) => photo.tags.location.includes(activeLocation));

  const genres = [...new Set(filtered.flatMap((p) => p.tags.genre))];
  return genres.sort();
}
