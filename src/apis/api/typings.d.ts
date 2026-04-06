declare namespace API {
  type ActorControllerFindAllParams = {
    /** Search actors by name or nationality */
    search?: any;
    /** Sort order for actors */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ActorControllerFindOneParams = {
    /** Actor ID */
    id: string;
  };

  type ActorControllerGetTopActorsParams = {
    limit?: number;
    page?: number;
  };

  type ActorControllerRemoveParams = {
    /** Actor ID */
    id: string;
  };

  type ActorControllerUpdateParams = {
    /** Actor ID */
    id: string;
  };

  type ActorDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Name of the actor */
    name: string;
    /** Birth date of the actor */
    dateOfBirth: string;
    /** Gender of the actor */
    gender: "MALE" | "FEMALE" | "OTHER";
    /** Biography of the actor */
    bio: string;
    /** Profile picture of the actor */
    profilePicture: string;
    /** Nationality of the actor */
    nationality: string;
  };

  type AnalyticsControllerGetCategoriesStatsParams = {
    /** Search categories by name */
    search?: any;
    /** Sort order for categories */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type AnalyticsControllerGetMoviesStatsParams = {
    /** Search movies by title */
    search?: any;
    /** Sort order for movies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type AnalyticsControllerGetTrendingMoviesParams = {
    /** Search trending movies by title */
    search?: any;
    /** Sort order for trending movies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type AnalyticsControllerGetTrendingTVSeriesParams = {
    /** Search trending TV series by title */
    search?: any;
    /** Sort order for trending TV series */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type AnalyticsControllerGetTVSeriesStatsParams = {
    /** Search TV series by title */
    search?: any;
    /** Sort order for TV series */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type AuditLogControllerGetLogsParams = {
    /** Search actors by name or nationality */
    search?: any;
    /** Sort order for actors */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type AuditLogControllerGetRecentActivityParams = {
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type AuditLogDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** ID of the user who performed the action */
    userId: string;
    /** Action performed */
    action: Record<string, any>;
    /** Description of the action */
    description: string;
  };

  type AuditLogDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: AuditLogDto[];
    meta: PaginationMeta;
  };

  type AuditLogDtoResponseDto = {
    statusCode: number;
    message: string;
    data: AuditLogDto;
  };

  type AuditLogVideo = {
    /** ID of the video */
    videoId: string;
  };

  type AuthControllerResendOtpParams = {
    /** User email address */
    email: string;
  };

  type AuthControllerResendRegisterOtpParams = {
    /** User email address to resend OTP */
    email: string;
  };

  type AuthRequest = {
    /** User email */
    email: string;
    /** User password */
    password: string;
  };

  type BanUserDto = {
    /** Reason for banning user */
    banReason: string;
    /** Duration of ban in days */
    durationDays: number;
  };

  type CategoryControllerFindAllParams = {
    /** Search categories by name */
    search?: any;
    /** Sort order for categories */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type CategoryControllerFindOneParams = {
    /** Category ID */
    id: string;
  };

  type CategoryControllerRemoveParams = {
    /** Category ID */
    id: string;
  };

  type CategoryControllerUpdateParams = {
    /** Category ID */
    id: string;
  };

  type CategoryDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Name of the category */
    categoryName: string;
  };

  type CategoryDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: CategoryDto[];
    meta: PaginationMeta;
  };

  type CategoryDtoResponseDto = {
    statusCode: number;
    message: string;
    data: CategoryDto;
  };

  type ChangePasswordRequest = {
    /** Current password */
    currentPassword: string;
    /** New password */
    newPassword: string;
    /** Confirm new password */
    confirmPassword: string;
  };

  type ChurnRateMetricDto = {
    month: string;
    rate: number;
    trend: string;
  };

  type ContentControllerDeleteParams = {
    id: string;
  };

  type ContentControllerFindAllParams = {
    /** Content type (MOVIE or TVSERIES) */
    type?: "MOVIE" | "TVSERIES";
    /** Array of tag IDs to filter by */
    tagIds?: string[];
    /** Array of category IDs to filter by */
    categoryIds?: string[];
    /** Array of actor IDs to filter by */
    actorIds?: string[];
    /** Array of director IDs to filter by */
    directorIds?: string[];
    /** Release year to filter by */
    year?: number;
    /** Search by title */
    title?: string;
    /** Sort by field */
    sortBy?: "views" | "title" | "date";
    /** Sort order */
    order?: "ASC" | "DESC";
    /** Page number for pagination */
    page?: number;
    /** Number of items per page */
    limit?: number;
  };

  type ContentControllerFindOneParams = {
    id: string;
  };

  type ContentControllerIncreaseViewParams = {
    id: string;
  };

  type ContentControllerUpdateParams = {
    id: string;
  };

  type ContentDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Type of the content */
    type: "MOVIE" | "TVSERIES";
    /** Title of the content */
    title: string;
    /** Description of the content */
    description: string;
    /** Release date of the content */
    releaseDate: string;
    /** Maturity rating of the content */
    maturityRating:
      | "G"
      | "PG"
      | "PG-13"
      | "R"
      | "NC-17"
      | "TV-Y"
      | "TV-PG"
      | "TV-14"
      | "TV-MA";
    /** Thumbnail image URL of the content */
    thumbnail: string;
    /** Banner image URL of the content */
    banner: string;
    /** Trailer video URL of the content */
    trailer: string;
    /** Average rating of the content */
    avgRating?: number;
    /** View count of the content */
    viewCount?: number;
    /** IMDB rating of the content */
    imdbRating?: number;
    /** Categories of the content */
    categories: CategoryDto[];
    /** Tags of the content */
    tags: TagDto[];
    /** Actors of the content */
    actors: ActorDto[];
    /** Directors of the content */
    directors: DirectorDto[];
  };

  type ContentDtoResponseDto = {
    statusCode: number;
    message: string;
    data: ContentDto;
  };

  type CreateActorDto = {
    /** Name of the actor */
    name: string;
    /** Birth date of the actor */
    dateOfBirth: string;
    /** Gender of the actor */
    gender: "MALE" | "FEMALE" | "OTHER";
    /** Biography of the actor */
    bio: string;
    /** Profile picture of the actor */
    profilePicture: string;
    /** Nationality of the actor */
    nationality: string;
  };

  type CreateCategoryDto = {
    /** Name of the category */
    categoryName: string;
  };

  type CreateContentDto = {
    /** Type of the content */
    type: "MOVIE" | "TVSERIES";
    /** Title of the content */
    title: string;
    /** Description of the content */
    description: string;
    /** Release date of the content */
    releaseDate: string;
    /** Maturity rating of the content */
    maturityRating:
      | "G"
      | "PG"
      | "PG-13"
      | "R"
      | "NC-17"
      | "TV-Y"
      | "TV-PG"
      | "TV-14"
      | "TV-MA";
    /** Thumbnail image URL of the content */
    thumbnail: string;
    /** Banner image URL of the content */
    banner: string;
    /** Trailer video URL of the content */
    trailer: string;
    /** Average rating of the content */
    avgRating?: number;
    /** IMDB rating of the content */
    imdbRating?: number;
    /** Categories of the content */
    categories: UpdateCategoryDto[];
    /** Tags of the content */
    tags: UpdateTagDto[];
    /** Actors of the content */
    actors: UpdateActorDto[];
    /** Directors of the content */
    directors: UpdateDirectorDto[];
  };

  type CreateDirectorDto = {
    /** Name of the director */
    name: string;
    /** Birth date of the actor */
    dateOfBirth: string;
    /** Gender of the actor */
    gender: Record<string, any>;
    /** Biography of the actor */
    bio: string;
    /** Profile picture of the actor */
    profilePicture: string;
    /** Nationality of the actor */
    nationality: string;
  };

  type CreateEpisodeDto = {
    /** Episode number */
    episodeNumber: number;
    /** Episode duration in minutes */
    episodeDuration: number;
    /** Episode title */
    episodeTitle: string;
    /** List of video information */
    video: UpdateVideoDto;
  };

  type CreateEpisodeReviewDto = {
    /** Episode that was reviewed */
    contentReviewed: string;
    /** ID of the episode being reviewed */
    episodeId: string;
    /** Status of the review */
    status: "ACTIVE" | "BANNED";
  };

  type CreateFavoriteDto = {
    /** Content ID to be favorited */
    contentId: string;
  };

  type CreateMovieDto = {
    /** Duration of the movie in minutes */
    duration: number;
    /** Metadata of the movie */
    metaData: ContentDto;
    /** Video of the movie */
    video?: VideoDto;
  };

  type CreateNewsDto = {
    /** Title of the news article */
    title: string;
    /** Summary of the news article */
    summary: string;
    /** HTML content of the news article */
    content_html: string;
    /** Cover image URL of the news article */
    cover_image: string;
    /** Category of the news article */
    category: string[];
  };

  type CreateReportDto = {
    /** Type of the item being reported */
    type: "REVIEW" | "EPISODE_REVIEW" | "REVIEW_REPLY";
    /** ID of the review or episode review being reported */
    targetId: string;
    /** Reason for reporting */
    reason: "SPAM" | "HARASSMENT" | "INAPPROPRIATE_CONTENT" | "OTHER";
    /** Additional details about the report */
    details?: string;
  };

  type CreateReviewDto = {
    /** Content that was reviewed */
    contentReviewed: string;
    /** Rating given by the user */
    rating: number;
    /** Status of the review */
    status: "ACTIVE" | "BANNED";
    /** ID of the content being reviewed */
    contentId: string;
  };

  type CreateReviewReplyDto = {
    /** Content of the reply */
    content: string;
    /** ID of the review being replied to (must provide either reviewId or episodeReviewId) */
    reviewId?: string;
    /** ID of the episode review being replied to (must provide either reviewId or episodeReviewId) */
    episodeReviewId?: string;
    /** ID of the parent reply if replying to another reply */
    parentReplyId?: string;
  };

  type CreateSeasonDto = {
    /** Season number */
    seasonNumber: number;
    /** List of episode information */
    episodes: CreateEpisodeDto[];
  };

  type CreateTagDto = {
    /** Tag name */
    tagName: string;
  };

  type CreateTVSeriesDto = {
    /** List of season information */
    seasons: CreateSeasonDto[];
    /** Metadata about the TV series */
    metaData: CreateContentDto;
  };

  type CreateUserDto = {
    /** User name */
    name: string;
    /** User email */
    email: string;
    /** User admin status */
    isAdmin: boolean;
    /** User avatar URL */
    avatar?: string;
  };

  type CreateVideoDto = {
    /** Video URL */
    videoUrl: string;
    /** Video processing status */
    status: "PROCESSING" | "READY" | "FAILED";
    /** Thumbnail URL */
    thumbnailUrl: string;
    /** Sprite image URLs */
    sprites: string[];
    /** VTT file URLs */
    vttFiles: string[];
  };

  type CreateWatchListDto = {
    /** Content ID to add to watchlist */
    contentId: string;
  };

  type CreateWatchProgressDto = {
    /** ID of the video being watched */
    videoId: string;
    /** Duration watched in seconds */
    watchedDuration: number;
  };

  type DAUMetricDto = {
    day: string;
    users: number;
    trend: string;
  };

  type DeleteFavoriteDto = {
    /** List of Content IDs to be removed from favorites */
    contentIds: string[];
  };

  type DirectorControllerFindAllParams = {
    /** Search directors by name or nationality */
    search?: any;
    /** Sort order for directors */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type DirectorControllerFindOneParams = {
    /** Director ID */
    id: string;
  };

  type DirectorControllerRemoveParams = {
    /** Director ID */
    id: string;
  };

  type DirectorControllerUpdateParams = {
    /** Director ID */
    id: string;
  };

  type DirectorDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Name of the director */
    name: string;
    /** Birth date of the actor */
    dateOfBirth: string;
    /** Gender of the actor */
    gender: Record<string, any>;
    /** Biography of the actor */
    bio: string;
    /** Profile picture of the actor */
    profilePicture: string;
    /** Nationality of the actor */
    nationality: string;
  };

  type EpisodeDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Episode number */
    episodeNumber: number;
    /** Episode duration in minutes */
    episodeDuration: number;
    /** Episode title */
    episodeTitle: string;
    /** List of video information */
    video: VideoDto;
  };

  type EpisodeReviewControllerCheckReviewOwnerParams = {
    id: string;
  };

  type EpisodeReviewControllerDeleteReviewParams = {
    id: string;
  };

  type EpisodeReviewControllerFindAllParams = {
    /** Filter reviews by status (ACTIVE, BANNED). Default: ACTIVE */
    status?: any;
    /** Search reviews by content or user name */
    search?: any;
    /** Sort order for reviews */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type EpisodeReviewControllerFindOneParams = {
    id: string;
  };

  type EpisodeReviewControllerFindReviewsByUserIdParams = {
    /** Search reviews by content or user name */
    search?: any;
    /** Sort order for reviews */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type EpisodeReviewControllerGetReviewForEpisodeParams = {
    episodeId: string;
    /** Sort order for reviews */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type EpisodeReviewControllerUpdateReviewParams = {
    id: string;
  };

  type EpisodeReviewDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Episode that was reviewed */
    contentReviewed: string;
    /** ID of the episode being reviewed */
    episodeId: string;
    /** Name of the user who made the review */
    name: string;
    /** Avatar URL of the user who made the review */
    avatar: Record<string, any>;
    /** Status of the review */
    status: "ACTIVE" | "BANNED";
  };

  type EpisodeReviewDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: EpisodeReviewDto[];
    meta: PaginationMeta;
  };

  type EpisodeReviewDtoResponseDto = {
    statusCode: number;
    message: string;
    data: EpisodeReviewDto;
  };

  type FavoriteContentDto = {
    /** Total number of favorites for the content */
    totalFavorites: number;
    /** Indicates if the content is favorited by the user */
    isFavorited: boolean;
  };

  type FavoriteContentDtoResponseDto = {
    statusCode: number;
    message: string;
    data: FavoriteContentDto;
  };

  type FavoriteControllerGetFavoriteStatusParams = {
    contentId: string;
  };

  type FavoriteControllerRemoveFavoriteParams = {
    contentId: string;
  };

  type ForgotPasswordRequest = {
    /** User email to send OTP */
    email: string;
  };

  type LoginResponse = {
    /** User ID */
    id: string;
    /** User full name */
    name: string;
    /** User avatar URL */
    avatar: Record<string, any>;
    /** Is user an admin */
    isAdmin: boolean;
    /** Token details */
    token: TokenResponse;
  };

  type LoginResponseResponseDto = {
    statusCode: number;
    message: string;
    data: LoginResponse;
  };

  type MAUMetricDto = {
    month: string;
    users: number;
    trend: string;
    change: string;
  };

  type MovieControllerDeleteParams = {
    id: string;
  };

  type MovieControllerFindAllParams = {
    /** Search movies by title */
    search?: any;
    /** Sort order for movies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type MovieControllerFindOneParams = {
    id: string;
  };

  type MovieControllerGetMoviesByCategoryParams = {
    categoryId: string;
    /** Search movies by title, description, etc. */
    search?: string;
    /** Sort order for movies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type MovieControllerGetNewReleaseMoviesParams = {
    /** Search movies by title */
    search?: any;
    /** Sort order for movies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type MovieControllerGetRecommendationsByMovieIdParams = {
    movieId: string;
    /** Search movies by title */
    search?: any;
    /** Sort order for movies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type MovieControllerGetTrendingMoviesParams = {
    /** Search movies by title */
    search?: any;
    /** Sort order for movies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type MovieControllerUpdateParams = {
    id: string;
  };

  type MovieDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Duration of the movie in minutes */
    duration: number;
    /** Metadata of the movie */
    metaData: ContentDto;
    /** Video of the movie */
    video?: VideoDto;
  };

  type MovieDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: MovieDto[];
    meta: PaginationMeta;
  };

  type MovieDtoResponseDto = {
    statusCode: number;
    message: string;
    data: MovieDto;
  };

  type NewsControllerDeleteParams = {
    id: string;
  };

  type NewsControllerFindAllParams = {
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type NewsControllerFindNewsRelatedParams = {
    id: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type NewsControllerFindOneParams = {
    id: string;
  };

  type NewsControllerUpdateParams = {
    id: string;
  };

  type NewsDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Title of the news article */
    title: string;
    /** Summary of the news article */
    summary: string;
    /** HTML content of the news article */
    content_html: string;
    /** Cover image URL of the news article */
    cover_image: string;
    /** Category of the news article */
    category: string[];
    /** Name of the user who made the review */
    name: string;
    /** Avatar URL of the user who made the review */
    avatar: Record<string, any>;
  };

  type NewsDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: NewsDto[];
    meta: PaginationMeta;
  };

  type NewsDtoResponseDto = {
    statusCode: number;
    message: string;
    data: NewsDto;
  };

  type OTPResponse = {
    otpExpiryMinutes: number;
  };

  type OTPResponseResponseDto = {
    statusCode: number;
    message: string;
    data: OTPResponse;
  };

  type PaginatedTrendingDataDto = {
    data: TrendingItemDto[];
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };

  type PaginatedViewStatsDto = {
    data: ViewStatsItemDto[];
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };

  type PaginationMeta = {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };

  type ProfileResponse = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** User name */
    name: string;
    /** User email */
    email: string;
    /** User avatar URL */
    avatar: string;
    /** Authentication provider */
    provider: string;
    /** Is email verified */
    isEmailVerified: boolean;
    /** User gender */
    gender: "MALE" | "FEMALE" | "OTHER";
    /** User date of birth */
    dateOfBirth: Record<string, any>;
    /** User address */
    address: Record<string, any>;
    /** User phone number */
    phoneNumber: Record<string, any>;
  };

  type RecentActivityDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** ID of the user who performed the action */
    userId: string;
    /** Name of the user who performed the action */
    userName: string;
    /** Action performed */
    action: Record<string, any>;
    /** Description of the action */
    description: string;
  };

  type RecentActivityDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: RecentActivityDto[];
    meta: PaginationMeta;
  };

  type RecommendationDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Full content metadata including description, release date, rating, etc. */
    metaData: ContentDto;
  };

  type RecommendationDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: RecommendationDto[];
    meta: PaginationMeta;
  };

  type RegisterRequest = {
    /** User full name */
    name: string;
    /** User email address */
    email: string;
    /** User password */
    password: string;
    /** User date of birth */
    dateOfBirth?: string;
    /** User gender */
    gender?: "MALE" | "FEMALE" | "OTHER";
  };

  type RegisterWithOtpRequest = {
    /** User full name */
    name: string;
    /** User email address */
    email: string;
    /** User password */
    password: string;
    /** User date of birth */
    dateOfBirth?: string;
    /** User gender */
    gender?: "MALE" | "FEMALE" | "OTHER";
    /** OTP code (6 digits) */
    otp: string;
  };

  type ReportControllerApproveItemParams = {
    type: string;
    id: string;
  };

  type ReportControllerBanItemParams = {
    type: string;
    id: string;
  };

  type ReportControllerDeleteReportParams = {
    id: string;
  };

  type ReportControllerFindAllParams = {
    /** Filter reports by status (PENDING, APPROVED, REJECTED) */
    status?: any;
    /** Search reports by reporter name, reason, type, or status */
    search?: any;
    /** Sort order for reports */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ReportControllerFindOneParams = {
    id: string;
  };

  type ReportControllerRejectItemParams = {
    type: string;
    id: string;
  };

  type ReportControllerUnbanItemParams = {
    type: string;
    id: string;
  };

  type ReportDto = {
    /** ID of the report */
    id: string;
    /** Type of the item being reported */
    type: "REVIEW" | "EPISODE_REVIEW" | "REVIEW_REPLY";
    /** ID of the reported item */
    targetId: string;
    /** Reason for reporting */
    reason: "SPAM" | "HARASSMENT" | "INAPPROPRIATE_CONTENT" | "OTHER";
    /** Additional details */
    details: Record<string, any>;
    /** Status of the report */
    status: "PENDING" | "APPROVED" | "REJECTED";
    /** Reporter information */
    reporter: Record<string, any>;
    /** The reported review (if type is REVIEW) */
    review: ReviewDto;
    /** The reported episode review (if type is EPISODE_REVIEW) */
    episodeReview: EpisodeReviewDto;
    /** Creation date */
    createdAt: string;
  };

  type ReportDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: ReportDto[];
    meta: PaginationMeta;
  };

  type ReportDtoResponseDto = {
    statusCode: number;
    message: string;
    data: ReportDto;
  };

  type ResetPasswordRequest = {
    /** User email */
    email: string;
    /** OTP code (6 digits) */
    otp: string;
    /** New password */
    newPassword: string;
  };

  type ReviewControllerCheckReviewOwnerParams = {
    id: string;
  };

  type ReviewControllerDeleteReviewParams = {
    id: string;
  };

  type ReviewControllerFindAllParams = {
    /** Filter reviews by status (ACTIVE, BANNED). Default: ACTIVE */
    status?: any;
    /** Search reviews by content or user name */
    search?: any;
    /** Sort order for reviews */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ReviewControllerFindOneParams = {
    id: string;
  };

  type ReviewControllerFindReviewsByUserIdParams = {
    /** Search reviews by content or user name */
    search?: any;
    /** Sort order for reviews */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ReviewControllerGetReviewForContentParams = {
    contentId: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ReviewControllerUpdateReviewParams = {
    id: string;
  };

  type ReviewDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Content that was reviewed */
    contentReviewed: string;
    /** Rating given by the user */
    rating: number;
    /** Status of the review */
    status: "ACTIVE" | "BANNED";
    /** ID of the content being reviewed */
    contentId: string;
    /** Name of the user who made the review */
    name: string;
    /** Avatar URL of the user who made the review */
    avatar: Record<string, any>;
    /** ID of the user who made the review */
    userId: string;
  };

  type ReviewDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: ReviewDto[];
    meta: PaginationMeta;
  };

  type ReviewDtoResponseDto = {
    statusCode: number;
    message: string;
    data: ReviewDto;
  };

  type ReviewReplyControllerCheckReplyOwnerParams = {
    id: string;
  };

  type ReviewReplyControllerDeleteReplyParams = {
    id: string;
  };

  type ReviewReplyControllerFindAllParams = {
    /** Filter replies by status (ACTIVE, BANNED). Default: ACTIVE */
    status?: any;
    /** Search replies by content */
    search?: any;
    /** Sort order for replies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ReviewReplyControllerFindOneParams = {
    id: string;
  };

  type ReviewReplyControllerFindRepliesByUserIdParams = {
    /** Search replies by content */
    search?: any;
    /** Sort order for replies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ReviewReplyControllerGetRepliesForEpisodeReviewParams = {
    episodeReviewId: string;
    /** Parent reply ID to get nested replies. Use "null" to get only top-level replies */
    parentReplyId?: string;
    /** Sort order for replies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ReviewReplyControllerGetRepliesForReviewParams = {
    reviewId: string;
    /** Parent reply ID to get nested replies. Use "null" to get only top-level replies */
    parentReplyId?: string;
    /** Sort order for replies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ReviewReplyControllerGetReplyCountForEpisodeReviewParams = {
    episodeReviewId: string;
  };

  type ReviewReplyControllerGetReplyCountForReplyParams = {
    replyId: string;
  };

  type ReviewReplyControllerGetReplyCountForReviewParams = {
    reviewId: string;
  };

  type ReviewReplyControllerUpdateReplyParams = {
    id: string;
  };

  type ReviewReplyDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Content of the reply */
    content: string;
    /** Status of the reply */
    status: "ACTIVE" | "BANNED";
    /** ID of the review being replied to */
    reviewId: Record<string, any>;
    /** ID of the episode review being replied to */
    episodeReviewId: Record<string, any>;
    /** Name of the user who made the reply */
    name: string;
    /** Avatar URL of the user who made the reply */
    avatar: Record<string, any>;
    /** ID of the user who made the reply */
    userId: string;
    /** ID of the parent reply if this is a nested reply */
    parentReplyId: Record<string, any>;
    /** Number of child replies */
    replyCount: number;
  };

  type ReviewReplyDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: ReviewReplyDto[];
    meta: PaginationMeta;
  };

  type ReviewReplyDtoResponseDto = {
    statusCode: number;
    message: string;
    data: ReviewReplyDto;
  };

  type SeasonDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Season number */
    seasonNumber: number;
    /** Total number of episodes in the season */
    totalEpisodes: number;
    /** List of episode information */
    episodes: EpisodeDto[];
  };

  type SocialLoginRequest = {
    /** Social provider */
    provider: "google" | "facebook";
    /** Access token from social provider */
    accessToken: string;
  };

  type TagControllerFindAllParams = {
    /** Search tags by name */
    search?: any;
    /** Sort order for tags */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type TagControllerFindOneParams = {
    /** Tag ID */
    id: string;
  };

  type TagControllerRemoveParams = {
    /** Tag ID */
    id: string;
  };

  type TagControllerUpdateParams = {
    /** Tag ID */
    id: string;
  };

  type TagDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Tag name */
    tagName: string;
  };

  type TokenRequest = {
    /** jwt token */
    refreshToken: string;
  };

  type TokenResponse = {
    /** Access token */
    accessToken: string;
    /** Refresh token */
    refreshToken: string;
  };

  type TokenResponseResponseDto = {
    statusCode: number;
    message: string;
    data: TokenResponse;
  };

  type TrendingItemDto = {
    id: string;
    title: string;
    poster: string;
    rating: number;
    views: number;
    trend: string;
    change: string;
    engagement: number;
  };

  type TVSeriesCategory = {
    /** Category ID */
    id: string;
    /** Category Name */
    categoryName: string;
    /** Number of TV series in this category */
    tvSeriesCount: number;
  };

  type TVSeriesCategoryPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: TVSeriesCategory[];
    meta: PaginationMeta;
  };

  type TvSeriesControllerFindAllParams = {
    /** Filter movies by date range (e.g., {"range":"last_month"}) */
    filter?: any;
    /** Search movies by title */
    search?: any;
    /** Sort order for movies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type TvSeriesControllerFindOneParams = {
    id: string;
  };

  type TvSeriesControllerGetRecommendationsParams = {
    id: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type TvSeriesControllerGetTrendingSeriesParams = {
    /** Search TV series by title */
    search?: any;
    /** Sort order for TV series */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type TvSeriesControllerGetTvSeriesByCategoryIdParams = {
    categoryId: string;
    /** Search TV series by title */
    search?: any;
    /** Sort order for TV series */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type TvSeriesControllerGetTvSeriesWithNewEpisodesParams = {
    /** Search TV series by title */
    search?: any;
    /** Sort order for TV series */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type TvSeriesControllerRemoveParams = {
    id: string;
  };

  type TvSeriesControllerUpdateParams = {
    id: string;
  };

  type TVSeriesDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Metadata about the TV series */
    metaData: ContentDto;
    /** List of season information */
    seasons: SeasonDto[];
  };

  type TVSeriesDtoResponseDto = {
    statusCode: number;
    message: string;
    data: TVSeriesDto;
  };

  type TVSeriesSummaryDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Metadata about the TV series */
    metaData: ContentDto;
    /** Total number of seasons in the TV series */
    totalSeasons: number;
  };

  type TVSeriesSummaryDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: TVSeriesSummaryDto[];
    meta: PaginationMeta;
  };

  type TVSeriesWithNewEpisode = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Metadata about the TV series */
    metaData: ContentDto;
    /** Latest episode information */
    latestEpisode: EpisodeDto;
  };

  type TVSeriesWithNewEpisodePaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: TVSeriesWithNewEpisode[];
    meta: PaginationMeta;
  };

  type UpdateActorDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Name of the actor */
    name: string;
    /** Birth date of the actor */
    dateOfBirth: string;
    /** Gender of the actor */
    gender: "MALE" | "FEMALE" | "OTHER";
    /** Biography of the actor */
    bio: string;
    /** Profile picture of the actor */
    profilePicture: string;
    /** Nationality of the actor */
    nationality: string;
  };

  type UpdateAvatarRequest = {
    /** Avatar URL */
    avatarUrl: string;
  };

  type UpdateCategoryDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Name of the category */
    categoryName: string;
  };

  type UpdateContentDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Type of the content */
    type: "MOVIE" | "TVSERIES";
    /** Title of the content */
    title: string;
    /** Description of the content */
    description: string;
    /** Release date of the content */
    releaseDate: string;
    /** Maturity rating of the content */
    maturityRating:
      | "G"
      | "PG"
      | "PG-13"
      | "R"
      | "NC-17"
      | "TV-Y"
      | "TV-PG"
      | "TV-14"
      | "TV-MA";
    /** Thumbnail image URL of the content */
    thumbnail: string;
    /** Banner image URL of the content */
    banner: string;
    /** Trailer video URL of the content */
    trailer: string;
    /** Average rating of the content */
    avgRating?: number;
    /** View count of the content */
    viewCount?: number;
    /** IMDB rating of the content */
    imdbRating?: number;
    /** Categories of the content */
    categories: UpdateCategoryDto[];
    /** Tags of the content */
    tags: UpdateTagDto[];
    /** Actors of the content */
    actors: UpdateActorDto[];
    /** Directors of the content */
    directors: UpdateDirectorDto[];
  };

  type UpdateDirectorDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Name of the director */
    name: string;
    /** Birth date of the actor */
    dateOfBirth: string;
    /** Gender of the actor */
    gender: Record<string, any>;
    /** Biography of the actor */
    bio: string;
    /** Profile picture of the actor */
    profilePicture: string;
    /** Nationality of the actor */
    nationality: string;
  };

  type UpdateEpisodeDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Episode number */
    episodeNumber: number;
    /** Episode duration in minutes */
    episodeDuration: number;
    /** Episode title */
    episodeTitle: string;
    /** List of video information */
    video: UpdateVideoDto;
  };

  type UpdateEpisodeReviewDto = {
    /** Episode that was reviewed */
    contentReviewed: string;
    /** ID of the episode being reviewed */
    episodeId: string;
    /** Status of the review */
    status: "ACTIVE" | "BANNED";
  };

  type UpdateMovieDto = {
    /** Duration of the movie in minutes */
    duration: number;
    /** Metadata of the movie */
    metaData: ContentDto;
    /** Video of the movie */
    video?: VideoDto;
  };

  type UpdateNewsDto = {
    /** Title of the news article */
    title: string;
    /** Summary of the news article */
    summary: string;
    /** HTML content of the news article */
    content_html: string;
    /** Cover image URL of the news article */
    cover_image: string;
    /** Category of the news article */
    category: string[];
  };

  type UpdateProfileRequest = {
    /** User name */
    name: string;
    /** User avatar URL */
    avatar: string;
    /** User gender */
    gender: "MALE" | "FEMALE" | "OTHER";
    /** User date of birth */
    dateOfBirth: Record<string, any>;
    /** User address */
    address: Record<string, any>;
    /** User phone number */
    phoneNumber: Record<string, any>;
  };

  type UpdateReviewDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Content that was reviewed */
    contentReviewed: string;
    /** Rating given by the user */
    rating: number;
    /** Status of the review */
    status: "ACTIVE" | "BANNED";
    /** ID of the content being reviewed */
    contentId: string;
  };

  type UpdateReviewReplyDto = {
    /** Content of the reply */
    content: string;
  };

  type UpdateSeasonDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Season number */
    seasonNumber: number;
    /** List of episode information */
    episodes: UpdateEpisodeDto[];
  };

  type UpdateTagDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Tag name */
    tagName: string;
  };

  type UpdateTVSeriesDto = {
    /** List of season information */
    seasons: UpdateSeasonDto[];
    /** Metadata about the TV series */
    metaData: UpdateContentDto;
  };

  type UpdateUserDto = {
    /** User name */
    name: string;
    /** User email */
    email: string;
    /** User admin status */
    isAdmin: boolean;
    /** User status */
    status: "ACTIVATED" | "DEACTIVATED" | "BANNED";
  };

  type UpdateUserInfoDto = {
    /** User name */
    name: string;
    /** User email */
    email: string;
    /** User admin status */
    isAdmin: boolean;
    /** User avatar URL */
    avatar?: string;
    /** User date of birth */
    dateOfBirth?: string;
    /** User gender */
    gender?: "MALE" | "FEMALE" | "OTHER";
    /** User phone number */
    phoneNumber?: string;
    /** User address */
    address?: string;
  };

  type UpdateVideoDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Video URL */
    videoUrl: string;
    /** Video processing status */
    status: "PROCESSING" | "READY" | "FAILED";
    /** Thumbnail URL */
    thumbnailUrl: string;
    /** Sprite image URLs */
    sprites: string[];
    /** VTT file URLs */
    vttFiles: string[];
  };

  type UpdateWatchProgressDto = {
    /** Duration watched in seconds */
    watchedDuration?: number;
    /** Whether the content has been completed */
    isCompleted?: boolean;
  };

  type UploadAvatarResponse = {
    /** New avatar URL */
    avatarUrl: string;
  };

  type UserControllerBanUserParams = {
    id: string;
  };

  type UserControllerDeleteParams = {
    id: string;
  };

  type UserControllerFindAllParams = {
    /** Search term for users */
    search?: string;
    /** Sort order for users */
    sort?: any;
    /** Limit number of users per page */
    limit?: any;
    /** Page number for pagination */
    page?: any;
  };

  type UserControllerGetUserDetailParams = {
    id: string;
  };

  type UserControllerUnbanUserParams = {
    id: string;
  };

  type UserControllerUpdateParams = {
    id: string;
  };

  type UserControllerUpdateUserInfoParams = {
    id: string;
  };

  type UserDetailDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** User name */
    name: string;
    /** User email */
    email: string;
    /** User admin status */
    isAdmin: boolean;
    /** User status */
    status: "ACTIVATED" | "DEACTIVATED" | "BANNED";
    /** Is user banned */
    isBanned: boolean;
    /** User avatar URL */
    avatar?: string;
    /** Ban reason */
    banReason?: string;
    /** Banned until date */
    bannedUntil?: string;
    /** User date of birth */
    dateOfBirth?: string;
    /** User gender */
    gender?: "MALE" | "FEMALE" | "OTHER";
    /** User phone number */
    phoneNumber?: string;
    /** User address */
    address?: string;
    /** Email verified status */
    isEmailVerified: boolean;
  };

  type UserDetailDtoResponseDto = {
    statusCode: number;
    message: string;
    data: UserDetailDto;
  };

  type UserDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** User name */
    name: string;
    /** User email */
    email: string;
    /** User admin status */
    isAdmin: boolean;
    /** User status */
    status: "ACTIVATED" | "DEACTIVATED" | "BANNED";
    /** Is user banned */
    isBanned: boolean;
    /** User avatar URL */
    avatar?: string;
    /** Ban reason */
    banReason?: string;
    /** Banned until date */
    bannedUntil?: string;
  };

  type UserDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: UserDto[];
    meta: PaginationMeta;
  };

  type UserDtoResponseDto = {
    statusCode: number;
    message: string;
    data: UserDto;
  };

  type UserMetricsDto = {
    dau: DAUMetricDto[];
    mau: MAUMetricDto[];
    churnRate: ChurnRateMetricDto[];
  };

  type UserStatsDto = {
    summary: UserSummaryDto;
    userMetrics: UserMetricsDto;
  };

  type UserSummaryDto = {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    churnRate: number;
  };

  type VideoControllerDeleteParams = {
    id: string;
  };

  type VideoControllerFindAllParams = {
    /** Search videos by title */
    search?: any;
    /** Sort order for videos */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type VideoControllerFindOneParams = {
    id: string;
  };

  type VideoControllerUpdateParams = {
    id: string;
  };

  type VideoDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** Video URL */
    videoUrl: string;
    /** Video processing status */
    status: "PROCESSING" | "READY" | "FAILED";
    /** Thumbnail URL */
    thumbnailUrl: string;
    /** Sprite image URLs */
    sprites: string[];
    /** VTT file URLs */
    vttFiles: string[];
  };

  type VideoDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: VideoDto[];
    meta: PaginationMeta;
  };

  type VideoDtoResponseDto = {
    statusCode: number;
    message: string;
    data: VideoDto;
  };

  type ViewStatsItemDto = {
    id: string;
    title: string;
    name: string;
    views: number;
    trending: string;
    change: string;
    percentage: number;
  };

  type WatchListControllerCheckInWatchListByMovieIdParams = {
    /** Movie ID or TVSeries ID to check */
    movieId: string;
    /** Type of content (MOVIE or TVSERIES) */
    type: "MOVIE" | "TVSERIES";
  };

  type WatchListControllerCheckInWatchListParams = {
    /** Content ID to check */
    contentId: string;
  };

  type WatchListControllerGetFavouriteCountParams = {
    /** Content ID */
    contentId: string;
  };

  type WatchListControllerGetUserWatchListParams = {
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type WatchListControllerRemoveFromWatchListParams = {
    /** Content ID to remove */
    contentId: string;
  };

  type WatchProgressControllerDeleteWatchProgressParams = {
    videoId: string;
  };

  type WatchProgressControllerGetAllWatchProgressParams = {
    /** Filter by completion status */
    isCompleted?: boolean;
    /** Search by content title */
    search?: any;
    /** Sort order */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type WatchProgressControllerGetResumeDataParams = {
    videoId: string;
  };

  type WatchProgressControllerGetWatchHistoryParams = {
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type WatchProgressControllerGetWatchProgressParams = {
    videoId: string;
  };

  type WatchProgressControllerMarkAsCompletedParams = {
    videoId: string;
  };

  type WatchProgressControllerUpdateProgressParams = {
    videoId: string;
  };

  type WatchProgressDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** ID of the video being watched */
    videoId: string;
    /** Title of the content being watched */
    contentTitle: Record<string, any>;
    /** Thumbnail of the video */
    contentThumbnail: Record<string, any>;
    /** Last time the content was watched */
    lastWatched: Record<string, any>;
    /** Duration watched in seconds */
    watchedDuration: number;
    /** Whether the content has been completed */
    isCompleted: boolean;
    /** Movie ID (if the video belongs to a movie) */
    movieId: Record<string, any>;
    /** Episode ID (if the video belongs to an episode) */
    episodeId: Record<string, any>;
    /** TV Series ID (if the video belongs to an episode) */
    tvSeriesId: Record<string, any>;
    /** Episode number (if the video belongs to an episode) */
    episodeNumber: Record<string, any>;
    /** Season number (if the video belongs to an episode) */
    seasonNumber: Record<string, any>;
    /** Full content metadata including description, release date, rating, etc. */
    metadata: Record<string, any>;
    /** Duration of the content in seconds (for movies) */
    duration: Record<string, any>;
    /** Video information */
    video: Record<string, any>;
  };

  type WatchProgressDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: WatchProgressDto[];
    meta: PaginationMeta;
  };

  type WatchProgressDtoResponseDto = {
    statusCode: number;
    message: string;
    data: WatchProgressDto;
  };
}
