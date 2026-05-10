import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WatchlistButton } from '@/components/watchlist-button';
import { useAuthStore, useUIStore } from '@/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse, delay } from 'msw';

// Mock dependencies safely
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

describe('WatchlistButton Component', () => {
  beforeEach(() => {
    useUIStore.setState({ loginModalOpen: false });
    useAuthStore.setState({ isAuthenticated: false, user: null });
  });

  it('opens login modal when unauthenticated user clicks it', async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <WatchlistButton movieId="1" contentId="1" type="MOVIE" />
      </QueryClientProvider>
    );

    const button = screen.getByRole('button', { name: /Add to Watchlist/i });
    await user.click(button);

    // Assert UIStore login modal state is true
    expect(useUIStore.getState().loginModalOpen).toBe(true);
  });

  it('triggers watchlist status toggle and optimistic loading when authenticated', async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();
    
    useAuthStore.setState({ isAuthenticated: true, user: { id: '1', name: 'Tester' } });
    
    // Force the check endpoint to say it is NOT in watchlist to show the 'Add' button
    server.use(
      http.get('*/api/v1/watchlist/check/1', () => HttpResponse.json({ inWatchlist: false })),
      http.post('*/api/v1/watchlist', async () => {
        await delay(100); 
        return HttpResponse.json({ inWatchlist: true });
      })
    );

    render(
      <QueryClientProvider client={queryClient}>
        <WatchlistButton movieId="1" contentId="1" type="MOVIE" />
      </QueryClientProvider>
    );

    // Need to wait for initial check query to complete
    const button = await screen.findByRole('button', { name: /Add to Watchlist/i });
    
    await user.click(button);

    // Optimistic loading or "In Watchlist" state should appear immediately or very rapidly
    await waitFor(() => {
      // depending on hook implementation, it might show "Loading..." or "In Watchlist"
      expect(screen.queryByText(/Loading...|In Watchlist/i)).toBeInTheDocument();
    });
  });

  it('renders correctly in icon variant', async () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <WatchlistButton movieId="1" contentId="1" type="MOVIE" variant="icon" />
      </QueryClientProvider>
    );

    // Title should be "Add to Watchlist" with an icon instead of full text
    expect(await screen.findByTitle('Add to Watchlist')).toBeInTheDocument();
  });
});
