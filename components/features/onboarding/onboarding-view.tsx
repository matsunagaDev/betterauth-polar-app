"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenreSelector } from "./genre-selector";
import { toast } from "sonner";

export function OnboardingView() {
  const router = useRouter();
  const trpc = useTRPC();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: genres, isLoading } = useQuery(trpc.genre.list.queryOptions());

  const completeMutation = useMutation(
    trpc.onboarding.complete.mutationOptions({
      onSuccess: () => {
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message);
        setIsSubmitting(false);
      },
    })
  );

  const MAX_GENRES = 3;

  const handleToggle = (genreId: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      }
      if (prev.length >= MAX_GENRES) {
        return prev;
      }
      return [...prev, genreId];
    });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    completeMutation.mutate({ genres: selectedGenres });
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    completeMutation.mutate({ genres: [] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-svh p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>興味のあるジャンルを選んでください</CardTitle>
          <CardDescription>
            選択したジャンルに基づいておすすめのコンテンツを表示します（最大3つ）。後から変更することもできます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GenreSelector
            genres={genres ?? []}
            selectedGenreIds={selectedGenres}
            onToggle={handleToggle}
            disabled={isSubmitting}
          />

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleComplete}
              disabled={isSubmitting || selectedGenres.length === 0}
              className="w-full"
            >
              {isSubmitting ? "処理中..." : "完了"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full"
            >
              スキップ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
