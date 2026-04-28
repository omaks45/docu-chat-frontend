import { api, ApiResponse } from "./api";

//  Types matching your backend responses
export interface User {
    id: string;
    email: string;
    tier: string;
    roles?: string[];
    permissions?: string[];
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterResponse {
    user: User;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

//  Auth API calls 

/**
 * POST /api/v1/auth/register
 * Body: { email, password }
 * Password: min 8 chars, 1 uppercase, 1 number
 */
export async function registerUser(data: { email: string; password: string }) {
    const res = await api.post<ApiResponse<RegisterResponse>>("/auth/register", data);
    return res.data.data;
}

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 * Returns: { accessToken, refreshToken, user }
 */
export async function loginUser(data: { email: string; password: string }) {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", data);
    return res.data.data;
}

/**
 * POST /api/v1/auth/refresh
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken } — rotation: old token invalidated
 */
export async function refreshTokens(refreshToken: string) {
    const res = await api.post<ApiResponse<RefreshResponse>>("/auth/refresh", {
        refreshToken,
    });
    return res.data.data;
}

/**
 * POST /api/v1/auth/logout
 * Body: { refreshToken }
 * Revokes the refresh token server-side
 */
export async function logoutUser(refreshToken: string) {
    await api.post("/auth/logout", { refreshToken });
}
