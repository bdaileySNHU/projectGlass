import Image from "next/image";
import type { RenderImageProps, RenderImageContext } from "react-photo-album";

export default function renderPhotoCard(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext,
  priority: boolean = false,
) {
  const aspectRatio = width && height ? `${width} / ${height}` : "3 / 2";

  return (
    <figure
      className="group relative w-full m-0 overflow-hidden rounded-sm bg-storm hover:scale-[1.03] transition-transform duration-300 ease-in-out cursor-pointer"
      style={{
        aspectRatio,
      }}
    >
      <Image
        fill
        src={photo.src}
        alt={alt}
        title={title}
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover" }}
      />
      {photo.title && (
        <figcaption className="sr-only">
          {photo.title}
        </figcaption>
      )}
    </figure>
  );
}
