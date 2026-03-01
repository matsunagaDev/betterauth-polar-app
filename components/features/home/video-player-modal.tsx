"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { YouTubeEmbed } from "@next/third-parties/google";

interface VideoPlayerModalProps {
  videoId: string;
  videoTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerModal({
  videoId,
  videoTitle,
  open,
  onOpenChange,
}: VideoPlayerModalProps) {
  if (!videoId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="line-clamp-1">{videoTitle}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          <YouTubeEmbed videoid={videoId} style="width: 100%; height: 100%;" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
