import { loadPhotos } from "@/lib/loadPhotos";
import Header from "@/components/Header";
import Gallery from "@/components/Gallery";

export default function Home() {
  const photos = loadPhotos();

  return (
    <>
      <Header />
      <main>
        <Gallery photos={photos} />
      </main>
    </>
  );
}
