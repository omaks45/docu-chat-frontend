"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
        new QueryClient({
            defaultOptions: {
            queries: { retry: 1, staleTime: 30_000 },
            mutations: { retry: 0 },
            },
        })
    );

    return (
        <QueryClientProvider client={queryClient}>
        <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
        </AuthProvider>
        </QueryClientProvider>
    );
}
