import fs from "fs";
import path from "path";
import { Photo } from "@/types/photo";
import Header from "@/components/Header";
import Gallery from "@/components/Gallery";

export default function Home() {
  let photos: Photo[] = [];

  try {
    const filePath = path.join(process.cwd(), "data", "photos.json");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      photos = JSON.parse(fileContents);
    }
  } catch (error) {
    console.error("Error loading photos:", error);
  }

  return (
    <>
      <Header />
      <main>
        <Gallery photos={photos} />
      </main>
    </>
  );
}
