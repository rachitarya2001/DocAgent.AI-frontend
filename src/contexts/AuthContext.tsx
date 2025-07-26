import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiBaseUrl } from '../config/api';

interface User {
    id: string;
    username: string;
    email: string;
    messagesUsed: number;
    messagesTotalLimit: number;
    plan: string;
    preferences?: {
        darkMode: boolean;
        autoSave: boolean;
        notifications: boolean;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    updateUser: (userData: Partial<User>) => void;
    updatePreferences: (preferences: Partial<User['preferences']>) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const checkAuthStatus = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (savedToken && savedUser) {
                try {
                    // Validate token with backend
                    const response = await fetch(`${apiBaseUrl}/api/validate-token`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${savedToken}`
                        }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        setToken(savedToken);
                        setUser(result.user);
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    console.error('Token validation error:', error);
                    // On error, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const updatePreferences = (preferences: Partial<User['preferences']>) => {
        if (user) {
            // Provide default values to ensure no undefined values
            const defaultPreferences = {
                darkMode: true,
                autoSave: true,
                notifications: false
            };

            const updatedUser = {
                ...user,
                preferences: {
                    ...defaultPreferences,
                    ...user.preferences,
                    ...preferences
                }
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };



    const value = {
        user,
        token,
        login,
        logout,
        updateUser,
        updatePreferences,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};