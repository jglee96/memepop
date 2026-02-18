import * as React from "react";

import { cn } from "@/shared/lib/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-32 w-full resize-y border-b border-slate-300/90 bg-transparent px-0 pb-3 pt-1 text-lg leading-tight placeholder:text-slate-400 transition-colors focus-visible:border-slate-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/90 dark:placeholder:text-slate-500 dark:focus-visible:border-slate-100",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
