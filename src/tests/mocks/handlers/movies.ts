import { http, HttpResponse } from 'msw';
import { mockMovies } from '../data';

export const movieHandlers = [
  http.get('*/movies', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    return HttpResponse.json({
      data: mockMovies.slice(0, limit),
      page,
      totalPages: 1,
      totalResults: mockMovies.length,
    });
  }),

  http.get('*/movies/:id', ({ params }) => {
    const movie = mockMovies.find(m => m.id === params.id) || mockMovies[0];
    return HttpResponse.json(movie);
  }),

  http.get('*/movies/:id/recommendations', () => {
    return HttpResponse.json({ data: mockMovies.slice(0, 2) });
  }),

  http.get('*/movies/:id/cast', () => {
    return HttpResponse.json({
      cast: [
        { id: '1', name: 'Actor 1', character: 'Character 1', profilePath: '/actor1.jpg' },
        { id: '2', name: 'Actor 2', character: 'Character 2', profilePath: '/actor2.jpg' },
      ],
    });
  }),

  http.get('*/movies/trending', () => {
    return HttpResponse.json({ data: mockMovies });
  }),

  http.get('*/movies/new-releases', () => {
    return HttpResponse.json({ data: mockMovies });
  }),
];
