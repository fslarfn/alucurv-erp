"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types/auth';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../services/firebase/authService';

interface AuthContextType {
    user: User | null;
    login: (username: string, pass: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check local storage first for immediate UI feedback (optional, but good for UX)
                const storedUser = localStorage.getItem('alucurv_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // Check real firebase session
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    localStorage.setItem('alucurv_user', JSON.stringify(currentUser));
                } else {
                    // If firebase says no user, clear local storage
                    localStorage.removeItem('alucurv_user');
                    setUser(null);
                    if (pathname !== '/login') {
                        router.push('/login');
                    }
                }
            } catch (error) {
                console.error("Auth Init Error", error);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (username: string, pass: string) => {
        // Auto-append domain if simple username is used (for UX)
        let email = username;
        if (!email.includes('@')) {
            email = `${username}@alucurv.com`;
        }

        try {
            const loggedInUser = await authService.login({ username: email, password: pass });
            setUser(loggedInUser);
            localStorage.setItem('alucurv_user', JSON.stringify(loggedInUser));
            router.push('/');
            return true;
        } catch (error) {
            console.error("Login Failed", error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (e) {
            console.error("Logout error", e);
        }
        setUser(null);
        localStorage.removeItem('alucurv_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
