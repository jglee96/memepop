import * as React from "react";

import { cn } from "@/shared/lib/cn";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>): React.JSX.Element {
  return <label className={cn("text-sm font-medium text-slate-700 dark:text-slate-200", className)} {...props} />;
}
