/**
 * Centralized query key factory — single source of truth for all TanStack Query cache keys.
 *
 * Every method returns a `readonly` tuple (`as const`) so TypeScript can infer
 * the literal types and provide autocompletion / type safety for invalidation.
 */

export const queryKeys = {
  movies: {
    all: ["movies"] as const,
    lists: () => [...queryKeys.movies.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.movies.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.movies.all, "detail", id] as const,
    recommendations: (id: string) =>
      [...queryKeys.movies.all, "recommendations", id] as const,
    cast: (id: string) => [...queryKeys.movies.all, "cast", id] as const,
    reviews: (id: string, page?: number) =>
      [...queryKeys.movies.all, "reviews", id, page] as const,
  },

  tvSeries: {
    all: ["tvSeries"] as const,
    lists: () => [...queryKeys.tvSeries.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.tvSeries.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.tvSeries.all, "detail", id] as const,
    episodes: (id: string, season?: number) =>
      [...queryKeys.tvSeries.all, "episodes", id, season] as const,
    reviews: (id: string, episodeId?: string, page?: number) =>
      [...queryKeys.tvSeries.all, "reviews", id, episodeId, page] as const,
  },

  watchlist: {
    all: ["watchlist"] as const,
    status: (contentId: string) =>
      [...queryKeys.watchlist.all, "status", contentId] as const,
  },

  favorites: {
    all: ["favorites"] as const,
    status: (contentId: string) =>
      [...queryKeys.favorites.all, "status", contentId] as const,
  },

  reviews: {
    all: ["reviews"] as const,
    forContent: (contentId: string, page?: number) =>
      [...queryKeys.reviews.all, "content", contentId, page] as const,
    userReview: (contentId: string, userId?: string) =>
      [...queryKeys.reviews.all, "user", contentId, userId] as const,
  },

  episodeReviews: {
    all: ["episodeReviews"] as const,
    forEpisode: (episodeId: string, page?: number) =>
      [...queryKeys.episodeReviews.all, "episode", episodeId, page] as const,
  },

  auth: {
    profile: () => ["auth", "profile"] as const,
  },

  person: {
    detail: (id: string) => ["person", "detail", id] as const,
    filmography: (id: string) => ["person", "filmography", id] as const,
  },

  blog: {
    all: ["blog"] as const,
    list: (page?: number) => [...queryKeys.blog.all, "list", page] as const,
    detail: (id: string) => [...queryKeys.blog.all, "detail", id] as const,
  },

  categories: {
    all: ["categories"] as const,
  },

  replies: {
    forReview: (reviewId: string, page?: number) =>
      ["replies", "review", reviewId, page] as const,
    forEpisodeReview: (episodeReviewId: string, page?: number) =>
      ["replies", "episodeReview", episodeReviewId, page] as const,
    count: (reviewId: string) => ["replies", "count", reviewId] as const,
    episodeCount: (episodeReviewId: string) =>
      ["replies", "episodeCount", episodeReviewId] as const,
  },

  actors: {
    top: (limit?: number) => ["actors", "top", limit] as const,
  },

  videoAccess: {
    access: (s3Key: string) => ["videoAccess", s3Key] as const,
  },

  watchProgress: {
    resume: (videoId: string) => ["watchProgress", "resume", videoId] as const,
  },

  watchParty: {
    all: ["watchParty"] as const,
    rooms: (params?: Record<string, unknown>) =>
      [...["watchParty"], "rooms", params] as const,
    invite: (code: string) => [...["watchParty"], "invite", code] as const,
    myRoom: () => [...["watchParty"], "myRoom"] as const,
    content: (videoId: string) =>
      [...["watchParty"], "content", videoId] as const,
  },
} as const;
