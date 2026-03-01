"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { VideoCard } from "./video-card";
import { VideoSection } from "./video-section";
import { VideoGridSkeleton } from "./video-grid-skeleton";
import { VideoEmptyState } from "./video-empty-state";
import { VideoPlayerModal } from "./video-player-modal";

interface VideoGridProps {
  isAuthenticated: boolean;
  className?: string;
}

export function VideoGrid({ isAuthenticated, className }: VideoGridProps) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState("");

  const trpc = useTRPC();

  const popularQuery = useQuery(
    trpc.video.popular.queryOptions({ maxResults: 12 })
  );

  const genresQuery = useQuery({
    ...trpc.video.byGenres.queryOptions({ maxResults: 8 }),
    enabled: isAuthenticated,
  });

  const handleSelectVideo = (videoId: string, title: string) => {
    setSelectedVideoId(videoId);
    setSelectedVideoTitle(title);
  };

  const gridClassName =
    "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={className}>
      <div className="space-y-8">
        {/* ジャンル別動画セクション（認証済みのみ） */}
        {isAuthenticated && (
          <>
            {genresQuery.isLoading && (
              <VideoSection title="あなたへのおすすめ">
                <VideoGridSkeleton count={8} />
              </VideoSection>
            )}
            {genresQuery.data?.sections.map((section) => (
              <VideoSection key={section.genreId} title={section.genreLabel}>
                {section.videos.length === 0 ? (
                  <VideoEmptyState />
                ) : (
                  <div className={gridClassName}>
                    {section.videos.map((video) => (
                      <VideoCard
                        key={video.videoId}
                        video={video}
                        onSelect={(id) => handleSelectVideo(id, video.title)}
                      />
                    ))}
                  </div>
                )}
              </VideoSection>
            ))}
          </>
        )}

        {/* 未認証ユーザーへのログイン促進 */}
        {!isAuthenticated && (
          <VideoSection title="あなたへのおすすめ">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                ログインするとジャンルに合った動画が表示されます
              </p>
            </div>
          </VideoSection>
        )}

        {/* 人気動画セクション */}
        <VideoSection title="人気の動画">
          {popularQuery.isLoading && <VideoGridSkeleton count={12} />}
          {popularQuery.data && popularQuery.data.videos.length === 0 && (
            <VideoEmptyState />
          )}
          {popularQuery.data && popularQuery.data.videos.length > 0 && (
            <div className={gridClassName}>
              {popularQuery.data.videos.map((video) => (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  onSelect={(id) => handleSelectVideo(id, video.title)}
                />
              ))}
            </div>
          )}
        </VideoSection>
      </div>

      {/* 動画再生モーダル */}
      <VideoPlayerModal
        videoId={selectedVideoId ?? ""}
        videoTitle={selectedVideoTitle}
        open={selectedVideoId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVideoId(null);
            setSelectedVideoTitle("");
          }
        }}
      />
    </div>
  );
}
