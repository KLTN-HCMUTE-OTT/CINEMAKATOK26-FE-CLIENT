export const mockMovies = [
  { id: '1', title: 'Movie 1', description: 'Desc 1', posterPath: '/poster1.jpg', releaseDate: '2023-01-01', voteAverage: 8.5 },
  { id: '2', title: 'Movie 2', description: 'Desc 2', posterPath: '/poster2.jpg', releaseDate: '2023-02-01', voteAverage: 7.5 },
  { id: '3', title: 'Movie 3', description: 'Desc 3', posterPath: '/poster3.jpg', releaseDate: '2023-03-01', voteAverage: 9.0 }
];

export const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com'
};

export const mockWatchlistStatus = {
  inWatchlist: true
};

export const mockReviews = {
  page: 1,
  results: [
    { id: '1', author: 'User 1', content: 'Great movie!', rating: 9 },
    { id: '2', author: 'User 2', content: 'Not bad.', rating: 7 }
  ],
  totalPages: 1,
  totalResults: 2
};
