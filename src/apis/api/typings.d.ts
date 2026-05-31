declare namespace API {
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

  type ActorsControllerDeleteActorParams = {
    /** Actor ID */
    id: string;
  };

  type ActorsControllerGetActorByIdParams = {
    /** Actor ID */
    id: string;
  };

  type ActorsControllerGetActorsParams = {
    /** Search actors by name or nationality */
    search?: any;
    /** Sort order for actors */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type ActorsControllerGetTopActorsParams = {
    limit?: number;
    page?: number;
  };

  type ActorsControllerSearchActorsParams = {
    q: string;
  };

  type ActorsControllerUpdateActorParams = {
    /** Actor ID */
    id: string;
  };

  type AdminBanUserDto = {
    /** Duration in seconds (omit for permanent ban) */
    durationSec?: number;
    /** Reason for the ban */
    reason?: string;
  };

  type AdminCloseRoomDto = {
    /** Reason for closing the room */
    reason?: string;
  };

  type AnalyticsControllerGetCategoriesStatsParams = {
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type AnalyticsControllerGetChurnPredictionParams = {
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type AnalyticsControllerGetMoviesStatsParams = {
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type AnalyticsControllerGetTrendingMoviesParams = {
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type AnalyticsControllerGetTrendingTVSeriesParams = {
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type AnalyticsControllerGetTVSeriesStatsParams = {
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type AnalyticsControllerGetViewForecastParams = {
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type AuditLogControllerGetLogsParams = {
    /** Search audit logs by user ID or action */
    search?: any;
    /** Sort order for audit logs */
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
    /** Session ID to group actions into transactions for recommendation engine */
    sessionId: string;
    /** Action performed */
    action: string;
    /** Type of resource the action was performed on */
    resourceType?: string;
    /** ID of the resource the action was performed on */
    resourceId?: string;
    /** Signal weight for recommendation engine (2=strong, 1=medium, -1=negative, 0=ignored) */
    signalWeight: number;
    /** Action-specific extra data */
    metadata?: Record<string, any>;
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

  type BanItemDto = {
    type: "REVIEW" | "EPISODE_REVIEW" | "REVIEW_REPLY";
    id: string;
  };

  type BanUserDto = {
    /** Reason for banning user */
    banReason: string;
    /** Duration of ban in days */
    durationDays: number;
  };

  type BooleanResponseDto = {
    statusCode: number;
    message: string;
    data: boolean;
  };

  type CategoriesControllerDeleteCategoryParams = {
    /** Category ID */
    id: string;
  };

  type CategoriesControllerGetCategoriesParams = {
    /** Search categories by name */
    search?: any;
    /** Sort order for categories */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type CategoriesControllerGetCategoryByIdParams = {
    /** Category ID */
    id: string;
  };

  type CategoriesControllerSearchCategoriesParams = {
    /** Search categories by name */
    q: string;
  };

  type CategoriesControllerUpdateCategoryParams = {
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

  type CheckSubscribeDto = {
    /** isActive */
    isActive: boolean;
    /** plan */
    plan: string;
    /** expiresAt */
    expiresAt: string;
  };

  type CheckSubscribeDtoResponseDto = {
    statusCode: number;
    message: string;
    data: CheckSubscribeDto;
  };

  type ChurnFeatureDto = {
    userId: string;
    accountAgeDays: number;
    daysSinceLastActivity: number;
    watchProgressCount30d: number;
    watchedDuration30d: number;
    completedVideos30d: number;
    watchlistAdds30d: number;
    favoriteAdds30d: number;
    reviews30d: number;
    auditEvents30d: number;
  };

  type ChurnPredictionItemDto = {
    userId: string;
    name: string;
    email: Record<string, any>;
    churnProbability: number;
    returnProbability: number;
    riskLevel: "high" | "medium" | "low";
    features: ChurnFeatureDto;
  };

  type ChurnPredictionItemDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: ChurnPredictionItemDto[];
    meta: PaginationMeta;
  };

  type ChurnRateMetricDto = {
    month: string;
    rate: number;
    trend: "up" | "down";
  };

  type ClearKeyKeyDto = {
    /** JSON Web Key type */
    kty: string;
    /** Base64url encoded Key ID */
    kid: string;
    /** Base64url encoded content decryption key */
    k: string;
  };

  type ClearKeyLicenseRequestDto = {
    /** Array of Key IDs (base64url or hex) from DASH manifest */
    kids: string[];
    /** Video ID */
    videoId: string;
  };

  type ClearKeyLicenseResponseDto = {
    keys: ClearKeyKeyDto[];
    type: string;
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
    /** Access tier of the content */
    accessTier?: "BASIC" | "PREMIUM";
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

  type ContentsControllerDeleteContentParams = {
    id: string;
  };

  type ContentsControllerGetContentByIdParams = {
    id: string;
  };

  type ContentsControllerGetContentsParams = {
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

  type ContentsControllerIncreaseViewCountParams = {
    id: string;
  };

  type ContentsControllerUpdateContentParams = {
    id: string;
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
    /** Access tier of the content */
    accessTier?: "BASIC" | "PREMIUM";
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
    gender: string;
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

  type CreateNewsBySessionDto = {
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

  type CreateRoomRequest = {
    /** Video ID for the watch party */
    videoId: string;
    /** Display title for the room */
    title: string;
    /** Optional password to restrict joins */
    password?: string;
    /** Whether the room is discoverable in the public rooms list (default true) */
    isPublic?: boolean;
  };

  type CreateRoomResponse = {
    roomId: string;
    inviteCode: string;
  };

  type CreateRoomResponseResponseDto = {
    statusCode: number;
    message: string;
    data: CreateRoomResponse;
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
    /** Whether the video contains violent scenes */
    isViolent: Record<string, any>;
    /** Overall violence score (0.0 to 1.0) */
    violenceScore: Record<string, any>;
    /** Detected violence coordinates by frame */
    violentSegments: Record<string, any>;
    /** Whether the video contains nude/sexy scenes */
    isNude: Record<string, any>;
    /** Overall nudity score (0.0 to 1.0) */
    nudityScore: Record<string, any>;
    /** Detected nudity coordinates by frame */
    nuditySegments: Record<string, any>;
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
    trend: "up" | "down";
  };

  type DeleteFavoriteDto = {
    /** List of content IDs to remove from favorites */
    contentIds: string[];
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
    gender: string;
    /** Biography of the actor */
    bio: string;
    /** Profile picture of the actor */
    profilePicture: string;
    /** Nationality of the actor */
    nationality: string;
  };

  type DirectorsControllerDeleteDirectorParams = {
    /** Director ID */
    id: string;
  };

  type DirectorsControllerGetDirectorByIdParams = {
    /** Director ID */
    id: string;
  };

  type DirectorsControllerGetDirectorsParams = {
    /** Search directors by name or nationality */
    search?: any;
    /** Sort order for directors */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type DirectorsControllerSearchDirectorsParams = {
    /** Search directors by name or nationality */
    q: string;
  };

  type DirectorsControllerUpdateDirectorParams = {
    /** Director ID */
    id: string;
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

  type EpisodesControllerGetEpisodeByIdParams = {
    id: string;
  };

  type FavoriteControllerGetFavoriteStatusParams = {
    contentId: string;
  };

  type FavoriteControllerRemoveFavoriteParams = {
    contentId: string;
  };

  type FavoriteStatusDto = {
    /** Total number of favorites for the content */
    totalFavorites: number;
    /** Indicates if the content is favorited by the user */
    isFavorited: boolean;
  };

  type FavoriteStatusDtoResponseDto = {
    statusCode: number;
    message: string;
    data: FavoriteStatusDto;
  };

  type ForgotPasswordRequest = {
    /** User email to send OTP */
    email: string;
  };

  type InformationSubscribeDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Creation date of the entity */
    createdAt: string;
    /** Last update date of the entity */
    updatedAt: string;
    /** userId */
    userId: string;
    /** planId */
    planId: string;
    status: "active" | "expired" | "cancelled";
    /** plan name */
    planName: string;
    /** startsAt */
    startsAt: string;
    /** expiresAt */
    expiresAt: string;
    /** autoRenew */
    autoRenew: boolean;
    /** paymentId */
    paymentId: Record<string, any>;
  };

  type InformationSubscribeDtoResponseDto = {
    statusCode: number;
    message: string;
    data: InformationSubscribeDto;
  };

  type InitiatePaymentDto = {
    /** Subscription plan to purchase */
    plan: "basic" | "premium";
  };

  type InitiatePaymentResponseDto = {
    /** VNPAY checkout URL — redirect the user to this URL to complete payment */
    paymentUrl: string;
    /** Internal order code for tracking this payment */
    orderCode: string;
    /** Amount to be charged in VND (smallest unit) */
    amount: number;
    /** Subscription plan being purchased */
    plan: "basic" | "premium";
    /** Idempotency key used to deduplicate this request */
    idempotencyKey: string;
  };

  type InitiatePaymentResponseDtoResponseDto = {
    statusCode: number;
    message: string;
    data: InitiatePaymentResponseDto;
  };

  type InviteLookupResponse = {
    roomId: string;
    title: string;
    videoId: string;
    requirePassword: boolean;
    memberCount: number;
    maxMembers: number;
  };

  type InviteLookupResponseResponseDto = {
    statusCode: number;
    message: string;
    data: InviteLookupResponse;
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
    trend: "up" | "down";
    change: string;
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

  type MoviesControllerDeleteMovieParams = {
    id: string;
  };

  type MoviesControllerGetMovieByIdParams = {
    id: string;
  };

  type MoviesControllerGetMoviesByCategoryParams = {
    categoryId: string;
    /** Search movies by title, description, etc. */
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type MoviesControllerGetMoviesParams = {
    /** Search movies by title */
    search?: any;
    /** Sort order for movies */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type MoviesControllerGetNewReleaseMoviesParams = {
    /** Search movies by title */
    search?: any;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type MoviesControllerGetRecommendationsByMovieIdParams = {
    movieId: string;
    /** Search movies by title */
    search?: any;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type MoviesControllerGetTrendingMoviesParams = {
    /** Search movies by title */
    search?: any;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type MoviesControllerUpdateMovieParams = {
    id: string;
  };

  type NewsControllerDeleteNewsParams = {
    id: string;
  };

  type NewsControllerGetNewsByIdParams = {
    id: string;
  };

  type NewsControllerGetNewsParams = {
    /** Search news by title/content */
    search?: any;
    /** Sort order for news */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type NewsControllerGetRelatedNewsParams = {
    newsId: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type NewsControllerUpdateNewsParams = {
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
    /** Name of the news author */
    author_name: string;
    /** Avatar URL of the news author */
    author_avatar: Record<string, any>;
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

  type ObjectResponseDto = {
    statusCode: number;
    message: string;
    data: Record<string, any>;
  };

  type OTPResponse = {
    otpExpiryMinutes: number;
  };

  type OTPResponseResponseDto = {
    statusCode: number;
    message: string;
    data: OTPResponse;
  };

  type PaginationMeta = {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };

  type PaymentControllerGetByIdParams = {
    id: string;
  };

  type PaymentControllerGetHistoryParams = {
    /** Items per page (max 100) */
    limit?: number;
    /** Page number (1-indexed) */
    page?: number;
  };

  type PaymentDetailDto = {
    /** Payment UUID */
    id: string;
    /** Owner user UUID */
    userId: string;
    /** Linked subscription UUID (populated after saga completes) */
    subscriptionId?: string;
    /** Internal order code sent to VNPAY */
    orderCode: string;
    /** VNPAY transaction number (set after payment is confirmed) */
    vnpayTxnNo?: string;
    /** Charge amount in VND */
    amount: number;
    /** Currency code */
    currency: string;
    /** Subscription plan */
    plan: "basic" | "premium";
    /** Whether this is a new purchase, upgrade, or renewal */
    paymentType: "new" | "upgrade" | "renewal";
    /** Subscription duration purchased (days) */
    durationDays: number;
    /** Current payment lifecycle status */
    status:
      | "pending"
      | "processing"
      | "completed"
      | "failed"
      | "expired"
      | "refunded";
    /** VNPAY response code (e.g. "00" = success) */
    vnpayResponseCode?: string;
    /** VNPAY response message */
    vnpayMessage?: string;
    /** Bank code used for payment */
    bankCode?: string;
    /** Card type used (ATM or VISA) */
    cardType?: string;
    /** Timestamp when VNPAY confirmed the payment */
    payDate?: string;
    /** Record creation timestamp */
    createdAt: string;
    /** Record last-update timestamp */
    updatedAt: string;
  };

  type PaymentDetailDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: PaymentDetailDto[];
    meta: PaginationMeta;
  };

  type PaymentDetailDtoResponseDto = {
    statusCode: number;
    message: string;
    data: PaymentDetailDto;
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
    action: string;
    /** Description of the action */
    description: string;
  };

  type RecentActivityDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: RecentActivityDto[];
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

  type ReportControllerApproveParams = {
    id: string;
  };

  type ReportControllerDeleteParams = {
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

  type ReportControllerRejectParams = {
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

  type RoomListItemDto = {
    roomId: string;
    title: string;
    videoId: string;
    hostId: string;
    requirePassword: boolean;
    isPublic: boolean;
    memberCount: number;
    maxMembers: number;
    createdAt: number;
  };

  type RoomListResponse = {
    items: RoomListItemDto[];
    total: number;
  };

  type RoomListResponseResponseDto = {
    statusCode: number;
    message: string;
    data: RoomListResponse;
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
    /** Access token from social provider */
    accessToken: string;
  };

  type StreamingControllerGetDrmKeyInfoParams = {
    videoId: string;
  };

  type StreamingControllerGetFileAccessParams = {
    s3Key: string;
  };

  type StreamingControllerGetManifestUrlParams = {
    videoId: string;
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

  type TagDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: TagDto[];
    meta: PaginationMeta;
  };

  type TagDtoResponseDto = {
    statusCode: number;
    message: string;
    data: TagDto;
  };

  type TagsControllerDeleteTagParams = {
    /** Tag ID */
    id: string;
  };

  type TagsControllerGetTagByIdParams = {
    /** Tag ID */
    id: string;
  };

  type TagsControllerGetTagsParams = {
    /** Search tags by name */
    search?: any;
    /** Sort order for tags */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type TagsControllerSearchTagsParams = {
    /** Search tags by name */
    q: string;
  };

  type TagsControllerUpdateTagParams = {
    /** Tag ID */
    id: string;
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
    trend: "up" | "down";
    change: string;
    engagement: number;
  };

  type TrendingItemDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: TrendingItemDto[];
    meta: PaginationMeta;
  };

  type TVSeriesCategory = {
    /** Category ID */
    id: string;
    /** Category Name */
    categoryName: string;
    /** Number of TV series in this category */
    tvSeriesCount: number;
  };

  type TVSeriesCategoryResponseDto = {
    statusCode: number;
    message: string;
    data: TVSeriesCategory[];
  };

  type TvSeriesControllerDeleteTvSeriesParams = {
    id: string;
  };

  type TvSeriesControllerGetRelatedTvSeriesParams = {
    id: string;
    limit?: number;
    page?: number;
  };

  type TvSeriesControllerGetTrendingTvSeriesParams = {
    /** Search TV series by title */
    search?: any;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type TvSeriesControllerGetTvSeriesByCategoryParams = {
    categoryId: string;
    /** Search TV series by title */
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
  };

  type TvSeriesControllerGetTvSeriesByIdParams = {
    id: string;
  };

  type TvSeriesControllerGetTvSeriesParams = {
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
    sort?: string;
    limit?: number;
    page?: number;
  };

  type TvSeriesControllerUpdateTvSeriesParams = {
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
    /** Access tier of the content */
    accessTier?: "BASIC" | "PREMIUM";
    /** Categories of the content */
    categories: UpdateCategoryDto[];
    /** Tags of the content */
    tags: UpdateTagDto[];
    /** Actors of the content */
    actors: UpdateActorDto[];
    /** Directors of the content */
    directors: UpdateDirectorDto[];
  };

  type UpdateContentPreferencesDto = {
    /** Violence sensitivity level */
    violence: "off" | "moderate" | "strict";
    /** Nudity sensitivity level */
    nudity: "off" | "moderate" | "strict";
  };

  type UpdateDirectorDto = {
    /** Unique identifier of the entity */
    id: string;
    /** Name of the director */
    name: string;
    /** Birth date of the actor */
    dateOfBirth: string;
    /** Gender of the actor */
    gender: string;
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
    /** Name of the news author */
    author_name: string;
    /** Avatar URL of the news author */
    author_avatar: Record<string, any>;
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
    /** Whether the video contains violent scenes */
    isViolent: Record<string, any>;
    /** Overall violence score (0.0 to 1.0) */
    violenceScore: Record<string, any>;
    /** Detected violence coordinates by frame */
    violentSegments: Record<string, any>;
    /** Whether the video contains nude/sexy scenes */
    isNude: Record<string, any>;
    /** Overall nudity score (0.0 to 1.0) */
    nudityScore: Record<string, any>;
    /** Detected nudity coordinates by frame */
    nuditySegments: Record<string, any>;
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

  type UserStatsDtoResponseDto = {
    statusCode: number;
    message: string;
    data: UserStatsDto;
  };

  type UserSummaryDto = {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    churnRate: number;
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
    /** Whether the video contains violent scenes */
    isViolent: Record<string, any>;
    /** Overall violence score (0.0 to 1.0) */
    violenceScore: Record<string, any>;
    /** Detected violence coordinates by frame */
    violentSegments: Record<string, any>;
    /** Whether the video contains nude/sexy scenes */
    isNude: Record<string, any>;
    /** Overall nudity score (0.0 to 1.0) */
    nudityScore: Record<string, any>;
    /** Detected nudity coordinates by frame */
    nuditySegments: Record<string, any>;
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

  type VideosControllerDeleteVideoParams = {
    id: string;
  };

  type VideosControllerGetVideoByIdParams = {
    id: string;
  };

  type VideosControllerGetVideoParentContentParams = {
    id: string;
  };

  type VideosControllerGetVideosParams = {
    /** Search videos by title */
    search?: any;
    /** Sort order for videos */
    sort?: string;
    /** Number of items per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
  };

  type VideosControllerUpdateVideoParams = {
    id: string;
  };

  type ViewForecastDayDto = {
    day: string;
    views: number;
  };

  type ViewForecastItemDto = {
    contentId: string;
    title: string;
    contentType: string;
    historyViews: ViewForecastDayDto[];
    last7Avg: number;
    next7DaysViews: number[];
    totalForecast7d: number;
    predictedTrend: "up" | "down";
  };

  type ViewForecastItemDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: ViewForecastItemDto[];
    meta: PaginationMeta;
  };

  type ViewStatsItemDto = {
    id: string;
    title: string;
    name: string;
    views: number;
    trending: "up" | "down";
    change: string;
    percentage: number;
  };

  type ViewStatsItemDtoPaginatedResponseDto = {
    statusCode: number;
    message: string;
    data: ViewStatsItemDto[];
    meta: PaginationMeta;
  };

  type VnpayIpnResponseDto = {
    /** VNPAY result code — "00" means success, everything else is an error */
    RspCode: string;
    /** Human-readable result message */
    Message: string;
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

  type WatchPartyControllerAdminBanUserParams = {
    userId: string;
  };

  type WatchPartyControllerAdminCloseRoomParams = {
    id: string;
  };

  type WatchPartyControllerAdminGetRoomDetailsParams = {
    id: string;
  };

  type WatchPartyControllerAdminKickMemberParams = {
    id: string;
    userId: string;
  };

  type WatchPartyControllerAdminListRoomsParams = {
    limit?: number;
    offset?: number;
    /** Search by title or hostId */
    search?: string;
    /** Filter by videoId */
    videoId?: string;
  };

  type WatchPartyControllerAdminUnbanUserParams = {
    userId: string;
  };

  type WatchPartyControllerCloseRoomParams = {
    id: string;
  };

  type WatchPartyControllerListRoomsParams = {
    scope?: "public" | "all";
    limit?: number;
    offset?: number;
    /** Filter by videoId */
    videoId?: string;
  };

  type WatchPartyControllerLookupInviteParams = {
    code: string;
  };

  type WatchPartyStatsResponse = {
    totalActiveRooms: number;
    totalPublicRooms: number;
    totalMembers: number;
  };

  type WatchPartyStatsResponseResponseDto = {
    statusCode: number;
    message: string;
    data: WatchPartyStatsResponse;
  };

  type WatchProgressControllerDeleteWatchProgressParams = {
    videoId: string;
  };

  type WatchProgressControllerGetAllWatchProgressParams = {
    isCompleted?: boolean;
    /** Search by content title */
    search?: any;
    /** Sort order */
    sort?: string;
    limit?: number;
    page?: number;
  };

  type WatchProgressControllerGetResumeDataParams = {
    videoId: string;
  };

  type WatchProgressControllerGetWatchHistoryParams = {
    limit?: number;
    page?: number;
  };

  type WatchProgressControllerGetWatchProgressParams = {
    videoId: string;
  };

  type WatchProgressControllerMarkAsCompletedParams = {
    videoId: string;
  };

  type WatchProgressControllerUpdateWatchProgressParams = {
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
