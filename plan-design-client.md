# CinemaKatok — Production-Ready Frontend Enhancement Plan

> **Document type:** Developer Implementation Plan  
> **Scope:** Frontend client only (`CINEMAKATOK26-FE-CLIENT`)  
> **Stack basis:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS v4 · Radix UI / shadcn-ui  
> **Last updated:** 2026-04-08  
> **Status:** Design Approved · Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Audit](#2-current-state-audit)
3. [Target Architecture Overview](#3-target-architecture-overview)
4. [New Dependencies](#4-new-dependencies)
5. [Phase 1 — Critical Fixes](#5-phase-1--critical-fixes-week-12)
6. [Phase 2 — State & Data Migration](#6-phase-2--state--data-migration-week-34)
7. [Phase 3 — Quality, Testing & DX](#7-phase-3--quality-testing--dx-week-56)
8. [Folder Structure (Target)](#8-folder-structure-target)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Decision Log](#10-decision-log)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Glossary](#12-glossary)

---

## 1. Executive Summary

CinemaKatok is an OTT streaming platform built on Next.js 16 with React 19. The current codebase is functional but contains several critical architectural gaps that prevent it from being considered production-ready:

- Authentication tokens are stored in `localStorage`, making the server-side middleware route guard non-functional.
- Auth state is synchronized between components via raw `window.dispatchEvent` DOM events — a fragile, untestable anti-pattern.
- There is no global state management library; a single Context file (`movie-actions-context.tsx`) has grown to 433 lines handling three unrelated concerns.
- There is no server-state caching layer; every page navigation triggers a full network refetch of all data.
- Image optimization is explicitly disabled in `next.config.ts`, degrading Core Web Vitals.
- TypeScript and ESLint errors are silently ignored during builds, masking real defects.
- There is zero test coverage across the entire codebase.

This plan describes all tasks required to address these gaps across three implementation phases, delivering a production-grade application architecture.

---

## 2. Current State Audit

### 2.1 Authentication (🔴 Critical)

| Issue | Location | Description |
|---|---|---|
| Token in localStorage | `src/lib/auth.ts`, `src/lib/request.ts` | `accessToken` and `refreshToken` are saved to and read from `localStorage`. This is inaccessible to Next.js middleware which runs on the server/edge. |
| Broken middleware guard | `src/middleware.ts` | The middleware attempts to read `accessToken` from cookies, but the login flow never writes to cookies. Result: the `/video` route is **never protected server-side** — any unauthenticated user can access it by navigating directly. |
| DOM event sync | `src/hooks/use-auth.ts`, 8+ components | Auth state changes (login, logout, profile update) are communicated via `window.dispatchEvent(new Event(...))`. Components listen with `window.addEventListener`. This is not SSR-compatible, not testable, and will silently fail in concurrent React rendering. |
| Repeated auth checks | `src/contexts/movie-actions-context.tsx` and hooks | Every hook independently calls `localStorage.getItem("accessToken")` to determine login status. There is no single source of truth. |

### 2.2 State Management (🟠 High)

| Issue | Location | Description |
|---|---|---|
| No global state library | Entire `src/` | The project uses only React `useState` and two Context providers. There is no predictable, centralized state. |
| Monolithic Context | `src/contexts/movie-actions-context.tsx` | A single 433-line Context manages favorite state, watchlist state, review state, and pagination — three separate domains in one provider. Any consumer re-renders on any state change within the context. |
| UI state via DOM events | 8+ files | Modal open/close state (`login-modal`, `register-modal`) is triggered by `window.dispatchEvent` instead of a state store. |
| No `video.store` | `src/components/ui/video-player/` | Video player state (current episode, resume position, quality setting) is managed with local `useState` in the component. Navigating away loses all progress state. |

### 2.3 Server State / Data Fetching (🔴 Critical)

| Issue | Location | Description |
|---|---|---|
| No caching | All 23 hooks in `src/hooks/` | Every hook follows the same pattern: `useState` + `useEffect` + direct API call. There is no cache, no deduplication, no background refetch, no stale-time management. |
| Duplicate requests | Multiple components | When two components on the same page call `useMovies()` or `useWatchlistStatus(id)`, each fires a separate network request for identical data. |
| No optimistic updates | `src/contexts/movie-actions-context.tsx` | Toggling a watchlist or favorite requires a round-trip to the server before the UI updates. No optimistic feedback. |
| No standardized loading / error state | All hooks | Each hook uses its own `isLoading` and `error` pattern with no shared abstraction. Loading UX is inconsistent across pages. |

### 2.4 Build & Performance (🟠 High)

| Issue | Location | Description |
|---|---|---|
| Images unoptimized | `next.config.ts` line: `images.unoptimized: true` | Disables all Next.js image optimization (resizing, format conversion to WebP/AVIF, lazy loading). This directly harms Core Web Vitals LCP scores. |
| Build errors ignored | `next.config.ts` | Both `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` are set. TypeScript type errors and ESLint violations are silently discarded during production builds. |
| No package import optimization | `next.config.ts` | `lucide-react` and Radix UI packages are not listed under `experimental.optimizePackageImports`. The entire icon set is bundled even when only a few icons are used. |
| No env validation | Missing `src/env.ts` | Environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`) have no runtime validation. If a variable is undefined, the app silently breaks at runtime rather than failing fast at build time. |

### 2.5 TypeScript Rigor (🟡 Medium)

| Issue | Location | Description |
|---|---|---|
| 70+ `any` suppressions | Across `hooks/`, `contexts/`, `lib/` | `eslint-disable @typescript-eslint/no-explicit-any` comments appear on 70+ lines. This negates the value of TypeScript strict mode. |
| Untyped API responses | `src/hooks/` | Hooks cast API response data to `any` before using it, losing all type inference. |
| Missing domain types | `src/types/` | Only two declaration files exist (`videojs.d.ts`, `lucide-react.d.ts`). There are no shared `User`, `AuthSession`, `PaginatedResponse<T>` types. |

### 2.6 Error Handling & UX (🟡 Medium)

| Issue | Location | Description |
|---|---|---|
| No route-level error boundaries | `src/app/` | No `error.tsx` files exist in any route segment. An unhandled error in any page component crashes the entire application. |
| No route-level loading states | `src/app/` | No `loading.tsx` files exist. Next.js streaming and Suspense-based loading skeletons are unused. |
| Inconsistent skeleton usage | Components | Some pages show skeletons, others show nothing while loading. No standardized loading component contract. |

### 2.7 Testing (🟡 Medium)

| Issue | Location | Description |
|---|---|---|
| Zero test coverage | Entire project | No test runner, no test files, no testing libraries are present in `package.json`. |
| No component documentation | No Storybook | Components have no isolated documentation or visual testing. |

---

## 3. Target Architecture Overview

### 3.1 Layer Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│              app/ (pages, layouts, routes)               │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  React Component Tree                    │
│         components/ (ui, feature, layout)                │
└────────┬─────────────────┬──────────────────────────────┘
         │                 │
┌────────▼───────┐  ┌──────▼──────────────────────────────┐
│  Client State  │  │           Server State               │
│  (Zustand)     │  │        (TanStack Query v5)           │
│                │  │                                      │
│ auth.store     │  │  useQuery (GET)                      │
│ ui.store       │  │  useMutation (POST/PUT/DELETE)       │
│ video.store    │  │  optimistic updates                  │
└────────┬───────┘  └──────┬──────────────────────────────┘
         │                 │
┌────────▼─────────────────▼──────────────────────────────┐
│                    API Layer (Axios)                     │
│      src/lib/request.ts + src/apis/api/*.ts              │
│   (OpenAPI-generated clients — unchanged)                │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Auth Data Flow (Target)

```
User submits login form
        │
        ▼
FE calls Next.js Route Handler: POST /api/auth/login
        │
        ▼
Route Handler calls backend API → receives { accessToken, refreshToken, user }
        │
        ├── Sets HTTP-only cookie: accessToken (Secure, SameSite=Strict)
        ├── Sets HTTP-only cookie: refreshToken (Secure, SameSite=Strict)
        └── Returns { user } to client
                │
                ▼
        Zustand auth.store.login() called with user object
                │
                ▼
        auth.store persists user (not token) to sessionStorage
                │
                ▼
        All components reading useAuthStore() re-render reactively
                │
                ▼
        Next.js middleware reads cookie ✅ → /video route guard works
```

### 3.3 State Responsibility Matrix

| Concern | Solution | Store / Hook |
|---|---|---|
| Is user logged in? | Zustand | `useAuthStore(s => s.isAuthenticated)` |
| Current user profile | Zustand | `useAuthStore(s => s.user)` |
| Login modal open? | Zustand | `useUIStore(s => s.loginModalOpen)` |
| Register modal open? | Zustand | `useUIStore(s => s.registerModalOpen)` |
| Video resume position | Zustand | `useVideoStore(s => s.resumePosition)` |
| Movie list data | TanStack Query | `useMoviesQuery(filters)` |
| Movie detail data | TanStack Query | `useMovieDetailQuery(id)` |
| Watchlist status for content | TanStack Query | `useWatchlistStatusQuery(contentId)` |
| Toggle watchlist | TanStack Query Mutation | `useToggleWatchlistMutation(contentId)` |
| Reviews for content | TanStack Query | `useReviewsQuery(contentId, page)` |
| User profile data (API) | TanStack Query | `useProfileQuery()` |

---

## 4. New Dependencies

### 4.1 Production Dependencies to Add

| Package | Version | Purpose |
|---|---|---|
| `zustand` | `^5.x` | Client-side state management for auth, UI, and video state |
| `@tanstack/react-query` | `^5.x` | Server state management: caching, background refetch, optimistic updates |
| `react-error-boundary` | `^4.x` | Declarative error boundary components for route segments |
| `@t3-oss/env-nextjs` | `^0.x` | Zod-based environment variable validation at build/startup time |

### 4.2 Development Dependencies to Add

| Package | Version | Purpose |
|---|---|---|
| `@tanstack/react-query-devtools` | `^5.x` | In-browser query inspector (dev only, removed from production bundle automatically) |
| `vitest` | `^2.x` | Fast test runner compatible with Vite/Turbopack configuration |
| `@vitejs/plugin-react` | `^4.x` | React support plugin required by Vitest |
| `@testing-library/react` | `^16.x` | Component rendering and interaction utilities for tests |
| `@testing-library/user-event` | `^14.x` | Realistic user interaction simulation for tests |
| `@testing-library/jest-dom` | `^6.x` | Custom DOM matchers for assertions |
| `jsdom` | `^25.x` | DOM environment for Vitest |
| `msw` | `^2.x` | Mock Service Worker — intercepts API calls in tests |

### 4.3 Dependencies to Remove or Replace

| Current | Action | Reason |
|---|---|---|
| `window.dispatchEvent` pattern | Remove from all files | Replaced by Zustand store subscriptions |
| `localStorage` auth helpers in `lib/auth.ts` | Refactor entirely | Replaced by httpOnly cookies + Zustand |
| `src/contexts/movie-actions-context.tsx` | Break into 3 TanStack Query hooks | Monolithic context, replaced by composable hooks |
| `src/contexts/episode-review-context.tsx` | Convert to TanStack Query hook | Same pattern, same fix |

### 4.4 No Changes To

The following dependencies are appropriate for their role and should not be changed:
`axios`, `zod`, `react-hook-form`, `@hookform/resolvers`, `framer-motion`, `hls.js`, `video.js`, `embla-carousel-react`, `lucide-react`, `sonner`, `date-fns`, `recharts`, all `@radix-ui/*` packages, `next-themes`.

---

## 5. Phase 1 — Critical Fixes (Week 1–2)

Phase 1 addresses broken functionality and foundational issues that block everything else. No feature should be removed during this phase — all changes are internal refactors.

---

### Task 1.1 — Create Zustand `auth.store.ts`

**File to create:** `src/store/auth.store.ts`

**Description:**  
Create a Zustand store using the `subscribeWithSelector` middleware (following the `zustand-store-ts` skill pattern). Define two separate interfaces: `AuthState` for data properties and `AuthActions` for methods. Combine them into a single `AuthStore` type.

The state must include: the current `user` object (typed with a strict `User` interface, not `any`), a boolean `isAuthenticated`, and a boolean `isLoading` that is `true` only during the initial session hydration.

The actions must include:
- `login(credentials)` — calls the auth API, receives tokens and user data, sets `isAuthenticated` to `true`, saves the user object to the store. Does **not** write tokens to `localStorage`. Token persistence is handled by the Route Handler (Task 1.3).
- `loginWithGoogle(googleToken)` — same as `login` but for Google OAuth flow.
- `logout()` — clears user from store, sets `isAuthenticated` to `false`, calls the logout Route Handler to clear server-side cookies.
- `updateUser(partial)` — merges partial user data into the existing user object in store.
- `hydrateFromSession()` — reads the persisted user from `sessionStorage` on app mount to restore session across page refreshes.

Configure Zustand `persist` middleware to save only the `user` object (never the token) to `sessionStorage` under the key `cinemakatok-auth`. Use `partialize` to explicitly exclude any token fields from persistence.

Use individual selectors at call sites: `useAuthStore(s => s.user)`, not destructuring the entire store.

**Acceptance:** The store compiles with zero TypeScript errors, no `any` types, and exports both the store hook and the `AuthState`/`AuthActions` interfaces.

---

### Task 1.2 — Create Zustand `ui.store.ts`

**File to create:** `src/store/ui.store.ts`

**Description:**  
Create a Zustand store for global UI state using `subscribeWithSelector`.

State must include:
- `loginModalOpen: boolean` — whether the login modal is currently open
- `registerModalOpen: boolean` — whether the register modal is currently open

Actions must include:
- `openLoginModal()` — sets `loginModalOpen: true`
- `closeLoginModal()` — sets `loginModalOpen: false`
- `openRegisterModal()` — sets `registerModalOpen: true`
- `closeRegisterModal()` — sets `registerModalOpen: false`
- `switchToRegister()` — closes login modal and opens register modal atomically
- `switchToLogin()` — closes register modal and opens login modal atomically

This store does **not** need persistence (modal state is ephemeral).

**Migration work (same task):**  
After creating the store, find and replace all occurrences of `window.dispatchEvent(new Event("open-login-modal"))` across the codebase. There are at minimum 8 occurrences in: `movie-actions-context.tsx`, multiple hooks, and feature components. Each occurrence should be replaced with a call to `useUIStore.getState().openLoginModal()`. Similarly, replace all `window.addEventListener("open-login-modal", ...)` listeners in `login-modal.tsx` and `register-modal.tsx` with `useUIStore` subscriptions.

**Acceptance:** Zero occurrences of `window.dispatchEvent` remain in the codebase for auth/modal events. The login and register modals open and close correctly through the store.

---

### Task 1.3 — Create Next.js Route Handlers for Auth

**Files to create:**  
- `src/app/api/auth/login/route.ts`  
- `src/app/api/auth/login-google/route.ts`  
- `src/app/api/auth/logout/route.ts`  
- `src/app/api/auth/refresh/route.ts`

**Description:**  
These are Next.js Route Handlers (not API routes in the Pages Router sense) that act as a secure proxy between the browser and the backend auth endpoints. Their sole purpose is to handle tokens safely.

**`/api/auth/login/route.ts`:**  
Receives `{ email, password }` from the client in the request body. Forwards them to the backend `POST /auth/login` endpoint. On success, extracts `accessToken` and `refreshToken` from the backend response. Sets both as `HttpOnly`, `Secure`, `SameSite=Strict` cookies in the response using the `cookies()` API from `next/headers`. Returns only the `user` object (no tokens) to the client. On failure, returns the error with the appropriate HTTP status code.

**`/api/auth/login-google/route.ts`:**  
Same pattern as login, but receives a `googleToken` and forwards it to the backend's Google OAuth endpoint.

**`/api/auth/logout/route.ts`:**  
Clears the `accessToken` and `refreshToken` cookies by setting them with `maxAge: 0`. Returns a success response.

**`/api/auth/refresh/route.ts`:**  
Reads the `refreshToken` from cookies (not from the request body — the client never holds the refresh token). Calls the backend refresh endpoint. On success, sets the new `accessToken` cookie. Returns the new `accessToken` to the client for use in the Axios instance until the next refresh.

**Key constraint:** No token value should ever appear in a response body that the browser JavaScript can read. Tokens only travel in `Set-Cookie` headers with `HttpOnly` flag.

**Acceptance:** Logging in sets two visible cookies in the browser's DevTools Application tab (with `HttpOnly` flag checked). No token string is visible in the network response body.

---

### Task 1.4 — Refactor `src/lib/auth.ts` and `src/lib/request.ts`

**Files to modify:** `src/lib/auth.ts`, `src/lib/request.ts`

**Description:**  
After Task 1.1 and 1.3 are complete, the `localStorage` helpers in `auth.ts` are no longer needed for their primary purpose. Refactor this file:

- Remove `saveAuthData()`, `clearAuthData()`, `getAccessToken()`, `setAuthToken()`, `removeAuthToken()`, `getAuthToken()`.
- Keep `isAuthenticated()` but rewrite it to read from the Zustand auth store instead of `localStorage`: import `useAuthStore` and return `useAuthStore.getState().isAuthenticated`.
- Keep `getCurrentUser()` similarly rewritten to read from the Zustand store.
- Remove `updateUserInLocalStorage()` — this is replaced by `useAuthStore.getState().updateUser(partial)`.

In `src/lib/request.ts`, update the Axios request interceptor:
- Remove the `localStorage.getItem("accessToken")` call.
- The interceptor should no longer attach `Authorization` headers manually. Instead, since tokens are now in cookies and the instance already has `withCredentials: true`, the browser will attach the cookie automatically for same-origin requests. For cross-origin requests to the backend, the bearer token must still be attached — to achieve this, the interceptor should call a helper that reads the access token from a memory variable (a module-level variable in `request.ts` that is set once when the Route Handler refresh endpoint is called).
- Update the 401 retry logic to call the `/api/auth/refresh` Route Handler instead of the backend refresh endpoint directly.

**Acceptance:** No file in the project imports from `lib/auth.ts` for token management. All auth reads go through the Zustand store.

---

### Task 1.5 — Fix `src/middleware.ts`

**File to modify:** `src/middleware.ts`

**Description:**  
After Tasks 1.1–1.4 are complete, the middleware will be able to read the real `accessToken` cookie (because it is now set as an actual cookie in Task 1.3). Update the middleware to:

- Expand `protectedRoutes` to include `/profile` in addition to `/video`. The `/profile` route currently relies on the `ProtectedRoute` component for client-side-only protection; it should also be protected server-side.
- Remove the comment explaining that the middleware cannot access tokens because they are in `localStorage`. After this task, that limitation no longer applies.
- Add a check: if the route is protected and there is no `accessToken` cookie, redirect to `/` with a search parameter `?redirect=<original-path>` so that after login the user is returned to their intended destination.
- Consider adding `refreshToken` presence as a secondary check: if `accessToken` is missing but `refreshToken` is present, redirect to the refresh Route Handler which will issue a new access token, then redirect back to the original page.

**Acceptance:** Navigating directly to `/video` in a new incognito browser tab (with no cookies) redirects to the home page. Navigating to `/video` while authenticated allows access.

---

### Task 1.6 — Refactor `src/hooks/use-auth.ts`

**File to modify:** `src/hooks/use-auth.ts`

**Description:**  
The existing `use-auth.ts` hook manages its own `useState` for auth status and syncs via `window.addEventListener`. This entire file should be rewritten as a thin wrapper over the Zustand auth store.

The new hook should:
- Read `isAuthenticated`, `user`, and `isLoading` directly from `useAuthStore`.
- Expose a `logout()` function that calls `useAuthStore.getState().logout()`.
- Expose a `requireAuth(redirectUrl)` function that uses `useRouter` to redirect if not authenticated.
- Remove all `window.addEventListener` / `window.removeEventListener` calls.
- Remove all internal `useState` and `useEffect` for auth state — those now live in the store.
- Remove the `checkBannedStatus` function from the hook. Move this logic into the `auth.store.ts` `login()` action, or into a TanStack Query `useProfileQuery` with a `select` that checks the `isBanned` field.

The hook's public API (`isAuthenticated`, `user`, `isLoading`, `logout`, `requireAuth`) should remain identical so existing consumers require minimal changes.

**Acceptance:** `use-auth.ts` no longer contains `useState`, `useEffect`, or `window.addEventListener`. All consumers of `useAuth()` continue to work without change.

---

### Task 1.7 — Fix `next.config.ts`

**File to modify:** `next.config.ts`

**Description:**  
Apply the following changes to the Next.js configuration:

**Remove** the following options that suppress errors:
- `typescript.ignoreBuildErrors: true` — this must be removed so TypeScript errors fail the build.
- `eslint.ignoreDuringBuilds: true` — this must be removed so ESLint violations fail the build.

**Remove** the following option that disables optimization:
- `images.unoptimized: true` — removing this re-enables Next.js image processing.

**Add** `images.remotePatterns` with entries for every external image host the app uses. Review all `<img>` and `<Image>` tags in the codebase to identify hostnames. Likely entries include Cloudinary domains and any TMDB/CDN domains used for movie posters and profile pictures.

**Add** `images.formats: ['image/avif', 'image/webp']` to enable modern image formats.

**Add** `experimental.optimizePackageImports` with the following packages: `lucide-react`, and any Radix UI packages that are used heavily. This enables Next.js to only include the specific icons/components imported rather than the entire library.

**Note:** After removing `ignoreBuildErrors`, run the TypeScript compiler (`tsc --noEmit`) to get a full list of type errors. These errors are pre-existing and must be tracked. They do not all need to be fixed in Phase 1, but the suppression must be removed and a separate sub-task created for each error category.

**Acceptance:** `next build` runs without the `ignoreBuildErrors` or `ignoreDuringBuilds` flags. The build may fail on TypeScript errors after this change — that is expected and those errors are tracked in Task 3.4.

---

### Task 1.8 — Add Environment Variable Validation

**File to create:** `src/env.ts`

**Description:**  
Create a centralized environment variable validation module using `@t3-oss/env-nextjs` with `zod` (already in dependencies).

Define a `server` schema for variables that should never be exposed to the client. Define a `client` schema for all `NEXT_PUBLIC_*` variables. The client schema must include at minimum:
- `NEXT_PUBLIC_API_URL` — validated as a non-empty URL string.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — validated as a non-empty string.

Map each variable in `runtimeEnv` to its `process.env` equivalent.

After creating this file, replace all direct `process.env.NEXT_PUBLIC_API_URL` references throughout the codebase with imports from `src/env.ts`. Do the same for `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

The validation runs at build time and startup. If a required variable is missing, the application will throw a clear error immediately rather than silently producing `undefined` values at runtime.

**Acceptance:** Temporarily removing `NEXT_PUBLIC_API_URL` from the environment causes the build/startup to fail with a descriptive Zod validation error. Restoring it allows the build to succeed.

---

### Task 1.9 — Create Store Barrel File

**File to create:** `src/store/index.ts`

**Description:**  
Create a barrel export file that re-exports all stores from a single entry point. This makes imports clean (`import { useAuthStore } from '@/store'` instead of `import { useAuthStore } from '@/store/auth.store'`).

Also create a `hydrateStores()` function that is called once in the root layout to initialize stores from their persisted state (e.g., calling `auth.store`'s `hydrateFromSession()` on mount).

**Acceptance:** All store imports in the codebase use `@/store` as the import path.

---

## 6. Phase 2 — State & Data Migration (Week 3–4)

Phase 2 replaces all raw `useState` + `useEffect` data-fetching hooks with TanStack Query. No new features are added; the goal is the same data displayed with significantly better caching, loading, and error behavior.

---

### Task 2.1 — Setup TanStack Query Provider

**Files to create/modify:** `src/lib/query-client.ts`, `src/app/layout.tsx`

**Description:**  
Create a `QueryClient` instance in `src/lib/query-client.ts` with production-appropriate default options:

- Default `staleTime` of 60 seconds (data is considered fresh for 1 minute and will not be refetched unnecessarily).
- `retry` logic that returns `false` for 404 and 403 errors (no point retrying a "not found" or "forbidden"), and retries up to 2 times for other errors.
- A global `onError` handler for mutations that opens the login modal (via `useUIStore.getState().openLoginModal()`) when a 401 error is returned.

Wrap the application in `QueryClientProvider` inside `src/app/layout.tsx`. This provider must wrap the `GoogleOAuthProvider` so all child components can access both.

Add `ReactQueryDevtools` inside the provider but only render it when `process.env.NODE_ENV === 'development'`. The devtools are automatically excluded from production bundles by TanStack Query when unused.

**Acceptance:** Opening the app in development mode shows the TanStack Query devtools floating button in the bottom-right corner. No queries or mutations are visible yet (they will appear in Task 2.2+).

---

### Task 2.2 — Create Query Key Factory

**File to create:** `src/lib/query-keys.ts`

**Description:**  
Create a centralized query key factory object. This is the single source of truth for all TanStack Query cache keys in the application. Consistent keys are critical for correct cache invalidation.

The factory must cover the following domains, each as a nested object with methods that return typed `const` arrays:

- **movies** — `all`, `lists()`, `list(filters)`, `detail(id)`, `recommendations(id)`, `cast(id)`, `reviews(id, page)`
- **tvSeries** — `all`, `lists()`, `list(filters)`, `detail(id)`, `episodes(id, season)`, `reviews(id, episodeId, page)`
- **watchlist** — `all`, `status(contentId)`
- **favorites** — `all`, `status(contentId)`
- **reviews** — `forContent(contentId, page)`, `userReview(contentId, userId)`
- **auth** — `profile()`
- **person** — `detail(id)`, `filmography(id)`
- **blog** — `all`, `list(page)`, `detail(id)`
- **categories** — `all`

Every method must return a `const` tuple (using `as const` assertion) so TypeScript can infer the literal types.

**Acceptance:** The file compiles with zero TypeScript errors. No literal string query keys appear anywhere else in the codebase — all query keys must come from this factory.

---

### Task 2.3 — Migrate Data Hooks to TanStack Query

**Files to modify:** All 23 files in `src/hooks/`, the two Context files in `src/contexts/`

**Description:**  
This is the largest migration task. Each existing hook must be rewritten to use `useQuery` (for data reads) or `useMutation` (for data writes). The existing hook file names and export names should be preserved where possible so that consumer components require minimal changes.

The migration work for each hook follows the same pattern:
1. Remove `useState` for `data`, `isLoading`, `error`.
2. Remove `useEffect` that fires the API call.
3. Replace with `useQuery({ queryKey: queryKeys.X.Y(params), queryFn: () => apiCall(params), ... })`.
4. Derive `isLoading`, `data`, `error` from the `useQuery` return value.
5. Add appropriate `staleTime` and `enabled` options.

**Hooks requiring special attention:**

**`use-watchlist.ts` and `use-user-watchlist.ts`:**  
Split into two exports: `useWatchlistStatusQuery(contentId)` for reading status, and `useToggleWatchlistMutation(contentId)` for writing. The mutation must implement optimistic updates: on `onMutate`, immediately update the cache for `queryKeys.watchlist.status(contentId)` to reflect the expected new state, save the previous value as a rollback snapshot, and on `onError` restore the previous value. On `onSettled`, invalidate `queryKeys.watchlist.all`.

**`use-reviews.ts` and `use-reviews-management.ts`:**  
These should become: `useReviewsQuery(contentId, page)` for paginated reads, and `useSubmitReviewMutation(contentId)` / `useDeleteReviewMutation(contentId)` for writes. Mutations should invalidate `queryKeys.reviews.forContent(contentId)` on success.

**`use-movies.ts`:**  
Should become `useMoviesQuery(filters?)` with `staleTime: 5 * 60 * 1000` (5 minutes, since movie lists don't change frequently).

**`use-tvseries.ts`:**  
Should become `useTV SeriesQuery(filters?)` with similar stale time.

**`use-profile.ts`:**  
Should become `useProfileQuery()` keyed with `queryKeys.auth.profile()`. On success, sync the returned profile data with the Zustand auth store by calling `updateUser()` from within the `onSuccess` callback.

**`contexts/movie-actions-context.tsx` (the 433-line file):**  
After migrating `use-watchlist.ts`, `use-reviews.ts`, and `use-favorites.ts` to TanStack Query, this Context file can be dramatically reduced or removed entirely. Each of the three domain areas it manages (favorites, watchlist, reviews) is now a self-contained hook. Components that currently consume `useActions()` from this context should be updated to call the domain-specific hooks directly. After this migration, the Context file and its `ActionsProvider` wrapper can be deleted.

**`contexts/episode-review-context.tsx`:**  
Apply the same treatment as the movie actions context. Migrate all state to TanStack Query hooks, then remove the context file.

**Acceptance per hook:**
- Zero `useState` for server data.
- Zero `useEffect` for data fetching.
- The TanStack Query devtools show the query appearing in the cache when the hook's component mounts.
- Navigating away from a page and back does not show a loading spinner if the data is still within `staleTime`.

---

### Task 2.4 — Create `video.store.ts`

**File to create:** `src/store/video.store.ts`

**Description:**  
Create a Zustand store to manage video player state across navigation. Currently, when a user navigates away from a video page, their playback position is lost.

State must include:
- `contentId: string | null` — the ID of the movie or TV series being watched.
- `episodeId: string | null` — null for movies, the episode ID for TV series.
- `contentType: 'movie' | 'tv_series' | null`
- `resumePosition: number` — current playback position in seconds. Updated continuously during playback.
- `quality: 'auto' | '1080p' | '720p' | '480p'` — user's selected quality preference.
- `hasAccess: boolean` — whether the user's subscription allows access to this content.
- `isMuted: boolean` — user's mute preference.
- `volume: number` — user's volume level (0–1).

Actions must include:
- `setContent(contentId, episodeId, contentType)` — sets the current content being watched.
- `updateProgress(seconds)` — updates `resumePosition`. This is called frequently (on `timeupdate` events), so it must use Zustand's `set` directly without triggering a React re-render for every update (use a ref in the component for the display, only sync to store at intervals or on pause/unmount).
- `setQuality(quality)` — persists the user's quality preference.
- `setVolume(volume)` — persists volume preference.
- `clearContent()` — resets content-specific state when navigating away from the player.

Configure `persist` middleware to save `quality`, `volume`, and `isMuted` to `localStorage` (these are device preferences). Save `resumePosition` and `contentId` to `sessionStorage` (valid for the current tab session). Do **not** persist `hasAccess` (always re-verified from the server).

Additionally, integrate the `use-watch-progress.ts` hook with this store. When `updateProgress` is called, the store should also debounce-sync the position back to the backend via the existing `watchProgress` API (the `use-watch-progress.ts` hook's logic should be absorbed into the store's `updateProgress` action or called from within the video player component on a debounced schedule).

**Acceptance:** Refreshing the page while watching a movie returns to the last known playback position. Quality preference persists across sessions.

---

### Task 2.5 — Add `loading.tsx` to All Route Segments

**Files to create:** One `loading.tsx` per route segment in `src/app/`

**Description:**  
Create `loading.tsx` files for every page route. These files are automatically used by Next.js as Suspense boundaries during navigation — they display while the page's server component fetches its data.

Route segments requiring `loading.tsx`:
- `src/app/loading.tsx` — homepage loading
- `src/app/movies/loading.tsx`
- `src/app/movies/[id]/loading.tsx`
- `src/app/movies/type/[type]/loading.tsx`
- `src/app/movies/type/category/[slugOrId]/loading.tsx`
- `src/app/tv_series/loading.tsx`
- `src/app/tv_series/[id]/loading.tsx`
- `src/app/tv_series/[id]/episode/[slugOrId]/loading.tsx`
- `src/app/tv_series/type/[type]/loading.tsx`
- `src/app/tv_series/type/category/[slugOrId]/loading.tsx`
- `src/app/person/[id]/loading.tsx`
- `src/app/profile/loading.tsx`
- `src/app/blog/loading.tsx`
- `src/app/blog/[id]/loading.tsx`

Each `loading.tsx` should export a component that renders an appropriate skeleton layout. The skeleton layout should visually match the structure of the actual page (e.g., the movie detail loading should show a large hero skeleton + content sections skeleton, not a generic spinner). Reuse the existing `SkeletonCard` component and create additional skeleton components as needed.

**Acceptance:** Navigating to a movie detail page on a throttled network connection shows the skeleton layout for 500ms+ before the content appears.

---

### Task 2.6 — Add `error.tsx` to All Route Segments

**Files to create:** `error.tsx` files for key route segments; one global `src/app/error.tsx`

**Description:**  
Create `error.tsx` files that catch rendering errors in their segment and display a recoverable error state instead of crashing the entire application.

Route segments requiring `error.tsx`:
- `src/app/error.tsx` — global fallback
- `src/app/movies/error.tsx`
- `src/app/movies/[id]/error.tsx`
- `src/app/tv_series/error.tsx`
- `src/app/tv_series/[id]/error.tsx`
- `src/app/profile/error.tsx`

Each `error.tsx` must be a `'use client'` component (required by Next.js for error boundaries). It receives `error: Error` and `reset: () => void` props. The component should:
- Display a user-friendly error message (not a raw stack trace).
- Include a "Try again" button that calls `reset()` to attempt re-rendering.
- Include a link to navigate to a safe page (e.g., the homepage).
- For development mode only, show the full error message and stack trace.

`react-error-boundary` can be used inside these files for additional granularity within a segment (e.g., wrapping only the reviews section so that a reviews API error doesn't crash the entire movie detail page).

**Acceptance:** Throwing an error in a movie detail component shows the movies error boundary UI, not a white screen. The rest of the application (header, navigation) remains functional.

---

## 7. Phase 3 — Quality, Testing & DX (Week 5–6)

Phase 3 hardens the codebase with testing, eliminates TypeScript debt, and improves the developer workflow.

---

### Task 3.1 — Setup Vitest and Testing Infrastructure

**Files to create:** `vitest.config.ts`, `src/tests/setup.ts`, `src/tests/mocks/handlers.ts`, `src/tests/mocks/server.ts`

**Description:**  
Configure Vitest as the test runner for unit and component tests.

**`vitest.config.ts`:**  
Configure the test environment as `jsdom`, enable global test utilities (`describe`, `it`, `expect`, `vi`), point to the setup file, configure path aliases to match `tsconfig.json` (`@/*` → `./src/*`), enable coverage reporting with `v8` provider, and set a minimum line coverage threshold of 60%.

**`src/tests/setup.ts`:**  
Import `@testing-library/jest-dom` to extend Vitest's `expect` with DOM matchers. Start the MSW server (`server.listen()`) before all tests, reset handlers between tests (`server.resetHandlers()`), and close the server after all tests (`server.close()`).

**`src/tests/mocks/handlers.ts`:**  
Define MSW request handlers for the most frequently called API endpoints. At minimum, create handlers for:
- `GET /movies` — returns a mock list of 3 movie objects
- `GET /movies/:id` — returns a mock movie detail object
- `POST /auth/login` — returns a mock login success response with a user object
- `GET /watchlist/check` — returns a mock watchlist status
- `GET /reviews` — returns a mock paginated reviews response

Mock data should be defined in `src/tests/mocks/data.ts` and reused across all handlers.

**`src/tests/mocks/server.ts`:**  
Create the MSW server instance using `setupServer(...handlers)`.

**Acceptance:** Running `npm run test` (or `npx vitest`) produces a passing test run with the setup file recognized. The coverage report is generated at `coverage/`.

---

### Task 3.2 — Write Store Unit Tests

**Files to create:** `src/store/auth.store.test.ts`, `src/store/ui.store.test.ts`

**Description:**  
Write unit tests for both Zustand stores. Tests should import the store and call actions directly, without rendering any React components.

**`auth.store.test.ts`** must cover:
- Initial state: `isAuthenticated` is `false`, `user` is `null`, `isLoading` is `true`.
- After `login()` succeeds: `isAuthenticated` becomes `true`, `user` is set to the returned user object.
- After `logout()`: `isAuthenticated` becomes `false`, `user` becomes `null`.
- After `updateUser({ name: 'New Name' })`: the user object is updated with the new name, other fields are preserved.
- After `hydrateFromSession()` with a valid user in `sessionStorage`: `isAuthenticated` becomes `true` and `user` matches the stored data.

**`ui.store.test.ts`** must cover:
- Initial state: both modals are `false`.
- After `openLoginModal()`: `loginModalOpen` is `true`.
- After `closeLoginModal()`: `loginModalOpen` is `false`.
- After `switchToRegister()`: `loginModalOpen` is `false` and `registerModalOpen` is `true`.
- After `switchToLogin()`: `registerModalOpen` is `false` and `loginModalOpen` is `true`.

Between each test, reset the store to its initial state using Zustand's `setState` or by re-creating the store. Do not share mutable state between tests.

**Acceptance:** `npm run test` runs both files and all tests pass. Coverage for `auth.store.ts` and `ui.store.ts` is 100%.

---

### Task 3.3 — Write Component Tests for Critical UI

**Files to create:**  
- `src/tests/components/login-modal.test.tsx`
- `src/tests/components/watchlist-button.test.tsx`
- `src/tests/components/movie-card.test.tsx`

**Description:**  

**`login-modal.test.tsx`:**  
Render the `LoginModal` component. Assert that when `loginModalOpen` is `false` in `useUIStore`, the modal is not visible. Assert that when `loginModalOpen` is `true`, the modal renders with email and password inputs and a submit button. Simulate filling in valid credentials and submitting the form. Assert that the `login` action in `useAuthStore` was called with the correct credentials. Use MSW to mock the login API response.

**`watchlist-button.test.tsx`:**  
Render the `WatchlistButton` component with a mock `contentId`. Assert that when the user is not authenticated, clicking the button calls `openLoginModal()`. Assert that when the user is authenticated and the content is not in the watchlist, clicking the button triggers the add-to-watchlist mutation. Assert that the button shows an optimistic "added" state immediately after clicking (before the API call resolves). Use MSW to mock the watchlist API responses.

**`movie-card.test.tsx`:**  
Render a `MovieCard` component with mock movie data. Assert that the movie title, poster image, and rating are displayed. Assert that the card is a link to the correct movie detail URL. Assert that the component matches its accessibility role (must be a `link` or wrapped in a semantic element).

**Acceptance:** All three test files pass. Each test file covers at least 3 test cases. No test uses `any` types in test code.

---

### Task 3.4 — Fix All TypeScript `any` Violations

**Files to modify:** All files containing `@typescript-eslint/no-explicit-any` suppression comments or implicit `any`

**Description:**  
With `next.config.ts` now enforcing TypeScript errors at build time (from Task 1.7), all remaining `any` types must be resolved. This task systematically addresses them.

For each occurrence, the correct fix depends on context:
- API response data: Replace `any` with the corresponding `API.*` type from `src/apis/api/typings.d.ts`. For example, `response.data.data` in a movie hook should be typed as `API.MovieDto`.
- Event handler parameters: Replace `any` with `React.ChangeEvent<HTMLInputElement>` or the appropriate event type.
- Catch block errors: Replace `catch (err: any)` with `catch (err: unknown)` and use a type guard (`err instanceof Error`, or check `err` against `AxiosError`) before accessing properties.
- Generic utility functions: Add proper generic type parameters instead of using `any`.

Additionally, create shared types in `src/types/`:
- `src/types/auth.ts` — define `User`, `LoginCredentials`, `LoginResponse`, `AuthSession` interfaces.
- `src/types/api.ts` — define `PaginatedResponse<T>`, `ApiResponse<T>`, `ApiError` interfaces that wrap the generated types with consistent shapes.
- `src/types/video.ts` — define `VideoQuality`, `VideoState` types for the video player store.

**Acceptance:** Running `tsc --noEmit` produces zero errors. No `@typescript-eslint/no-explicit-any` suppression comments remain in the codebase. ESLint runs clean with `no-explicit-any: error`.

---

### Task 3.5 — Improve ESLint Configuration

**File to modify:** `eslint.config.mjs`

**Description:**  
Update the flat ESLint config to enforce stricter TypeScript and React rules.

Rules to add:
- `@typescript-eslint/no-explicit-any: error` — fails CI on any `any` usage.
- `@typescript-eslint/no-unsafe-assignment: warn` — warns when assigning from an `any`-typed source.
- `@typescript-eslint/prefer-nullish-coalescing: warn` — prefer `??` over `|| ` for nullable checks.
- `@typescript-eslint/no-floating-promises: error` — fails if a Promise is not awaited or `.catch`-handled.
- `react/no-array-index-key: warn` — warns when array index is used as a React key.
- `react-hooks/exhaustive-deps: error` — fails if `useEffect` / `useCallback` deps are missing.

Add `vitest` globals to the ESLint environment so that `describe`, `it`, `expect`, and `vi` are recognized in test files without needing imports.

**Acceptance:** `npm run lint` fails with the above rules on violations. No new suppressions are added to make lint pass — violations must be fixed in the code.

---

### Task 3.6 — Add `npm run test` and `npm run test:coverage` Scripts

**File to modify:** `package.json`

**Description:**  
Add the following scripts to `package.json`:
- `"test": "vitest"` — runs all tests in watch mode during development.
- `"test:run": "vitest run"` — runs all tests once (for CI).
- `"test:coverage": "vitest run --coverage"` — runs all tests and generates coverage report.
- `"type-check": "tsc --noEmit"` — runs the TypeScript compiler without emitting files to check for type errors.

Also add a `"lint:fix"` script that runs ESLint with the `--fix` flag for auto-fixable issues.

**Acceptance:** All four scripts run successfully. `test:coverage` generates a `coverage/index.html` report that shows at least 60% line coverage for the store files.

---

### Task 3.7 — Bundle Optimization Audit

**Files to modify:** `next.config.ts` (additions), potentially `package.json`

**Description:**  
Conduct a bundle size audit and implement optimizations.

**Step 1 — Measure baseline.** Run `next build` and examine the build output for chunk sizes. Note the largest client-side chunks.

**Step 2 — Verify `optimizePackageImports` impact.** After Task 1.7 added `optimizePackageImports` for `lucide-react`, confirm in the build output that the icon-related chunk has decreased.

**Step 3 — Audit dynamic imports.** The video player components (`custom-video-player.tsx`, `movie-video-player.tsx`, `tv-series-player.tsx`) import `video.js` and `hls.js` which are large libraries. These should be loaded with `next/dynamic` with `ssr: false` so they are not included in the server bundle and are only loaded when the video player actually mounts. If this is not already the case, wrap the video player components in `dynamic()` calls at their page-level import sites.

**Step 4 — Audit `recharts`.** The `recharts` library (for charts in the analytics/profile section) is imported somewhere in the codebase. Verify it is code-split. If not, wrap the chart components in `dynamic()`.

**Step 5 — Review `framer-motion` usage.** `framer-motion` adds ~40KB. Verify that only the specific motion components actually used (`motion.div`, etc.) are imported, not the entire library.

**Acceptance:** The production build output shows no single page chunk exceeds 300KB gzipped. The video player is not present in the initial page bundle (confirm via build output that `video.js` appears only in a lazy-loaded chunk).

---

## 8. Folder Structure (Target)

After all phases are complete, the `src/` directory should look like this:

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts          ← NEW (Task 1.3)
│   │       ├── login-google/route.ts   ← NEW (Task 1.3)
│   │       ├── logout/route.ts         ← NEW (Task 1.3)
│   │       └── refresh/route.ts        ← NEW (Task 1.3)
│   ├── blog/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── error.tsx                   ← NEW (Task 2.6)
│   │   ├── loading.tsx                 ← NEW (Task 2.5)
│   │   └── page.tsx
│   ├── movies/
│   │   ├── [id]/
│   │   │   ├── error.tsx               ← NEW (Task 2.6)
│   │   │   ├── loading.tsx             ← NEW (Task 2.5)
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── type/[type]/
│   │   │   ├── loading.tsx             ← NEW (Task 2.5)
│   │   │   └── page.tsx
│   │   ├── type/category/[slugOrId]/
│   │   │   ├── loading.tsx             ← NEW (Task 2.5)
│   │   │   └── page.tsx
│   │   ├── error.tsx                   ← NEW (Task 2.6)
│   │   ├── loading.tsx                 ← NEW (Task 2.5)
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── tv_series/                      ← (same pattern as movies)
│   ├── person/[id]/
│   │   ├── loading.tsx                 ← NEW (Task 2.5)
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── profile/
│   │   ├── [[...tab]]/page.tsx
│   │   ├── error.tsx                   ← NEW (Task 2.6)
│   │   ├── layout.tsx
│   │   └── loading.tsx                 ← NEW (Task 2.5)
│   ├── error.tsx                       ← NEW (Task 2.6, global)
│   ├── globals.css
│   ├── layout.tsx                      ← MODIFIED (Task 2.1 — add QueryClientProvider)
│   ├── not-found.tsx
│   └── page.tsx
│
├── apis/api/                           ← UNCHANGED (OpenAPI generated)
│
├── components/                         ← UNCHANGED structure
│   ├── ui/
│   ├── movie/
│   ├── tv_serie/
│   ├── person/
│   ├── profile/
│   └── blog/
│
├── contexts/                           ← DELETED after Phase 2
│   ├── episode-review-context.tsx      ← DELETED (Task 2.3)
│   └── movie-actions-context.tsx       ← DELETED (Task 2.3)
│
├── hooks/                              ← MODIFIED (all hooks migrated to TQ)
│   ├── use-auth.ts                     ← REFACTORED (Task 1.6)
│   ├── use-movies.ts                   ← MIGRATED to useQuery (Task 2.3)
│   ├── use-tvseries.ts                 ← MIGRATED to useQuery (Task 2.3)
│   ├── use-watchlist.ts                ← MIGRATED to useQuery + useMutation (Task 2.3)
│   ├── use-reviews.ts                  ← MIGRATED to useQuery + useMutation (Task 2.3)
│   └── ... (all other hooks migrated)
│
├── lib/
│   ├── api-error-handler.ts            ← UNCHANGED
│   ├── auth.ts                         ← REFACTORED (Task 1.4)
│   ├── query-client.ts                 ← NEW (Task 2.1)
│   ├── query-keys.ts                   ← NEW (Task 2.2)
│   ├── request.ts                      ← MODIFIED (Task 1.4)
│   └── utils.ts                        ← UNCHANGED
│
├── middleware.ts                       ← MODIFIED (Task 1.5)
│
├── store/
│   ├── auth.store.ts                   ← NEW (Task 1.1)
│   ├── ui.store.ts                     ← NEW (Task 1.2)
│   ├── video.store.ts                  ← NEW (Task 2.4)
│   └── index.ts                        ← NEW (Task 1.9)
│
├── tests/                              ← NEW (Task 3.1)
│   ├── components/
│   │   ├── login-modal.test.tsx
│   │   ├── movie-card.test.tsx
│   │   └── watchlist-button.test.tsx
│   ├── mocks/
│   │   ├── data.ts
│   │   ├── handlers.ts
│   │   └── server.ts
│   ├── store/
│   │   ├── auth.store.test.ts
│   │   └── ui.store.test.ts
│   └── setup.ts
│
├── types/
│   ├── auth.ts                         ← NEW (Task 3.4)
│   ├── api.ts                          ← NEW (Task 3.4)
│   ├── video.ts                        ← NEW (Task 3.4)
│   ├── lucide-react.d.ts               ← UNCHANGED
│   └── videojs.d.ts                    ← UNCHANGED
│
└── env.ts                              ← NEW (Task 1.8)
```

---

## 9. Non-Functional Requirements

| Requirement | Target | Measurement |
|---|---|---|
| Core Web Vitals — LCP | < 2.5 seconds | Lighthouse CI on production build |
| Core Web Vitals — CLS | < 0.1 | Lighthouse CI |
| First Contentful Paint | < 1.5 seconds | Lighthouse CI |
| Bundle size (initial JS) | < 300KB gzipped per route | `next build` output |
| Test coverage | ≥ 60% line coverage | `vitest --coverage` report |
| TypeScript errors at build | 0 | `tsc --noEmit` in CI |
| ESLint violations at build | 0 | `eslint` in CI |
| Auth route guard reliability | `/video` redirects 100% of unauthenticated requests | Manual test + middleware unit test |
| Cache hit rate | Same-page navigations within `staleTime` show zero new network requests for data | TanStack Query devtools |
| No `localStorage` token exposure | No token found in `localStorage` after login | Browser DevTools manual check |

---

## 10. Decision Log

| ID | Decision | Alternatives Considered | Why This Was Chosen |
|---|---|---|---|
| D1 | **Zustand v5 for client state** | Redux Toolkit (more boilerplate), Jotai (too atomic for auth use case) | Minimal API, works with React 19 concurrent features, no provider required, composable slices via `subscribeWithSelector`. Fits the project's scope without over-engineering. |
| D2 | **TanStack Query v5 for server state** | SWR (simpler but weaker mutation API), Axios + manual hooks (current state) | TanStack Query has the best optimistic update API, per-query stale time control, and automatic background refetch. Eliminates 18 near-identical hook implementations. |
| D3 | **HttpOnly cookies for tokens** | Keep in `localStorage` (current — broken), `sessionStorage`, `js-accessible cookie` | HttpOnly is the only option that (a) makes the Next.js middleware actually work, and (b) protects tokens from XSS. All other options either break the middleware or expose tokens to JavaScript. |
| D4 | **Next.js Route Handler as auth proxy** | Direct frontend-to-backend auth calls | Next.js Route Handlers run on the server and can set `HttpOnly` cookies via `Set-Cookie` headers. The browser's JavaScript cannot set `HttpOnly` cookies directly. This architecture is required by D3. |
| D5 | **Incremental phased migration** | Big-bang rewrite of all hooks at once | The app must remain functional throughout the migration. Phasing allows each change to be tested in isolation. Phase 1 fixes breaking issues, Phase 2 improves the patterns, Phase 3 adds quality. |
| D6 | **Vitest over Jest** | Jest + babel-jest, Playwright-only | Vitest shares configuration with Vite/Turbopack and requires zero additional setup for TypeScript and path aliases. Jest requires separate Babel/SWC config that conflicts with Turbopack. |
| D7 | **MSW v2 for API mocking in tests** | Axios mock adapter, `jest.mock()` | MSW intercepts at the network level (not the module level), making tests more realistic. Handlers are shared between test and development environments. |
| D8 | **Keep Axios (do not migrate to fetch)** | Native `fetch`, `ky` (smaller) | The OpenAPI-generated clients in `src/apis/api/` are hardwired to the Axios `request()` function signature. Migrating to native fetch would require regenerating or manually rewriting all 22 API modules. Cost exceeds benefit. |
| D9 | **`@t3-oss/env-nextjs` for env validation** | Manual `process.env` checks, `dotenv-safe` | T3 env is the community standard for Next.js Zod env validation. It integrates with Next.js build pipeline to fail the build on invalid env, and its API is familiar to the Next.js community. |
| D10 | **Delete `movie-actions-context.tsx` after migration** | Keep context, just use TQ internally | The context becomes a pure pass-through with no logic after TQ migration. Keeping it adds indirection with no benefit. Direct hook calls in components are simpler and more tree-shakeable. |

---

## 11. Acceptance Criteria

### Phase 1 Complete When:
- [ ] Navigating to `/video` in an incognito window with no cookies redirects to the homepage.
- [ ] Logging in sets `accessToken` as an HttpOnly cookie visible in browser DevTools.
- [ ] No token string appears in `localStorage` after login.
- [ ] All `window.dispatchEvent("open-login-modal")` calls have been removed — clicking "Login required" actions opens the modal via Zustand.
- [ ] `next build` runs without `ignoreBuildErrors` or `ignoreDuringBuilds` flags.
- [ ] Starting the app without `NEXT_PUBLIC_API_URL` set throws a descriptive validation error.
- [ ] Movie images display with proper optimization (WebP format in supported browsers).

### Phase 2 Complete When:
- [ ] Navigating to a movie page, back to home, and back to the same movie page triggers zero additional API calls for movie data (cache hit confirmed in TQ devtools).
- [ ] Toggling the watchlist button shows the UI update immediately (before API response) — optimistic update confirmed.
- [ ] The `movie-actions-context.tsx` and `episode-review-context.tsx` files have been deleted from the repository.
- [ ] All 23 hooks in `src/hooks/` have been migrated from `useState`/`useEffect` to `useQuery`/`useMutation`.
- [ ] Every page route has a `loading.tsx` skeleton.
- [ ] Every major route segment has an `error.tsx` boundary.
- [ ] Refreshing the video page restores playback position from the video store.

### Phase 3 Complete When:
- [ ] `npm run test:run` passes with zero failing tests.
- [ ] `npm run test:coverage` reports ≥ 60% line coverage.
- [ ] `tsc --noEmit` reports zero errors.
- [ ] `npm run lint` reports zero violations.
- [ ] Zero `any` suppressions remain in non-test code.
- [ ] Lighthouse CI on the homepage scores ≥ 85 for Performance.
- [ ] The video player chunk does not appear in the initial page bundle (confirmed via `next build` output).

---

## 12. Glossary

| Term | Definition |
|---|---|
| **HttpOnly cookie** | A browser cookie with the `HttpOnly` flag, meaning it cannot be read by JavaScript (`document.cookie`). Tokens stored this way are protected from XSS attacks. |
| **Stale time** | In TanStack Query, the duration after which cached data is considered "stale" and eligible for a background refetch. Data within stale time is served from cache without a new network request. |
| **Optimistic update** | A UI pattern where the client immediately updates the display to reflect an expected server response, before the response is received. If the server call fails, the UI is rolled back. |
| **Zustand slice** | A conceptually isolated section of a Zustand store. In this project, `auth.store`, `ui.store`, and `video.store` are separate stores (not slices of one store) to enforce separation of concerns. |
| **Query key factory** | A centralized object that generates typed, consistent TanStack Query cache keys. Ensures that query invalidation targets the correct cache entries. |
| **Route Handler** | A Next.js App Router server-side endpoint defined by a `route.ts` file inside the `app/api/` directory. Runs on the server/edge and can set `HttpOnly` cookies. |
| **MSW** | Mock Service Worker. A library that intercepts HTTP requests at the network level in tests, allowing realistic API mocking without mocking modules or Axios. |
| **OTT** | Over-the-Top. A streaming service delivered directly over the internet, not through a cable or satellite provider (e.g., Netflix, Disney+). |
| **SSR-safe** | Code that does not reference browser-only APIs (`window`, `document`, `localStorage`) and therefore runs correctly both on the server and in the browser. |
| **YAGNI** | "You Aren't Gonna Need It." A software principle to avoid building features or abstractions before they are actually needed. |

---

*End of plan-design.md*
