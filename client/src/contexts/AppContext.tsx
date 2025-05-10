import { createContext, useContext, useState, useEffect } from "react";
import { ThemeSettings } from "@shared/schema";
import { api } from "@/lib/api";
import { DEFAULT_THEME } from "@/lib/constants";

interface AppContextType {
  theme: string;
  setTheme: (theme: string) => void;
  activeTheme: ThemeSettings | null;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [activeTheme, setActiveTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActiveTheme = async () => {
      try {
        const theme = await api.getActiveTheme();
        setActiveTheme(theme);
      } catch (error) {
        console.error("Failed to load active theme:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActiveTheme();
  }, []);

  const value = {
    theme,
    setTheme,
    activeTheme,
    isLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}