import type { Metadata } from "next";
import { loadPhotos } from "@/lib/loadPhotos";
import Slideshow from "@/components/Slideshow";

export const metadata: Metadata = {
  title: "Slideshow — photos.bdailey.com",
};

export default function SlideshowPage() {
  const photos = loadPhotos();

  return <Slideshow photos={photos} />;
}
