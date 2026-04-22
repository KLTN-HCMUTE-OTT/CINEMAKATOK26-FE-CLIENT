import { http, HttpResponse } from 'msw';

let watchlistItems = new Set<string>();

export const watchlistHandlers = [
  http.get('*/watchlist/check/:contentId', ({ params }) => {
    const contentId = params.contentId as string;
    return HttpResponse.json({ inWatchlist: watchlistItems.has(contentId) });
  }),

  http.get('*/watchlist', () => {
    return HttpResponse.json({
      data: Array.from(watchlistItems).map(id => ({
        id,
        contentId: id,
        addedAt: new Date().toISOString(),
      })),
      totalResults: watchlistItems.size,
    });
  }),

  http.post('*/watchlist', async ({ request }) => {
    const body = await request.json() as { contentId?: string };
    if (body.contentId) {
      watchlistItems.add(body.contentId);
    }
    return HttpResponse.json({ inWatchlist: true });
  }),

  http.delete('*/watchlist/:contentId', ({ params }) => {
    watchlistItems.delete(params.contentId as string);
    return HttpResponse.json({ inWatchlist: false });
  }),
];

export function resetWatchlistState() {
  watchlistItems = new Set();
}
