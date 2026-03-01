import { cn } from "@/lib/utils";

interface VideoEmptyStateProps {
  message?: string;
  className?: string;
}

export function VideoEmptyState({
  message = "動画が見つかりませんでした",
  className,
}: VideoEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-dashed p-12 text-center",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
