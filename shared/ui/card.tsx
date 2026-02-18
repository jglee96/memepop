import * as React from "react";

import { cn } from "@/shared/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80",
        className
      )}
      {...props}
    />
  );
}
