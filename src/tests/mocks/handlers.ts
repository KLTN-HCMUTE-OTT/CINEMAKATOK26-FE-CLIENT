import { http, HttpResponse } from 'msw';
import { mockMovies, mockUser, mockWatchlistStatus, mockReviews } from './data';

export const handlers = [
  http.get('*/movies', () => {
    return HttpResponse.json(mockMovies);
  }),
  
  http.get('*/movies/:id', ({ params }) => {
    const movie = mockMovies.find(m => m.id === params.id) || mockMovies[0];
    return HttpResponse.json(movie);
  }),

  http.post('*/auth/login', () => {
    return HttpResponse.json({ success: true, user: mockUser, token: 'mock-token' });
  }),

  http.get('*/watchlist/check', () => {
    return HttpResponse.json(mockWatchlistStatus);
  }),

  http.get('*/reviews', () => {
    return HttpResponse.json(mockReviews);
  })
];
