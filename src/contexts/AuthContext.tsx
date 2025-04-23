import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { apiClient, setAuthToken as setApiClientToken, removeAuthToken as clearApiClientToken, getAuthToken } from '@/lib/api';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean; // To differentiate admin/staff
}

interface AuthContextProps {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(getAuthToken()); // Initialize token from storage
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until user is fetched

    const fetchUser = async (authToken: string) => {
        setIsLoading(true);
        try {
            setApiClientToken(authToken); // Set token for API client
            const userData = await apiClient<User>('/user/'); // Fetch user data from backend
            setUser(userData);
            setToken(authToken); // Confirm token is set
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
        if (currentToken) {
            fetchUser(currentToken);
        } else {
            setIsLoading(false); // No token, stop loading
        }
    }, []); // Run only on initial mount

    const login = async (newToken: string) => {
        await fetchUser(newToken); // Fetch user immediately after login
    };

    const logout = () => {
        clearApiClientToken();
        setUser(null);
        setToken(null);
        // Optionally redirect to login or home page
        // navigate('/login'); 
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
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