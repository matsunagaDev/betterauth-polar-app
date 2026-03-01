"use client";

import { Button } from "@/components/ui/button";

interface Genre {
  id: string;
  label: string;
}

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenreIds: string[];
  onToggle: (genreId: string) => void;
  disabled: boolean;
}

export function GenreSelector({
  genres,
  selectedGenreIds,
  onToggle,
  disabled,
}: GenreSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {genres.map((genre) => {
        const isSelected = selectedGenreIds.includes(genre.id);
        return (
          <Button
            key={genre.id}
            type="button"
            variant={isSelected ? "default" : "outline"}
            className="h-12"
            onClick={() => onToggle(genre.id)}
            disabled={disabled}
          >
            {genre.label}
          </Button>
        );
      })}
    </div>
  );
}
