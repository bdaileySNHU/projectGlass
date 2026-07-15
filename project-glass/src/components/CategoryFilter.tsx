"use client";

interface FilterRowProps {
  label: string;
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}

function FilterRow({ label, tags, selected, onSelect }: FilterRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 sm:justify-center sm:px-0">
      <span className="text-xs font-light uppercase tracking-widest text-text-tertiary">
        {label}
      </span>
      {["All", ...tags].map((tag) => {
        const isActive = tag === "All" ? selected === null : selected === tag;
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(tag === "All" ? null : tag)}
            className={`min-h-11 min-w-11 whitespace-nowrap px-1 text-xs font-light uppercase tracking-widest transition-colors ${
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
  onClear: () => void;
}

export default function CategoryFilter({
  locations,
  genres,
  selectedLocation,
  selectedGenre,
  onLocationChange,
  onGenreChange,
  onClear,
}: CategoryFilterProps) {
  const hasActiveFilter = selectedLocation !== null || selectedGenre !== null;

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
      {hasActiveFilter && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 text-xs font-light uppercase tracking-widest text-text-tertiary underline transition-colors hover:text-text-primary"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
