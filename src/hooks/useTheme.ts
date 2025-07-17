// Create src/hooks/useTheme.ts
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useTheme = () => {
    const { user } = useAuth();

    useEffect(() => {
        const isDarkMode = user?.preferences?.darkMode ?? true;

        if (isDarkMode) {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, [user?.preferences?.darkMode]);

    return {
        isDarkMode: user?.preferences?.darkMode ?? true,
        theme: user?.preferences?.darkMode ? 'dark' : 'light'
    };
};