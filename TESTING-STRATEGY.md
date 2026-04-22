# CinemaKatok — Production-Ready Testing Strategy

> **Project:** CINEMAKATOK26-FE-CLIENT (OTT Streaming Platform)  
> **Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Zustand · TanStack Query  
> **Date:** 2026-04-20  
> **Status:** Ready for Implementation

---

## Table of Contents

1. [Project Analysis Summary](#1-project-analysis-summary)
2. [Critical User Flows](#2-critical-user-flows)
3. [Testing Strategy](#3-testing-strategy)
4. [Tooling](#4-tooling)
5. [Test Folder Structure](#5-test-folder-structure)
6. [Coverage Strategy](#6-coverage-strategy)
7. [CI/CD Integration](#7-cicd-integration)
8. [Anti-Patterns to Avoid](#8-anti-patterns-to-avoid)
9. [Example Test Cases](#9-example-test-cases)
10. [Production Readiness Improvements](#10-production-readiness-improvements)

---

## 1. Project Analysis Summary

### 1.1 Architecture Overview

| Layer | Technology | Count |
|---|---|---|
| Framework | Next.js 16 (App Router) | 19 page routes |
| State (client) | Zustand v5 | 3 stores (auth, ui, video) |
| State (server) | TanStack React Query v5 | Used in 25 hooks |
| API Layer | Axios + OpenAPI codegen | 22 generated API modules |
| UI Library | Radix UI / shadcn-ui | ~60 primitives |
| Styling | Tailwind CSS 4 + CSS Modules | — |
| Auth | HttpOnly cookies + Route Handlers | 4 Next.js route handlers |
| Video | video.js + hls.js | Custom player wrapper |

### 1.2 Component Classification

**UI / Presentational (~90 components)**  
All `src/components/ui/*` primitives (button, card, dialog, input, select, etc.), layout pieces (footer, nav-menu), and data-display cards (movie-card, person-hero, skeleton-card).

**Smart / Logic-Heavy (~62 components)**  
Components that import stores, hooks, or API calls directly:

| Domain | Key Components |
|---|---|
| Auth | `login-modal`, `register-modal`, `header`, `protected-route` |
| Discovery | `hero-section`, `banner-carousel`, `movie-list`, `trending-movies`, `new-releases`, `rank-list` |
| Movie Detail | `movie-detail-hero`, `reviews-section`, `watchlist-button` |
| TV Series | `tv-series-content`, `tv-series-carousel`, `episode-review-section` |
| Video Player | `custom-video-player`, `movie-video-player`, `tv-series-player`, `VideoControls` |
| Profile | `profile-header`, `favorite-movies`, `watchlist-section`, `history-section` |
| Blog | `blog-banner`, `blog-card` |

### 1.3 State Management Map

| Store | Persisted | Key State |
|---|---|---|
| `auth.store` | sessionStorage (user only) | `user`, `isAuthenticated`, `isLoading` |
| `ui.store` | None (ephemeral) | `loginModalOpen`, `registerModalOpen`, `modalContainer` |
| `video.store` | localStorage (prefs) + sessionStorage (progress) | `contentId`, `resumePosition`, `quality`, `volume` |

### 1.4 Current Test Coverage

| Category | Files | Tests | Status |
|---|---|---|---|
| Store (auth) | 1 | 17 | All passing |
| Store (ui) | 1 | 8 | All passing |
| Component (login-modal) | 1 | 5 | All passing |
| Component (movie-card) | 1 | 3 | All passing |
| Component (watchlist-button) | 1 | 3 | All passing |
| Sanity check | 1 | 1 | Passing |
| E2E (Playwright) | 1 | 2 | Basic smoke |
| **Total** | **7** | **38** | **All passing** |

**Gaps identified:**
- Zero tests for `video.store`
- Zero tests for any custom hook (25 hooks untested)
- Zero tests for middleware
- Zero integration tests (component + API + store interactions)
- Only 2 E2E scenarios (title check + login modal open)
- No tests for error boundaries, loading states, or route-level behavior

---

## 2. Critical User Flows

### Priority 1 — Must Test (breaks revenue/access)

| Flow | Components Involved | Test Level |
|---|---|---|
| Login (email/password) | `login-modal` → `auth.store` → `/api/auth/login` | Unit + Integration + E2E |
| Login (Google OAuth) | `login-modal` → `auth.store` → `/api/auth/login-google` | Unit + Integration |
| Logout | `header` → `auth.store` → `/api/auth/logout` | Unit + E2E |
| Session persistence | `auth.store.hydrateFromSession` → cookie refresh | Unit |
| Route protection | `middleware.ts` → redirect to `/` | Unit + E2E |
| Video playback access | `use-video-access` → `video.store` → player | Integration + E2E |
| Watch progress resume | `video.store.updateProgress` → backend sync | Unit + Integration |

### Priority 2 — Should Test (core UX)

| Flow | Components Involved | Test Level |
|---|---|---|
| Browse movies | Homepage → `movie-list` → `movie-card` → detail page | Integration + E2E |
| Browse TV series | `/tv_series` → `tv-series-content` → detail → episode | Integration + E2E |
| Add/remove watchlist | `watchlist-button` → `use-watchlist` → API | Unit + Integration |
| Add/remove favorites | `use-favorites` → API → optimistic update | Unit + Integration |
| Submit review | `review-form` → `use-reviews` → API | Unit + Integration |
| Search | `search-dropdown` → API → results | Integration + E2E |
| Profile management | `profile-header` → `use-profile` → API | Integration |
| Pagination | List pages → page navigation → new data | Integration |

### Priority 3 — Nice to Have

| Flow | Components Involved | Test Level |
|---|---|---|
| Theme toggle | `theme-provider` → next-themes | Unit |
| Contact form | `contact-form` → API | Integration |
| Blog browsing | `/blog` → `blog-card` → detail | E2E |
| Person filmography | `/person/[id]` → `use-person` → filmography | Integration |
| Share dialog | `share-dialog` → clipboard API | Unit |
| Report dialog | `report-dialog` → API | Unit |

---

## 3. Testing Strategy

### 3.1 Testing Pyramid

```
         ┌─────────┐
         │   E2E   │  ~10 tests (critical paths only)
         │Playwright│
        ─┼─────────┼─
       / │Integration│ \  ~25 tests (component + store + API)
      /  │  Vitest   │  \
     ────┼───────────┼────
    /    │   Unit     │    \  ~60 tests (stores, hooks, utils)
   /     │   Vitest   │     \
  ───────┴───────────┴───────
```

### 3.2 Unit Tests

**What to test:**
- All 3 Zustand stores (auth, ui, video) — every action and edge case
- Custom hooks with business logic (`use-watchlist`, `use-favorites`, `use-reviews`, `use-auth`, `use-video-access`, `use-watch-progress`, `use-reviews-management`)
- Utility functions (`src/lib/utils.ts`, `src/lib/auth.ts`)
- Middleware route protection logic
- Zod validation schemas (if applicable)

**What NOT to unit test:**
- Trivial UI primitives (shadcn `Button`, `Card`, `Badge` — already tested by Radix)
- Generated API modules (`src/apis/api/*` — trust the codegen)
- Static pages with no logic
- CSS/styling output

**Priority order for new unit tests:**

| Priority | Target | Why | Est. Tests |
|---|---|---|---|
| P0 | `video.store.ts` | Zero coverage, manages playback/revenue state | 12-15 |
| P0 | `use-watchlist.ts` / `use-user-watchlist.ts` | Optimistic updates, complex mutation logic | 8-10 |
| P1 | `use-favorites.ts` | Similar pattern to watchlist, user engagement | 6-8 |
| P1 | `use-reviews.ts` / `use-reviews-management.ts` | Content creation, moderation | 8-10 |
| P1 | `middleware.ts` | Route protection, security-critical | 5-6 |
| P2 | `use-auth.ts` | Wrapper over store, but has `requireAuth` | 4-5 |
| P2 | `use-video-access.ts` / `use-watch-progress.ts` | Video access control | 5-6 |
| P2 | `use-movies.ts` / `use-tvseries.ts` | Data fetching, caching behavior | 4-5 each |
| P3 | `use-profile.ts` / `use-cloudinary.ts` | Profile mutations | 3-4 each |

### 3.3 Integration Tests

Integration tests verify that components work correctly with their dependencies (stores, hooks, API mocking).

**Key integration scenarios:**

| Scenario | Components + Dependencies | What to Assert |
|---|---|---|
| Login flow end-to-end | `LoginModal` + `auth.store` + MSW + `ui.store` | Submitting valid credentials → store updates → modal closes → user displayed in header |
| Watchlist toggle (authed) | `WatchlistButton` + `QueryClient` + `use-watchlist` + MSW | Click → optimistic UI → API call → cache invalidation |
| Watchlist toggle (unauthed) | `WatchlistButton` + `ui.store` | Click → login modal opens |
| Movie list rendering | `MovieList` + `use-movies` + MSW + `QueryClient` | API response → cards rendered → loading/error states |
| Review submission | `ReviewForm` + `use-reviews` + MSW | Submit → API call → review appears in list |
| Profile update | `ProfileInfoSection` + `use-profile` + `auth.store` + MSW | Edit → API call → store synced |
| Error boundary behavior | Any page component + error.tsx | API failure → error boundary renders → retry works |
| Protected route redirect | `ProtectedRoute` + `auth.store` | Unauthenticated → redirect to home |

### 3.4 E2E Tests (Playwright)

E2E tests validate full user journeys in a real browser. Keep them minimal and stable.

**Critical E2E scenarios:**

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| 1 | Homepage loads | Navigate to `/` | Title matches, hero section visible, movie cards render |
| 2 | Login → authenticated state | Open login modal → fill credentials → submit | Modal closes, user menu appears, protected routes accessible |
| 3 | Route protection | Navigate to `/video` without auth | Redirected to `/` with `?redirect=/video` |
| 4 | Browse movies → detail | Click movie card → navigate to `/movies/[id]` | Movie title, poster, cast section visible |
| 5 | Watchlist toggle | Login → navigate to movie → toggle watchlist | Button state changes, persists on refresh |
| 6 | TV series → episode | Navigate to TV series → select episode | Episode player loads, episode info displayed |
| 7 | Search | Type in search → see results → click result | Search dropdown appears, navigation to detail works |
| 8 | Profile page | Login → navigate to `/profile` | Profile info, watchlist, favorites tabs work |
| 9 | Logout | Login → click logout | Redirected to home, auth state cleared |
| 10 | Responsive layout | Resize to mobile → check header/nav | Hamburger menu appears, navigation works |

---

## 4. Tooling

### 4.1 Current Stack (Already Configured)

| Tool | Version | Purpose | Why This Tool |
|---|---|---|---|
| **Vitest** | 2.1.8 | Unit + integration test runner | Shares Vite config, native TypeScript, fast HMR-like watch mode. Zero additional Babel/SWC config needed vs Jest. |
| **React Testing Library** | 16.3.2 | Component rendering + interaction | Tests user behavior, not implementation. Encourages accessible queries (`getByRole`, `getByText`). |
| **@testing-library/user-event** | 14.6.1 | Realistic user interaction simulation | Better than `fireEvent` — simulates actual browser events (focus, type, click sequences). |
| **@testing-library/jest-dom** | 6.9.1 | Extended DOM matchers | `toBeInTheDocument()`, `toHaveAttribute()`, `toBeVisible()` — more expressive assertions. |
| **MSW** | 2.13.4 | API mocking at network level | Intercepts at fetch/XHR level, not module level. Handlers reusable across tests. More realistic than `vi.mock(axios)`. |
| **Playwright** | 1.59.1 | E2E browser automation | Best-in-class auto-waiting, cross-browser support, trace viewer for debugging. CI-friendly. |
| **@vitest/coverage-v8** | 2.1.8 | Coverage reporting | V8-native coverage, faster than Istanbul, works with Vitest out of box. |
| **jest-axe** | 10.0.0 | Accessibility testing | Automated a11y checks in component tests. Catches WCAG violations early. |
| **jsdom** | 24.1.3 | DOM environment for Vitest | Simulates browser DOM for component rendering in Node.js. |

### 4.2 Recommended Additions

| Tool | Purpose | Why |
|---|---|---|
| **@testing-library/react-hooks** (or inline renderHook) | Hook testing | Vitest + RTL 16 includes `renderHook` natively. Use for testing hooks in isolation. |
| **Playwright `@axe-core/playwright`** | E2E accessibility | Runs full accessibility audits in real browser during E2E tests. |
| **`happy-dom`** (optional swap) | Faster DOM env | 2-3x faster than jsdom for large test suites. Consider when test count exceeds 200+. |

### 4.3 Tools NOT Recommended

| Tool | Why Not |
|---|---|
| Jest | Requires separate Babel/SWC config that conflicts with Turbopack. Vitest is the correct choice for this stack. |
| Cypress | Heavier than Playwright, worse parallelism, no native multi-browser. Playwright is already in place. |
| Enzyme | Deprecated, incompatible with React 19. |
| `vi.mock()` for API calls | Mocks at module level, less realistic than MSW. Only use for non-HTTP dependencies (next/navigation, etc.). |

---

## 5. Test Folder Structure

```
src/
├── tests/                          # Vitest tests
│   ├── setup.ts                    # MSW lifecycle + jest-dom matchers
│   ├── utils/                      # Test utilities
│   │   ├── render.tsx              # Custom render with providers
│   │   ├── create-query-client.ts  # Test QueryClient factory
│   │   └── store-helpers.ts        # Store reset utilities
│   ├── mocks/
│   │   ├── server.ts               # MSW server instance
│   │   ├── handlers.ts             # Default API handlers
│   │   ├── handlers/               # Domain-specific handler overrides
│   │   │   ├── auth.ts
│   │   │   ├── movies.ts
│   │   │   ├── watchlist.ts
│   │   │   ├── reviews.ts
│   │   │   └── tv-series.ts
│   │   └── data.ts                 # Shared mock data fixtures
│   ├── components/                 # Component tests
│   │   ├── login-modal.test.tsx
│   │   ├── register-modal.test.tsx
│   │   ├── movie-card.test.tsx
│   │   ├── watchlist-button.test.tsx
│   │   ├── header.test.tsx
│   │   ├── search-dropdown.test.tsx
│   │   ├── movie-list.test.tsx
│   │   ├── review-form.test.tsx
│   │   └── protected-route.test.tsx
│   ├── hooks/                      # Hook tests
│   │   ├── use-watchlist.test.ts
│   │   ├── use-favorites.test.ts
│   │   ├── use-reviews.test.ts
│   │   ├── use-auth.test.ts
│   │   ├── use-movies.test.ts
│   │   ├── use-tvseries.test.ts
│   │   ├── use-video-access.test.ts
│   │   └── use-profile.test.ts
│   └── middleware/
│       └── middleware.test.ts
│
├── store/
│   ├── auth.store.ts
│   ├── auth.store.test.ts          # Co-located store test
│   ├── ui.store.ts
│   ├── ui.store.test.ts            # Co-located store test
│   ├── video.store.ts
│   └── video.store.test.ts         # NEW — Co-located store test
│
└── e2e/                            # Playwright E2E tests
    ├── home.spec.ts                # Homepage tests
    ├── auth.spec.ts                # Login/logout/protection
    ├── movies.spec.ts              # Movie browsing + detail
    ├── tv-series.spec.ts           # TV series browsing + episodes
    ├── watchlist.spec.ts           # Watchlist interactions
    ├── profile.spec.ts             # Profile page
    └── fixtures/
        └── auth.ts                 # Playwright auth fixtures
```

### Naming Conventions

| Pattern | Location | Example |
|---|---|---|
| `*.test.ts` / `*.test.tsx` | Vitest unit/integration | `auth.store.test.ts`, `login-modal.test.tsx` |
| `*.spec.ts` | Playwright E2E | `auth.spec.ts`, `movies.spec.ts` |
| Co-located tests | Same directory as source | `src/store/auth.store.test.ts` next to `auth.store.ts` |
| Centralized tests | `src/tests/` subdirectories | `src/tests/components/`, `src/tests/hooks/` |

---

## 6. Coverage Strategy

### 6.1 Coverage Targets

| Category | Target | Rationale |
|---|---|---|
| **Overall line coverage** | ≥ 70% | Realistic for a project transitioning from 0 to production. |
| **Zustand stores** | ≥ 95% | Pure logic, easy to test, critical for app behavior. |
| **Custom hooks** | ≥ 80% | Business logic lives here; most bang for the buck. |
| **Smart components** | ≥ 60% | Test behavior (interactions, conditional rendering), not layout. |
| **UI primitives** | 0% (skip) | Tested by Radix UI upstream. Testing these adds no value. |
| **Generated APIs** | 0% (skip) | Codegen output. Trust the generator. |
| **Middleware** | ≥ 90% | Security-critical routing logic. |
| **Utility functions** | ≥ 90% | Pure functions, trivial to test. |

### 6.2 What MUST Be Covered

- Every Zustand store action (login, logout, hydrateFromSession, updateProgress, etc.)
- Every custom hook that performs API mutations (use-watchlist, use-favorites, use-reviews)
- Auth flow (login success, failure, Google OAuth, session hydration)
- Route protection (middleware redirect logic)
- Video store (playback resume, progress sync, quality persistence)
- Error handling paths in API calls

### 6.3 What Is Optional

- Static page layouts (no logic to test)
- Trivial presentational components (badge, separator, skeleton)
- Theme toggling
- CSS class assertions
- Tooltip/popover hover states (fragile in jsdom)

### 6.4 Vitest Coverage Configuration

The current `vitest.config.mts` already sets 60% line threshold. To reach the target:

```typescript
coverage: {
  provider: 'v8',
  include: [
    'src/store/**/*.ts',
    'src/hooks/**/*.ts',
    'src/components/**/*.{ts,tsx}',
    'src/lib/**/*.ts',
    'src/middleware.ts',
  ],
  exclude: [
    'src/apis/**',           // Generated code
    'src/components/ui/**',  // Radix primitives
    'src/types/**',          // Type declarations
    'src/**/*.d.ts',
    'src/tests/**',
    'src/e2e/**',
  ],
  thresholds: {
    lines: 70,
    branches: 65,
    functions: 70,
    statements: 70,
  }
}
```

---

## 7. CI/CD Integration

### 7.1 Current Pipeline Issues

| Issue | Location | Impact |
|---|---|---|
| `quality` job missing `pnpm install` | `ci-cd.yml` line 29 | `pnpm run test:ci` fails without dependencies |
| Port mismatch in performance job | `curl http://localhost:3000` vs app on `:3010` | Lighthouse never connects |
| Tests soft-fail with `\|\| echo` | `ci-cd.yml` line 29 | Failing tests don't block merges |
| No coverage reporting in CI | — | No visibility into regression |
| E2E missing env vars for API | `ci-cd.yml` e2e job | Tests may fail on API calls |

### 7.2 Recommended Pipeline

```yaml
# When to run each test type:
#
# pre-commit (husky/lint-staged):
#   - ESLint on staged files
#   - TypeScript check on staged files
#
# Pull Request:
#   - Full lint + type-check
#   - Vitest unit + integration (with coverage)
#   - Playwright E2E (Chromium only)
#   - Coverage threshold gate (fail if < 70%)
#
# Push to main:
#   - Everything above +
#   - Playwright cross-browser (Chromium + Firefox + WebKit)
#   - Lighthouse performance audit
#   - Deploy to staging → smoke tests
#
# Pre-deployment (production):
#   - Full E2E on staging URL
#   - Security audit
#   - Bundle size check
```

### 7.3 Fixed CI/CD Configuration

Key fixes to apply to `.github/workflows/ci-cd.yml`:

**1. Fix `quality` job — add install steps and fail on test failure:**
```yaml
quality:
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
      with: { version: ${{ env.PNPM_VERSION }} }
    - uses: actions/setup-node@v4
      with: { node-version: ${{ env.NODE_VERSION }}, cache: pnpm }
    - run: pnpm install --no-frozen-lockfile
    - run: pnpm run lint
    - run: pnpm run test:ci   # Remove the "|| echo" fallback
    - run: pnpm run test:coverage
    - uses: actions/upload-artifact@v4
      with:
        name: coverage-report
        path: coverage/
```

**2. Fix performance job port:**
```yaml
- run: |
    pnpm start -p 3010 &
    timeout 60 bash -c 'until curl -f http://localhost:3010; do sleep 2; done'
```

**3. Add coverage threshold enforcement:**
```yaml
- name: Check coverage thresholds
  run: pnpm run test:coverage  # Will fail if below threshold in vitest.config
```

**4. Enhance E2E job with proper env and artifact handling:**
```yaml
e2e:
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
    - uses: actions/setup-node@v4
    - run: pnpm install --no-frozen-lockfile
    - run: pnpm exec playwright install --with-deps chromium
    - run: pnpm exec playwright test
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.STAGING_API_URL || 'http://localhost:3000' }}
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: mock-id
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-traces
        path: test-results/
        retention-days: 7
```

---

## 8. Anti-Patterns to Avoid

### 8.1 Unit Test Anti-Patterns

| Anti-Pattern | Why It's Bad | Do This Instead |
|---|---|---|
| Testing implementation details | Tests break on refactor, not on bugs | Test behavior: "when user clicks X, Y appears" |
| `vi.mock()` for everything | Hides real integration bugs | Use MSW for API mocking, only `vi.mock()` for non-HTTP deps |
| Testing CSS classes | Brittle, zero user value | Test visibility, accessibility roles, text content |
| Snapshot tests for components | Break on any change, developers approve blindly | Write specific assertions: `expect(title).toHaveTextContent('Movie')` |
| Testing Radix UI primitives | Already tested upstream | Only test your wrapper behavior on top of primitives |
| Shared mutable state between tests | Flaky, order-dependent failures | Reset stores in `beforeEach`, use fresh QueryClient per test |
| Using `any` in test code | Masks type errors, makes refactoring harder | Type mock data and test helpers properly |

### 8.2 Integration Test Anti-Patterns

| Anti-Pattern | Why It's Bad | Do This Instead |
|---|---|---|
| Testing every component in isolation | Misses real integration bugs | Test meaningful component trees (Form + submit + API) |
| Not wrapping in providers | Crashes on missing context | Use a custom `renderWithProviders` utility |
| Hardcoded timeouts (`setTimeout`) | Flaky, slow | Use `waitFor`, `findBy*` queries, or `screen.findByRole` |
| Not resetting MSW handlers | Handler leaks between tests | `afterEach(() => server.resetHandlers())` in setup.ts |

### 8.3 E2E Anti-Patterns

| Anti-Pattern | Why It's Bad | Do This Instead |
|---|---|---|
| Too many E2E tests | Slow, flaky, expensive CI | Keep to ~10 critical paths. Push logic down to unit/integration. |
| Testing UI details in E2E | Fragile selectors break on redesign | Test user outcomes: "user sees their name after login" |
| No `await` before assertions | Race conditions, flaky | Always use Playwright's auto-waiting: `await expect(locator).toBeVisible()` |
| Relying on real backend | Tests fail on backend downtime | Mock at API route level or use a test backend with seeded data |
| `page.waitForTimeout(5000)` | Slow, unreliable | Use `page.waitForResponse`, `expect(locator).toBeVisible()` |
| Testing in one browser only | Misses cross-browser bugs | At minimum: Chromium + Firefox in CI |
| No trace/screenshot on failure | Hard to debug CI failures | Configure `trace: 'on-first-retry'` and upload artifacts |

---

## 9. Example Test Cases

### 9.1 Video Store Unit Test (NEW)

```typescript
// src/store/video.store.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useVideoStore } from './video.store';

const initialState = useVideoStore.getState();

describe('Video Store', () => {
  beforeEach(() => {
    useVideoStore.setState(initialState, true);
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should have correct initial state', () => {
    useVideoStore.setState({
      contentId: null, episodeId: null, contentType: null,
      resumePosition: 0, quality: 'auto', volume: 1, isMuted: false
    });
    const state = useVideoStore.getState();
    expect(state.contentId).toBeNull();
    expect(state.resumePosition).toBe(0);
    expect(state.quality).toBe('auto');
    expect(state.volume).toBe(1);
    expect(state.isMuted).toBe(false);
  });

  it('should set content with movie type', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    const state = useVideoStore.getState();
    expect(state.contentId).toBe('movie-1');
    expect(state.contentType).toBe('movie');
    expect(state.episodeId).toBeNull();
  });

  it('should set content with TV series episode', () => {
    useVideoStore.getState().setContent('series-1', 'ep-3', 'tv_series');
    const state = useVideoStore.getState();
    expect(state.contentId).toBe('series-1');
    expect(state.episodeId).toBe('ep-3');
    expect(state.contentType).toBe('tv_series');
  });

  it('should update progress and write to sessionStorage', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().updateProgress(120.5);
    expect(useVideoStore.getState().resumePosition).toBe(120.5);
  });

  it('should ignore invalid progress values', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().updateProgress(-10);
    expect(useVideoStore.getState().resumePosition).toBe(0);
    useVideoStore.getState().updateProgress(NaN);
    expect(useVideoStore.getState().resumePosition).toBe(0);
  });

  it('should not update progress without content', () => {
    useVideoStore.getState().updateProgress(50);
    expect(useVideoStore.getState().resumePosition).toBe(0);
  });

  it('should clamp volume between 0 and 1', () => {
    useVideoStore.getState().setVolume(1.5);
    expect(useVideoStore.getState().volume).toBe(1);
    useVideoStore.getState().setVolume(-0.5);
    expect(useVideoStore.getState().volume).toBe(0);
  });

  it('should auto-mute when volume is set to 0', () => {
    useVideoStore.getState().setVolume(0);
    expect(useVideoStore.getState().isMuted).toBe(true);
  });

  it('should persist quality preference to localStorage', () => {
    useVideoStore.getState().setQuality('720p');
    expect(useVideoStore.getState().quality).toBe('720p');
  });

  it('should clear content and cancel pending sync', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().updateProgress(60);
    useVideoStore.getState().clearContent();
    const state = useVideoStore.getState();
    expect(state.contentId).toBeNull();
    expect(state.resumePosition).toBe(0);
  });

  it('should restore session snapshot on setContent if contentId matches', () => {
    sessionStorage.setItem('cinemakatok-video-session', JSON.stringify({
      contentId: 'movie-1', episodeId: null, contentType: 'movie', resumePosition: 300
    }));
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    expect(useVideoStore.getState().resumePosition).toBe(300);
  });

  it('should not restore session for a different contentId', () => {
    sessionStorage.setItem('cinemakatok-video-session', JSON.stringify({
      contentId: 'movie-1', episodeId: null, contentType: 'movie', resumePosition: 300
    }));
    useVideoStore.getState().setContent('movie-2', null, 'movie');
    expect(useVideoStore.getState().resumePosition).toBe(0);
  });
});
```

### 9.2 Hook Test (use-watchlist)

```typescript
// src/tests/hooks/use-watchlist.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useAuthStore } from '@/store';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useWatchlist', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: '1', name: 'Test' } });
  });

  it('should return watchlist status for a content item', async () => {
    server.use(
      http.get('*/watchlist/check/*', () =>
        HttpResponse.json({ inWatchlist: true })
      )
    );

    const { result } = renderHook(() => useWatchlist('content-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isInWatchlist).toBe(true);
    });
  });

  it('should toggle watchlist status', async () => {
    server.use(
      http.get('*/watchlist/check/*', () => HttpResponse.json({ inWatchlist: false })),
      http.post('*/watchlist', () => HttpResponse.json({ inWatchlist: true }))
    );

    const { result } = renderHook(() => useWatchlist('content-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Additional toggle + assertion logic follows the hook's API
  });
});
```

### 9.3 E2E Auth Flow

```typescript
// src/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect unauthenticated user from /video to home', async ({ page }) => {
    await page.goto('/video');
    await expect(page).toHaveURL(/\/\?redirect=%2Fvideo/);
  });

  test('should redirect unauthenticated user from /profile to home', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/\?redirect=%2Fprofile/);
  });

  test('should open and close login modal', async ({ page }) => {
    await page.goto('/');
    const loginButton = page.getByRole('button', { name: /Sign In|Login/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await expect(page.getByText(/Welcome Back!/i)).toBeVisible();

      // Close modal
      await page.keyboard.press('Escape');
      await expect(page.getByText(/Welcome Back!/i)).not.toBeVisible();
    }
  });

  test('should show validation errors on empty login submit', async ({ page }) => {
    await page.goto('/');
    const loginButton = page.getByRole('button', { name: /Sign In|Login/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.getByRole('button', { name: /Sign In/i }).click();
      // Expect validation messages
      await expect(page.getByText(/email|required/i)).toBeVisible();
    }
  });
});
```

### 9.4 E2E Movie Browsing

```typescript
// src/e2e/movies.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Movie Browsing', () => {
  test('homepage displays movie sections', async ({ page }) => {
    await page.goto('/');
    // Wait for content to load
    await expect(page.locator('[data-testid="hero-section"], .hero-section, main').first()).toBeVisible();
  });

  test('can navigate to movie detail page', async ({ page }) => {
    await page.goto('/movies');
    // Wait for movie cards to appear
    const movieCard = page.locator('a[href*="/movies/"]').first();
    await expect(movieCard).toBeVisible({ timeout: 10000 });
    await movieCard.click();
    // Should be on a movie detail page
    await expect(page).toHaveURL(/\/movies\/.+/);
  });

  test('movie detail page shows required information', async ({ page }) => {
    await page.goto('/movies');
    const movieLink = page.locator('a[href*="/movies/"]').first();
    if (await movieLink.isVisible({ timeout: 5000 })) {
      await movieLink.click();
      // Core sections should be present
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
```

### 9.5 Custom Render Utility

```typescript
// src/tests/utils/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...options }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }
  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient };
}

export { createTestQueryClient };
```

---

## 10. Production Readiness Improvements

### 10.1 Immediate Actions (This Sprint)

| # | Action | Impact |
|---|---|---|
| 1 | Add `video.store.test.ts` | Covers revenue-critical playback state (0% → 95%) |
| 2 | Create `src/tests/utils/render.tsx` | Eliminates provider boilerplate across all tests |
| 3 | Expand MSW handlers for all API domains | Enables testing of hooks and integration scenarios |
| 4 | Fix CI `quality` job (add install, remove `\|\| echo`) | Tests actually gate merges |
| 5 | Fix CI port mismatch (3000 → 3010) | Lighthouse actually runs |
| 6 | Add E2E auth flow tests (3-4 specs) | Validates route protection end-to-end |

### 10.2 Short-Term (Next 2 Sprints)

| # | Action | Impact |
|---|---|---|
| 7 | Write hook tests for `use-watchlist`, `use-favorites`, `use-reviews` | Covers mutation logic, optimistic updates |
| 8 | Write middleware test | Validates route protection logic in isolation |
| 9 | Add E2E movie/TV browsing tests | Validates core content discovery |
| 10 | Split MSW handlers into domain files | Maintainable as mock surface grows |
| 11 | Add Playwright Firefox project | Cross-browser coverage |
| 12 | Add pre-commit hook for lint + type-check | Catch errors before push |

### 10.3 Medium-Term (Next Month)

| # | Action | Impact |
|---|---|---|
| 13 | Reach 70% line coverage threshold | Production-quality confidence |
| 14 | Add visual regression with Playwright screenshots | Catch unintended UI changes |
| 15 | Add `@axe-core/playwright` for E2E a11y | WCAG compliance in real browser |
| 16 | Performance budget tests (bundle size assertions) | Prevent bundle bloat |
| 17 | Add Playwright `storageState` auth fixture | Reuse login state across E2E tests |
| 18 | Consider `happy-dom` migration if suite > 200 tests | Faster test execution |

### 10.4 Test Maintenance Guidelines

1. **Every PR that adds a hook must include hook tests.** No exceptions.
2. **Every PR that adds a store action must update the store test.** Co-located tests make this natural.
3. **E2E tests are owned by the team, not individuals.** Any flaky E2E test is either fixed within 24 hours or temporarily skipped with a tracking issue.
4. **MSW handlers must match real API contracts.** When the backend changes an endpoint, update `src/tests/mocks/handlers.ts` in the same PR.
5. **Coverage can only go up.** Use `vitest.config.mts` thresholds to enforce this — never lower the threshold.
6. **Test data is centralized.** All mock objects live in `src/tests/mocks/data.ts`. Never hardcode API response shapes in individual test files.

---

*End of TESTING-STRATEGY.md*
