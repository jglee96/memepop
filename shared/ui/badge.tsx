import * as React from "react";

import { cn } from "@/shared/lib/cn";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200",
        className
      )}
      {...props}
    />
  );
}
