"use client";

interface FilterRowProps {
  label: string;
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}

function FilterRow({ label, tags, selected, onSelect }: FilterRowProps) {
  return (
    <div className="flex items-baseline gap-4 overflow-x-auto scrollbar-hide px-4 sm:justify-center sm:px-0">
      <span className="shrink-0 text-xs font-light uppercase tracking-widest text-text-tertiary">
        {label}
      </span>
      {["All", ...tags].map((tag) => {
        const isActive = tag === "All" ? selected === null : selected === tag;
        return (
          <button
            key={tag}
            onClick={() => onSelect(tag === "All" ? null : tag)}
            className={`whitespace-nowrap text-xs font-light uppercase tracking-widest transition-colors ${
              isActive
                ? "border-b-2 border-accent text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

interface CategoryFilterProps {
  locations: string[];
  genres: string[];
  selectedLocation: string | null;
  selectedGenre: string | null;
  onLocationChange: (tag: string | null) => void;
  onGenreChange: (tag: string | null) => void;
}

export default function CategoryFilter({
  locations,
  genres,
  selectedLocation,
  selectedGenre,
  onLocationChange,
  onGenreChange,
}: CategoryFilterProps) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <FilterRow
        label="Location"
        tags={locations}
        selected={selectedLocation}
        onSelect={onLocationChange}
      />
      <FilterRow
        label="Genre"
        tags={genres}
        selected={selectedGenre}
        onSelect={onGenreChange}
      />
    </div>
  );
}
