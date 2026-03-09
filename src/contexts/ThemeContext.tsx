// contexts/ThemeContext.tsx - UPDATED WITH TOGGLE FUNCTION
import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void; // Add this function
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get from localStorage or default to 'auto'
    const saved = localStorage.getItem("theme") as Theme;
    return saved || "auto";
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check initial theme
    if (theme === "dark") return true;
    if (theme === "light") return false;
    // For auto, check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Add toggleTheme function
  const toggleTheme = () => {
    const themes: Array<"light" | "dark" | "auto"> = ["light", "dark", "auto"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove("light", "dark");

    let currentTheme = theme;

    if (theme === "auto") {
      // Check system preference
      currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    // Apply theme class to HTML element
    root.classList.add(currentTheme);
    setIsDark(currentTheme === "dark");

    // Save to localStorage
    localStorage.setItem("theme", theme);

    console.log(`🎨 Theme set to: ${currentTheme} (user preference: ${theme})`);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "auto") {
        const newTheme = e.matches ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
        setIsDark(newTheme === "dark");
        console.log(`🔄 System theme changed to: ${newTheme}`);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
