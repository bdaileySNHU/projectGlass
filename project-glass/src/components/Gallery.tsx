"use client";

import { useState, ReactNode } from "react";
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import ReactMarkdown from "react-markdown";
import { Photo } from "@/types/photo";
import renderPhotoCard from "@/components/PhotoCard";
import CategoryFilter from "@/components/CategoryFilter";
import { formatExif } from "@/utils/format";

interface GalleryProps {
  photos: Photo[];
}

const uniqueTags = (photos: Photo[], dimension: "location" | "genre") =>
  [...new Set(photos.flatMap((p) => p.tags[dimension]))].sort();

export default function Gallery({ photos }: GalleryProps) {
  const [index, setIndex] = useState(-1);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const filteredPhotos = photos.filter((photo) => {
    const matchesLocation =
      selectedLocation === null ||
      photo.tags.location.includes(selectedLocation);
    const matchesGenre =
      selectedGenre === null ||
      photo.tags.genre.includes(selectedGenre);
    return matchesLocation && matchesGenre;
  });

  const locations =
    selectedGenre === null
      ? uniqueTags(photos, "location")
      : uniqueTags(
          photos.filter((photo) => photo.tags.genre.includes(selectedGenre)),
          "location"
        );

  const genres =
    selectedLocation === null
      ? uniqueTags(photos, "genre")
      : uniqueTags(
          photos.filter((photo) => photo.tags.location.includes(selectedLocation)),
          "genre"
        );

  const slides = filteredPhotos.map((photo) => {
    const exifDescription = formatExif(photo.exif);

    let description: ReactNode = exifDescription;

    if (photo.description) {
      description = (
        <>
          {exifDescription}
          <div className="text-sm text-text-secondary mt-2">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {photo.description}
            </ReactMarkdown>
          </div>
        </>
      );
    }

    return {
      ...photo,
      title: photo.title,
      description,
    };
  });

  return (
    <div className="sm:px-4 lg:max-w-7xl lg:mx-auto lg:px-6">
      <CategoryFilter
        locations={locations}
        genres={genres}
        selectedLocation={selectedLocation}
        selectedGenre={selectedGenre}
        onLocationChange={setSelectedLocation}
        onGenreChange={setSelectedGenre}
      />
      <div key={`${selectedLocation}-${selectedGenre}`} className="fade-in">
        <MasonryPhotoAlbum
          photos={filteredPhotos}
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
      </div>

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
