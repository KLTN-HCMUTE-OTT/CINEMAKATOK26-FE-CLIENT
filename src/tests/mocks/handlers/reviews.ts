import { http, HttpResponse } from 'msw';
import { mockReviews } from '../data';

export const reviewHandlers = [
  http.get('*/reviews', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');

    return HttpResponse.json({
      ...mockReviews,
      page,
    });
  }),

  http.get('*/reviews/:contentId', () => {
    return HttpResponse.json(mockReviews);
  }),

  http.post('*/reviews', async ({ request }) => {
    const body = await request.json() as { content?: string; rating?: number };

    if (!body.content || !body.rating) {
      return HttpResponse.json({ message: 'Content and rating are required' }, { status: 400 });
    }

    return HttpResponse.json({
      id: 'new-review-1',
      author: 'Test User',
      content: body.content,
      rating: body.rating,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.delete('*/reviews/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/episode-reviews', () => {
    return HttpResponse.json(mockReviews);
  }),
];
