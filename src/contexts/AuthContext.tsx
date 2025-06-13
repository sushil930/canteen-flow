import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { apiClient, setAuthToken as setApiClientToken, removeAuthToken as clearApiClientToken, getAuthToken } from '@/lib/api';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean; // To differentiate admin/staff
    is_superuser: boolean; // For superuser privileges
}

interface AuthContextProps {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isGuest: boolean; // Add isGuest flag
    login: (token: string) => Promise<void>;
    logout: () => void;
    loginAsGuest: () => void; // Add guest login function
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(getAuthToken()); // Initialize token from storage
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until user is fetched
    const [isGuest, setIsGuest] = useState<boolean>(false); // State to track guest status

    const fetchUser = async (authToken: string) => {
        setIsLoading(true);
        try {
            setApiClientToken(authToken); // Set token for API client
            const userData = await apiClient<User>('/user/'); // Fetch user data from backend
            setUser(userData);
            setToken(authToken); // Confirm token is set
            setIsGuest(false); // It's a real user
        } catch (error) {
            console.error("Failed to fetch user:", error);
            // If fetching user fails (e.g., invalid token), clear auth state
            clearApiClientToken();
            setUser(null);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const currentToken = getAuthToken();
        if (currentToken === 'guest-token') {
             // Handle guest user on initial load
            loginAsGuest();
        } else if (currentToken) {
            fetchUser(currentToken);
        } else {
            setIsLoading(false); // No token, stop loading
        }
    }, []); // Run only on initial mount

    const login = async (newToken: string) => {
        await fetchUser(newToken); // Fetch user immediately after login
    };

    const loginAsGuest = () => {
        setIsLoading(true);
        const guestUser: User = {
            id: 999,
            username: 'guest',
            email: 'guest@example.com',
            first_name: 'Guest',
            last_name: 'User',
            is_staff: false,
            is_superuser: false,
        };
        setUser(guestUser);
        setToken('guest-token'); // Use a special token for guest
        localStorage.setItem('authToken', 'guest-token');
        setIsGuest(true);
        setIsLoading(false);
    };

    const logout = () => {
        clearApiClientToken();
        setUser(null);
        setToken(null);
        setIsGuest(false);
        // Optionally redirect to login or home page
        // navigate('/login'); 
    };

    const value = {
        user,
        token,
        isLoading,
        isGuest,
        login,
        logout,
        loginAsGuest,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 