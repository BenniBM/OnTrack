import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { authenticateUser, getCurrentUser, signOut } from "../services/supabase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const signIn = async () => {
        try {
            setLoading(true);
            setError(null);
            const { user: authUser, error: authError } = await authenticateUser();

            if (authError) {
                setError(authError.message);
                return;
            }

            if (authUser) {
                setUser(authUser);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            const { error: signOutError } = await signOut();
            if (signOutError) {
                setError(signOutError.message);
                return;
            }
            setUser(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Sign out failed");
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    // Auto-authenticate if no user is found
                    await signIn();
                }
            } catch (err) {
                console.error("Error checking user:", err);
                // Auto-authenticate on error
                await signIn();
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        error,
        signIn,
        signOut: handleSignOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
