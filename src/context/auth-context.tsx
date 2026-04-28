"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { tokens, refreshTokenCookie } from "@/lib/tokens";
import {
    loginUser,
    logoutUser,
    refreshTokens,
    registerUser,
    User,
} from "@/lib/auth-api";
//import { getApiError } from "@/lib/api";

//  Context shape 
interface AuthContextValue {
    user: User | null;
    isLoading: boolean;         // true while restoring session on mount
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const didInit = useRef(false);

    // Restore session on first mount using the stored refresh token
    // Restore session on first mount using the stored refresh token
    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;

        async function initSession() {
            try {
                const storedRefresh = refreshTokenCookie.get();
                if (!storedRefresh) return;

                const { accessToken, refreshToken } = await refreshTokens(storedRefresh);
                tokens.setAccess(accessToken);
                refreshTokenCookie.set(refreshToken);

                const payload = decodeJwtPayload(accessToken);
                if (payload) {
                    setUser({
                        id: payload.sub,
                        email: payload.email ?? "",
                        tier: payload.tier ?? payload.role ?? "free",
                    });
                }
            } catch {
                // Refresh token expired or revoked — clear everything
                tokens.clearAccess();
                refreshTokenCookie.clear();
            } finally {
                setIsLoading(false);
            }
        }

        initSession();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await loginUser({ email, password });
        tokens.setAccess(data.accessToken);
        refreshTokenCookie.set(data.refreshToken);
        setUser(data.user);
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        await registerUser({ email, password });
        // Auto-login after registration
        await login(email, password);
    }, [login]);

    const logout = useCallback(async () => {
        const refreshToken = refreshTokenCookie.get();
        if (refreshToken) {
        try {
            await logoutUser(refreshToken);
        } catch {
            // Server-side logout failed but we still clear client state
        }
        }
        tokens.clearAccess();
        refreshTokenCookie.clear();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
        value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
        }}
        >
        {children}
        </AuthContext.Provider>
    );
}

//  Hook
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}

// Utility: decode JWT payload without a library
function decodeJwtPayload(token: string): Record<string, string> | null {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
        atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}
