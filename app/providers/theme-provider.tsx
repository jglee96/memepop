"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider } from "next-themes";

export function AppThemeProvider({ children, ...props }: ThemeProviderProps): React.JSX.Element {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
