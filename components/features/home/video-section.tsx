import { cn } from "@/lib/utils";

interface VideoSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function VideoSection({ title, children, className }: VideoSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
