'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { tokens } from '@/lib/tokens';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const login = async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        tokens.setAccess(data.accessToken);
        setUser(data.user);
    };

    const logout = async () => {
        await api.post('/auth/logout');
        tokens.clearAccess();
        setUser(null);
    };

    // On mount, try to restore session via refresh token
    useEffect(() => {
        api.post('/auth/refresh')
        .then(({ data }) => {
            tokens.setAccess(data.accessToken);
            setUser(data.user);
        })
        .catch(() => {}) // no session, that's fine
        .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
}