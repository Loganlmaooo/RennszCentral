import { createContext, useContext, useState, useEffect, useCallback, ReactNode, createElement } from "react";
import { apiRequest } from "@/lib/queryClient";
import { ThemeSetting, InsertThemeSetting } from "@/types";
import { applyTheme, loadFonts } from "@/lib/theme";
import { useAdmin } from "./useAdmin";

interface ThemeContextProps {
  themes: ThemeSetting[] | null;
  activeTheme: ThemeSetting | null;
  isLoading: boolean;
  error: Error | null;
  fetchThemes: () => Promise<void>;
  fetchActiveTheme: () => Promise<void>;
  createTheme: (theme: InsertThemeSetting) => Promise<ThemeSetting>;
  updateTheme: (id: number, theme: Partial<InsertThemeSetting>) => Promise<ThemeSetting>;
  deleteTheme: (id: number) => Promise<void>;
  setActiveTheme: (id: number) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextProps>({
  themes: null,
  activeTheme: null,
  isLoading: false,
  error: null,
  fetchThemes: async () => {},
  fetchActiveTheme: async () => {},
  createTheme: async () => ({ 
    id: 0, 
    name: "", 
    primaryColor: "", 
    secondaryColor: "", 
    accentColor: "", 
    textColor: "", 
    backgroundType: "color", 
    backgroundValue: "", 
    headingFont: "", 
    bodyFont: "", 
    isActive: false 
  }),
  updateTheme: async () => ({ 
    id: 0, 
    name: "", 
    primaryColor: "", 
    secondaryColor: "", 
    accentColor: "", 
    textColor: "", 
    backgroundType: "color", 
    backgroundValue: "", 
    headingFont: "", 
    bodyFont: "", 
    isActive: false 
  }),
  deleteTheme: async () => {},
  setActiveTheme: async () => {}
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themes, setThemes] = useState<ThemeSetting[] | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeSetting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAdmin();
  
  const fetchThemes = useCallback(async () => {
    try {
      const response = await fetch("/api/themes");
      if (!response.ok) {
        throw new Error(`Failed to fetch themes: ${response.status}`);
      }
      
      const data: ThemeSetting[] = await response.json();
      setThemes(data);
    } catch (err) {
      console.error("Error fetching themes:", err);
    }
  }, []);
  
  const fetchActiveTheme = useCallback(async () => {
    try {
      const response = await fetch("/api/themes/active");
      if (!response.ok) {
        if (response.status !== 404) {
          console.error(`Failed to fetch active theme: ${response.status}`);
        }
        return;
      }
      
      const data: ThemeSetting = await response.json();
      setActiveTheme(data);
      
      // Apply theme and load fonts
      applyTheme(data);
      loadFonts(data.headingFont, data.bodyFont);
    } catch (err) {
      console.error("Error fetching active theme:", err);
    }
  }, []);
  
  useEffect(() => {
    fetchThemes();
    fetchActiveTheme();
  }, [fetchThemes, fetchActiveTheme]);
  
  const createTheme = useCallback(async (theme: InsertThemeSetting): Promise<ThemeSetting> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    const response = await apiRequest("POST", "/api/themes", theme);
    const newTheme: ThemeSetting = await response.json();
    
    // Update local state
    setThemes(prevThemes => 
      prevThemes ? [...prevThemes, newTheme] : [newTheme]
    );
    
    // If this is set as active, update active theme
    if (newTheme.isActive) {
      setActiveTheme(newTheme);
      applyTheme(newTheme);
      loadFonts(newTheme.headingFont, newTheme.bodyFont);
    }
    
    return newTheme;
  }, [isAuthenticated]);
  
  const updateTheme = useCallback(async (id: number, theme: Partial<InsertThemeSetting>): Promise<ThemeSetting> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    const response = await apiRequest("PUT", `/api/themes/${id}`, theme);
    const updatedTheme: ThemeSetting = await response.json();
    
    // Update local state
    setThemes(prevThemes => 
      prevThemes 
        ? prevThemes.map(t => t.id === id ? updatedTheme : t)
        : null
    );
    
    // Update active theme if needed
    if (updatedTheme.isActive) {
      setActiveTheme(updatedTheme);
      applyTheme(updatedTheme);
      loadFonts(updatedTheme.headingFont, updatedTheme.bodyFont);
    } else if (activeTheme?.id === id) {
      // If this was the active one and is no longer active, refetch
      fetchActiveTheme();
    }
    
    return updatedTheme;
  }, [isAuthenticated, activeTheme, fetchActiveTheme]);
  
  const deleteTheme = useCallback(async (id: number): Promise<void> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    await apiRequest("DELETE", `/api/themes/${id}`);
    
    // Update local state
    setThemes(prevThemes => 
      prevThemes ? prevThemes.filter(t => t.id !== id) : null
    );
  }, [isAuthenticated]);
  
  const setActiveThemeFunc = useCallback(async (id: number): Promise<void> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    await apiRequest("POST", `/api/themes/${id}/activate`);
    
    // Refetch themes and active theme to reflect changes
    await fetchThemes();
    await fetchActiveTheme();
  }, [isAuthenticated, fetchThemes, fetchActiveTheme]);
  
  const contextValue = {
    themes,
    activeTheme,
    isLoading,
    error,
    fetchThemes,
    fetchActiveTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    setActiveTheme: setActiveThemeFunc
  };
  
  return createElement(ThemeContext.Provider, { value: contextValue }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}