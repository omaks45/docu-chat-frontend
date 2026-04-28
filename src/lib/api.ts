import axios, { AxiosError } from "axios";
import { tokens, refreshTokenCookie } from "./tokens";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

//  Request interceptor: attach access token
api.interceptors.request.use(
    (config) => {
        const token = tokens.getAccess();
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//  Response interceptor: handle 401 → auto-refresh → retry 
let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token!);
    });
    pendingQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as typeof error.config & { _retry?: boolean };

        // Only handle 401 on non-refresh endpoints, and only once per request
        if (
        error.response?.status === 401 &&
        !original._retry &&
        !original.url?.includes("/auth/refresh") &&
        !original.url?.includes("/auth/login")
        ) {
        if (isRefreshing) {
            // Queue this request until the refresh completes
            return new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
            }).then((newToken) => {
            original.headers!.Authorization = `Bearer ${newToken}`;
            return api(original);
            });
        }

        original._retry = true;
        isRefreshing = true;

        const refreshToken = refreshTokenCookie.get();
        if (!refreshToken) {
            isRefreshing = false;
            tokens.clearAccess();
            refreshTokenCookie.clear();
            if (typeof window !== "undefined") window.location.href = "/login";
            return Promise.reject(error);
        }

        try {
            const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
            });

            const newAccess: string = data.data.accessToken;
            const newRefresh: string = data.data.refreshToken;

            tokens.setAccess(newAccess);
            refreshTokenCookie.set(newRefresh);

            processQueue(null, newAccess);
            original.headers!.Authorization = `Bearer ${newAccess}`;
            return api(original);
        } catch (refreshError) {
            processQueue(refreshError, null);
            tokens.clearAccess();
            refreshTokenCookie.clear();
            if (typeof window !== "undefined") window.location.href = "/login";
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
        }

        return Promise.reject(error);
    }
);

//  Typed API helpers
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Array<{ field: string; message: string }>;
    };
    statusCode: number;
    path: string;
    timestamp: string;
}

export function getApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiError | undefined;
        if (data?.error?.message) return data.error.message;
        if (data?.error?.details?.length) {
        return data.error.details.map((d) => d.message).join(". ");
        }
    }
    return "Something went wrong. Please try again.";
}