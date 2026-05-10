import { http, HttpResponse } from 'msw';

const mockTvSeries = [
  { id: '1', title: 'Series 1', description: 'Desc 1', posterPath: '/poster1.jpg', seasons: 3, episodes: 24, voteAverage: 8.0 },
  { id: '2', title: 'Series 2', description: 'Desc 2', posterPath: '/poster2.jpg', seasons: 2, episodes: 16, voteAverage: 7.5 },
];

const mockEpisodes = [
  { id: 'ep-1', title: 'Episode 1', season: 1, episodeNumber: 1, duration: 45 },
  { id: 'ep-2', title: 'Episode 2', season: 1, episodeNumber: 2, duration: 42 },
];

export const tvSeriesHandlers = [
  http.get('*/tv-series', () => {
    return HttpResponse.json({ data: mockTvSeries, totalPages: 1, totalResults: mockTvSeries.length });
  }),

  http.get('*/tv-series/:id', ({ params }) => {
    const series = mockTvSeries.find(s => s.id === params.id) || mockTvSeries[0];
    return HttpResponse.json(series);
  }),

  http.get('*/tv-series/:id/episodes', () => {
    return HttpResponse.json({ data: mockEpisodes });
  }),

  http.get('*/tv-series/trending', () => {
    return HttpResponse.json({ data: mockTvSeries });
  }),

  http.get('*/tv-series/popular', () => {
    return HttpResponse.json({ data: mockTvSeries });
  }),
];
