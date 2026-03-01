"use client";

import type { VideoItem } from "@/lib/youtube/video-service";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: VideoItem;
  onSelect: (videoId: string) => void;
  className?: string;
}

export function VideoCard({ video, onSelect, className }: VideoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(video.videoId)}
      className={cn(
        "group text-left rounded-lg overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="size-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium leading-snug line-clamp-2">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground">{video.channelName}</p>
      </div>
    </button>
  );
}
