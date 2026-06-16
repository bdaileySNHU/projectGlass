import { describe, it, expect } from "vitest";
import {
  titleFromId,
  posterTitle,
  posterLocation,
  posterMeta,
  orientation,
} from "@/utils/poster";
import type { Photo } from "@/types/photo";

const base: Photo = {
  id: "mt-fuji",
  src: "/photos/mt-fuji.jpeg",
  width: 5099,
  height: 3579,
  alt: "",
  title: "",
  tags: { location: [], genre: [] },
};

describe("titleFromId", () => {
  it("title-cases a multi-word slug", () => {
    expect(titleFromId("small-world-tokyo")).toBe("Small World Tokyo");
  });

  it("handles a single word", () => {
    expect(titleFromId("tangled")).toBe("Tangled");
  });

  it("ignores stray separators", () => {
    expect(titleFromId("mt--fuji-")).toBe("Mt Fuji");
  });
});

describe("posterTitle", () => {
  it("prefers an explicit title", () => {
    expect(posterTitle({ ...base, title: "Mount Fuji" })).toBe("Mount Fuji");
  });

  it("falls back to alt when title is empty", () => {
    expect(posterTitle({ ...base, title: "  ", alt: "Sunrise over Fuji" })).toBe(
      "Sunrise over Fuji",
    );
  });

  it("falls back to a derived name when title and alt are empty", () => {
    expect(posterTitle({ ...base, id: "kyoto-cherry-blossom" })).toBe(
      "Kyoto Cherry Blossom",
    );
  });
});

describe("posterLocation", () => {
  it("joins location tags", () => {
    expect(
      posterLocation({ ...base, tags: { location: ["Japan", "Tokyo"], genre: [] } }),
    ).toBe("Japan, Tokyo");
  });

  it("returns null when there are no location tags", () => {
    expect(posterLocation(base)).toBeNull();
  });
});

describe("posterMeta", () => {
  it("returns undefined when there is no EXIF", () => {
    expect(posterMeta(base)).toBeUndefined();
  });

  it("formats EXIF into a single line", () => {
    const meta = posterMeta({
      ...base,
      exif: { camera: "Nikon Zf", aperture: "f/8", iso: "100" },
    });
    expect(meta).toContain("Nikon Zf");
    expect(meta).toContain("ISO 100");
  });
});

describe("orientation", () => {
  it("classifies a wide panorama", () => {
    expect(orientation({ ...base, width: 8716, height: 3457 })).toBe("panorama");
  });

  it("classifies a tall portrait", () => {
    expect(orientation({ ...base, width: 3826, height: 5741 })).toBe("portrait");
  });

  it("classifies a standard landscape", () => {
    expect(orientation({ ...base, width: 5099, height: 3579 })).toBe("landscape");
  });

  it("defaults to landscape when dimensions are missing", () => {
    expect(orientation({ ...base, width: 0, height: 0 })).toBe("landscape");
  });
});
