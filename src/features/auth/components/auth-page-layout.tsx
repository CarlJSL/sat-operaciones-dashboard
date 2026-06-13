import type { ReactNode } from "react";
import { cn } from "@/core/lib/utils";

interface AuthPageLayoutProps {
  children: ReactNode;
  variant?: "centered" | "split";
}

export function AuthPageLayout({
  children,
  variant = "centered",
}: AuthPageLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-muted",
        variant === "centered" && "flex items-center justify-center p-4"
      )}
    >
      {children}
    </div>
  );
}
