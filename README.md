# DocuChat Frontend

Next.js 15 frontend for the DocuChat AI Backend Bootcamp project.

## Phase 1 — Authentication (this package)

Covers:
- Register (`POST /api/v1/auth/register`)
- Login (`POST /api/v1/auth/login`)
- Token refresh with rotation (`POST /api/v1/auth/refresh`)
- Logout (`POST /api/v1/auth/logout`)
- Protected dashboard with documents + conversations pages

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL to your backend URL

# 3. Start dev server
npm run dev
```

Visit http://localhost:3001 (or whatever port Next assigns).

## File structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          ← Login page
│   │   └── register/page.tsx       ← Register page
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← Protected layout with sidebar
│   │   ├── dashboard/page.tsx      ← Overview
│   │   ├── documents/page.tsx      ← Document list + upload
│   │   └── conversations/page.tsx  ← Conversation list
│   ├── layout.tsx                  ← Root layout with providers
│   ├── page.tsx                    ← Redirects to /dashboard
│   ├── providers.tsx               ← AuthProvider + React Query
│   └── globals.css                 ← Design tokens + base styles
├── context/
│   └── auth-context.tsx            ← Global auth state
├── lib/
│   ├── api.ts                      ← Axios instance + auto-refresh interceptor
│   ├── auth-api.ts                 ← Auth API functions (typed)
│   └── tokens.ts                   ← Access token (memory) + refresh token (cookie)
└── middleware.ts                   ← Route protection
```

## How token management works

- **Access token**: stored in memory only (`tokens.ts`) — never persisted, safest against XSS
- **Refresh token**: stored in a browser cookie (7-day expiry, SameSite=Strict)
- **Auto-refresh**: Axios response interceptor catches 401s, calls `/auth/refresh`, retries
- **Session restore**: On app mount, `AuthProvider` tries to refresh using any stored cookie
- **Logout**: Clears both tokens and calls the backend to revoke the refresh token

## Phase 2 — RBAC (next)

The next phase adds:
- Admin panel at `/admin`
- Role management UI
- `usePermissions()` hook for conditional rendering
- `PermissionGate` component
