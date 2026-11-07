import { createContext, useContext, type ReactNode } from "react";
import { actions, useStore } from "@/lib/store";
import { DEFAULT_THEME, type ThemeId } from "@/lib/theme";

const ThemeContext = createContext({ activeTheme: DEFAULT_THEME, setTheme: actions.setTheme });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useStore();
  return <ThemeContext.Provider value={{ activeTheme: theme, setTheme: actions.setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): { activeTheme: ThemeId; setTheme: (theme: ThemeId) => void } {
  return useContext(ThemeContext);
}