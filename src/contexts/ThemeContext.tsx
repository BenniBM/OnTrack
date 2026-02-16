import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

const THEME_STORAGE_KEY = "ontrack-theme";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Check localStorage first
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (stored === "light" || stored === "dark") {
            return stored;
        }
        // Fallback to system preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        // Save to localStorage
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState((prev) => (prev === "light" ? "dark" : "light"));
    };

    const value: ThemeContextType = {
        theme,
        toggleTheme,
        setTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};


