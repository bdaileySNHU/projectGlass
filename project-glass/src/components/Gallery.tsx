"use client";

import { useState, ReactNode, useMemo } from "react";
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
import { filterPhotos, availableLocations, availableGenres } from "@/utils/photoFilters";

interface GalleryProps {
  photos: Photo[];
}

const trackLightboxOpen = (photoId: string) => {
  (window as { umami?: { track: (event: string, data?: Record<string, string>) => void } }).umami?.track("lightbox-open", { photo: photoId });
};

export default function Gallery({ photos }: GalleryProps) {
  const [index, setIndex] = useState(-1);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const { filteredPhotos, locations, genres } = useMemo(() => {
    return {
      filteredPhotos: filterPhotos(photos, selectedLocation, selectedGenre),
      locations: availableLocations(photos, selectedGenre),
      genres: availableGenres(photos, selectedLocation),
    };
  }, [photos, selectedLocation, selectedGenre]);

  const slides = filteredPhotos.map((photo) => {
    const exifDescription = formatExif(photo.exif);
    const subject = `Print inquiry: ${photo.title || photo.id} (${photo.id})`;
    const mailto = `mailto:dailey.105@gmail.com?subject=${encodeURIComponent(subject)}`;

    const description: ReactNode = (
      <>
        {exifDescription}
        {photo.description && (
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
        )}
        <a
          href={mailto}
          className="mt-2 inline-block text-xs text-text-secondary underline transition-colors hover:text-text-primary"
        >
          Inquire about print
        </a>
      </>
    );

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
          onClick={({ index: i }) => {
            trackLightboxOpen(filteredPhotos[i].id);
            setIndex(i);
          }}
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
        captions={{ descriptionTextAlign: "center", descriptionMaxLines: 12 }}
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
