import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validatePhotos } from '../src/utils/photoValidation';
import type { Photo } from '../src/types/photo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PHOTOS_DIR = path.join(PROJECT_ROOT, 'public', 'photos');
const DATA_FILE = path.join(PROJECT_ROOT, 'data', 'photos.json');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

function getImageFiles(photosDir: string): string[] {
  if (!fs.existsSync(photosDir)) return [];
  return fs.readdirSync(photosDir)
    .filter(file => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .sort();
}

function loadPhotosJson(dataFile: string): Photo[] {
  if (!fs.existsSync(dataFile)) return [];
  const content = fs.readFileSync(dataFile, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error parsing ${dataFile}:`, err);
    return [];
  }
}

function buildAssetSources(photosDir: string): Set<string> {
  const imageFiles = getImageFiles(photosDir);
  return new Set(imageFiles.map(filename => `/photos/${filename}`));
}

async function main() {
  const photos = loadPhotosJson(DATA_FILE);
  const assetSources = buildAssetSources(PHOTOS_DIR);

  const issues = validatePhotos(photos, assetSources);

  if (issues.length === 0) {
    console.log(`photos.json valid (${photos.length} photos)`);
    process.exit(0);
  }

  for (const issue of issues) {
    console.log(`${issue.id} ${issue.field}: ${issue.message}`);
  }

  process.exit(1);
}

main().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
