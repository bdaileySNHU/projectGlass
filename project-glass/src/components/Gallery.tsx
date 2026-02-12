"use client";

import { useState } from "react";
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Photo } from "@/types/photo";
import renderPhotoCard from "@/components/PhotoCard";
import { formatExif } from "@/utils/format";

interface GalleryProps {
  photos: Photo[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [index, setIndex] = useState(-1);

  const slides = photos.map((photo) => ({
    ...photo,
    title: photo.title,
    description: formatExif(photo.exif),
  }));

  return (
    <div className="sm:px-4 lg:max-w-7xl lg:mx-auto lg:px-6">
      <MasonryPhotoAlbum
        photos={photos}
        columns={(containerWidth) => {
          if (containerWidth < 640) return 1;
          if (containerWidth < 1024) return 2;
          return 3;
        }}
        spacing={12}
        render={{
          image: (props, context) =>
            renderPhotoCard(props, context, context.index < 6),
        }}
        onClick={({ index: i }) => setIndex(i)}
        defaultContainerWidth={400}
        sizes={{
          size: "1232px",
          sizes: [
            { viewport: "(max-width: 640px)", size: "100vw" },
            { viewport: "(max-width: 1024px)", size: "50vw" },
          ],
        }}
      />

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Captions]}
        captions={{ descriptionTextAlign: "center" }}
        on={{ view: ({ index: i }) => setIndex(i) }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          root: { 
            "--yarl__color_backdrop": "rgba(22, 22, 30, 0.95)",
            "--yarl__slide_title_color": "#c0caf5",
            "--yarl__slide_description_color": "#a9b1d6",
            "--yarl__slide_title_font_size": "1rem",
            "--yarl__slide_title_font_weight": "normal",
          },
        }}
      />
    </div>
  );
}
