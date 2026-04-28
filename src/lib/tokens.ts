// Access token lives in memory only — never localStorage (XSS risk)
let _accessToken: string | null = null;

export const tokens = {
    getAccess: (): string | null => _accessToken,

    setAccess: (token: string): void => {
        _accessToken = token;
    },

    clearAccess: (): void => {
        _accessToken = null;
    },
};

// Refresh token helpers — stored in a plain cookie (server sends it)
// The backend sends `refreshToken` in the JSON body, so we manage it here
export const refreshTokenCookie = {
    get: (): string | null => {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(/(?:^|;\s*)refreshToken=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
    },

    set: (token: string): void => {
        if (typeof document === "undefined") return;
        // 7 days — matches backend expiry
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `refreshToken=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Strict`;
    },

    clear: (): void => {
        if (typeof document === "undefined") return;
        document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },
};