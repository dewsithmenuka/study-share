import { useState, useEffect } from 'react';

// Global event name to sync theme across all components
const THEME_CHANGE_EVENT = 'themeChange';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        // Apply dark class to <html>
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);

        // Broadcast theme change to all other components using this hook
        window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
    }, [theme]);

    // Listen for theme changes triggered by OTHER instances of this hook
    useEffect(() => {
        const handler = (e) => {
            if (e.detail !== theme) {
                setTheme(e.detail);
            }
        };
        window.addEventListener(THEME_CHANGE_EVENT, handler);
        return () => window.removeEventListener(THEME_CHANGE_EVENT, handler);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
}