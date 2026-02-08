import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-[320px]">
        <CardContent className="px-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
