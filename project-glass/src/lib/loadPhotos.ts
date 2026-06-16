import fs from "fs";
import path from "path";
import { Photo } from "@/types/photo";

/**
 * Loads the curated photo list from data/photos.json.
 * Server-only (uses fs); shared by the home page and the slideshow page.
 */
export function loadPhotos(): Photo[] {
  try {
    const filePath = path.join(process.cwd(), "data", "photos.json");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContents);
    }
  } catch (error) {
    console.error("Error loading photos:", error);
  }

  return [];
}
