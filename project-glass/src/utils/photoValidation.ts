import type { Photo } from '@/types/photo';

export type PhotoValidationIssue = {
  id: string;
  field: 'id' | 'src' | 'alt' | 'tags';
  message: string;
};

export function validatePhotos(
  photos: Photo[],
  assetSources: Set<string>,
): PhotoValidationIssue[] {
  const issues: PhotoValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const photo of photos) {
    // Check for duplicate IDs
    if (seenIds.has(photo.id)) {
      issues.push({
        id: photo.id,
        field: 'id',
        message: 'duplicate ID found in collection',
      });
    }
    seenIds.add(photo.id);

    // Check alt text (empty or whitespace-only)
    if (!photo.alt || photo.alt.trim() === '') {
      issues.push({
        id: photo.id,
        field: 'alt',
        message: 'alt text is empty or whitespace-only',
      });
    }

    // Check src exists in assetSources
    if (!assetSources.has(photo.src)) {
      issues.push({
        id: photo.id,
        field: 'src',
        message: `Asset not found: ${photo.src}`,
      });
    }

    // Check tags structure
    const tagsIssue = validateTags(photo.tags);
    if (tagsIssue) {
      issues.push({
        id: photo.id,
        field: 'tags',
        message: tagsIssue,
      });
    }
  }

  return issues;
}

function validateTags(tags: unknown): string | null {
  if (!tags || typeof tags !== 'object') {
    return 'tags object is missing';
  }

  const { location, genre } = tags as { location?: unknown; genre?: unknown };

  if (!Array.isArray(location)) {
    return 'tags.location must be an array of strings';
  }
  if (!Array.isArray(genre)) {
    return 'tags.genre must be an array of strings';
  }
  if (!location.every((item) => typeof item === 'string')) {
    return 'tags.location must contain only strings';
  }
  if (!genre.every((item) => typeof item === 'string')) {
    return 'tags.genre must contain only strings';
  }
  if (location.length === 0 && genre.length === 0) {
    return 'tags: both location and genre arrays are empty';
  }

  return null;
}
