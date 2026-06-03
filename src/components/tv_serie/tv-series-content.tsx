/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Footer } from "../footer";
import { Header } from "../header";
import { RankList } from "../rank-list";
import { TVSeriesVideoPlayerComponent } from "../ui/video-player/tv-series-player";
import { EpisodeCardList } from "./card/episode-card";
import useVideoAccess from "@/hooks/use-video-access";
import { useWatchProgress } from "@/hooks/use-watch-progress";
import { useUIStore } from "@/store";
import {
  isUnauthenticatedError,
  isPermissionError,
  getFriendlyErrorMessage,
} from "@/lib/error-mapper";
import { videosControllerGetVideoById } from "@/apis/api/videos";
import { MoreTVSeriesSection } from "./section/more-tv-series-section";
import { DetailInfoSection } from "./section/detail-info-section";
import Link from "next/link";
import { EpisodeReviewSection } from "./section/episode-review-section";
import { useRouter } from "next/navigation";
import { getS3Url } from "@/hooks/aws";
import { ResumeDialog } from "@/components/ui/resume-dialog";
import { WatchPartyQuickButton } from "@/components/watch-party/watch-party-quick-button";
import { AlertCircle, Play } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TVSeriesPageContentProps {
  episodeId: string;
  tvSeries: API.TVSeriesDto | null;
}

export default function TVSeriesVideoContent({
  episodeId,
  tvSeries,
}: TVSeriesPageContentProps) {
  const router = useRouter();
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const episode = tvSeries?.seasons
    .flatMap((season) => season.episodes)
    .find((ep) => ep.id === episodeId);
  const [skipInitialTime, setSkipInitialTime] = useState(false);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  // Fetch watch progress and resume data
  const { resumeData, isLoading: progressLoading } = useWatchProgress({
    videoId: episode?.video.id,
    enabled: true,
    contentType: "tv_series",
    episodeId: episode?.id,
  });

  const { videoContent, isLoading: isAccessLoading, error: accessError } = useVideoAccess(
    episode?.video.id
      ? { videoId: episode.video.id }
      : { s3KeyStream: episode?.video.videoUrl || "" }
  );

  const [showError, setShowError] = useState(true);
  // pendingWatch: set to true when user clicks "Sign In" from the error dialog.
  // Once login succeeds and query refetches with videoContent, the player auto-shows.
  const [pendingWatch, setPendingWatch] = useState(false);

  useEffect(() => {
    setShowError(true);
    setPendingWatch(false);
    setPlayerVisible(false);
    setSkipInitialTime(false);
    setShowResumeDialog(false);
  }, [episodeId]);

  // Auto-show player after login: when videoContent arrives and user was pending
  useEffect(() => {
    if (pendingWatch && videoContent && !isAccessLoading) {
      setPendingWatch(false);
      setShowError(false);
      setPlayerVisible(true);
    }
  }, [pendingWatch, videoContent, isAccessLoading]);

  useEffect(() => {
    if (episode?.video.id) {
      videosControllerGetVideoById({ id: episode.video.id })
        .then((res: any) => {
          setVideoDetails(res.data.data);
        })
        .catch((err: any) => console.error("Failed to fetch video details", err));
    }
  }, [episode?.video.id]);

  const handlePlayClick = () => {
    if (resumeData && resumeData.watchedDuration > 0) {
      setShowResumeDialog(true);
    } else {
      setPlayerVisible(true);
    }
  };

  const handleNextEpisode = () => {
    if (!tvSeries || !episode) return;

    // Create properly sorted episodes by season then episode number
    const allEpisodes = tvSeries.seasons
      .sort((a, b) => a.seasonNumber - b.seasonNumber) // Sort seasons first
      .flatMap(
        (season) =>
          season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber), // Then sort episodes within each season
      );


    const currentIndex = allEpisodes.findIndex((ep) => ep.id === episode.id);

    if (currentIndex >= 0 && currentIndex < allEpisodes.length - 1) {
      const nextEpisode = allEpisodes[currentIndex + 1];

      router.push(
        `/tv_series/${tvSeries.metaData.title}-${tvSeries.id}/episode/${nextEpisode.episodeTitle}-${nextEpisode.id}`,
      );
    }
  };

  const handlePrevEpisode = () => {
    if (!tvSeries || !episode) return;

    // Create properly sorted episodes by season then episode number
    const allEpisodes = tvSeries.seasons
      .sort((a, b) => a.seasonNumber - b.seasonNumber) // Sort seasons first
      .flatMap(
        (season) =>
          season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber), // Then sort episodes within each season
      );

    const currentIndex = allEpisodes.findIndex((ep) => ep.id === episode.id);
    if (currentIndex > 0) {
      const prevEpisode = allEpisodes[currentIndex - 1];
      router.push(
        `/tv_series/${tvSeries.metaData.title}-${tvSeries.id}/episode/${prevEpisode.episodeTitle}-${prevEpisode.id}`,
      );
    }
  };

  // Handle resume from last position
  const handleResume = () => {
    setShowResumeDialog(false);
    setSkipInitialTime(false);
    setPlayerVisible(true);
  };

  // Handle start over
  const handleStartOver = () => {
    setShowResumeDialog(false);
    setSkipInitialTime(true);
    setPlayerVisible(true);
  };
  const categoryBreadcrumbs =
    tvSeries?.metaData.categories && tvSeries.metaData.categories.length > 0
      ? tvSeries.metaData.categories.map((cat) => ({
          label: cat.categoryName,
          href: `/tv_series/type/category/${cat.categoryName}-${cat.id}`,
        }))
      : [];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "TV Series", href: "/tv_series" },
    // spread all category crumbs
    ...categoryBreadcrumbs,
    {
      label: tvSeries?.metaData.title || "TV Series",
      href: `/tv_series/${tvSeries?.metaData.title}-${tvSeries?.id}`,
    },
    {
      label: `Season ${
        tvSeries?.seasons.find((season) =>
          season.episodes.some((ep) => ep.id === episodeId),
        )?.seasonNumber
      }`,
      href: "#",
    },
    {
      label: `Episode ${episode?.episodeNumber}`,
      href: `/tv_series/${tvSeries?.metaData.title}-${tvSeries?.id}/episode/${episode?.episodeTitle}-${episode?.id}`,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="relative" />
      <main className="pt-6">
        <div className="px-6 grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          {/* Sidebar trái */}
          <div className="lg:col-span-7">
            {/* Nội dung chính TV series bao gom video player detail more like this reviews */}
            {isAccessLoading ? (
              <div className="w-full aspect-video bg-black flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="text-white text-lg flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Loading secure player...
                </div>
              </div>
            ) : videoContent && playerVisible ? (
              <TVSeriesVideoPlayerComponent
                src={videoContent.src}
                type={videoContent.type}
                drmKeyId={videoContent.drmKeyId}
                poster={episode?.video.thumbnailUrl || ""}
                autoPlay={true}
                videoId={episode?.video.id}
                episodeId={episode?.id}
                initialTime={skipInitialTime ? 0 : resumeData?.watchedDuration}
                sprites={videoDetails?.sprites}
                vttFiles={videoDetails?.vttFiles}
                violentSegments={videoDetails?.violentSegments}
                nuditySegments={videoDetails?.nuditySegments}
                onTimeUpdate={() => {}}
                episodeIndex={episode?.episodeNumber}
                totalEpisodes={
                  tvSeries?.seasons.find((season) =>
                    season.episodes.some((ep) => ep.id === episodeId),
                  )?.episodes.length || 0
                }
                onPrevEpisode={handlePrevEpisode}
                onNextEpisode={handleNextEpisode}
              />
            ) : videoContent && !playerVisible ? (
              <div
                className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-800 cursor-pointer group"
                onClick={handlePlayClick}
              >
                <Image
                  src={episode?.video.thumbnailUrl || "/default_banner.jpg"}
                  alt={episode?.episodeTitle || "Episode"}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <button className="bg-orange-500/90 hover:bg-orange-600 text-white rounded-full p-5 shadow-2xl transition-all hover:scale-110">
                    <Play className="w-10 h-10 fill-white" />
                  </button>
                  <span className="text-white text-sm font-semibold drop-shadow">
                    {episode?.episodeTitle}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-video bg-black flex items-center justify-center rounded-2xl overflow-hidden border border-gray-800">
                <div className="text-zinc-500 text-sm">Failed to retrieve video stream.</div>
              </div>
            )}
            <nav
              aria-label="breadcrumb"
              className="text-sm text-gray-400 mt-4 mb-6"
            >
              <ol className="flex flex-wrap items-center gap-2">
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1;
                  const isLastTwo = index === breadcrumbItems.length - 2;

                  return (
                    <li key={item.href} className="flex items-center">
                      {isLast || isLastTwo ? (
                        // Mục cuối cùng (không phải là link)
                        <span className="text-white font-semibold">
                          {item.label}
                        </span>
                      ) : (
                        // Các mục là link
                        <Link
                          href={item.href}
                          className="hover:text-white transition-colors duration-200 text-gray-300"
                        >
                          {item.label}
                        </Link>
                      )}

                      {!isLast && (
                        <span className="mx-2 text-gray-500 select-none">
                          /
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
            {/* Watch Party button */}
            {episode && (
              <div className="flex mb-4">
                <WatchPartyQuickButton
                  content={episode}
                  contentType="episode"
                  seriesId={tvSeries?.id}
                  seriesTitle={tvSeries?.metaData.title}
                  posterUrl={tvSeries?.metaData.thumbnail}
                  description={tvSeries?.metaData.description}
                />
              </div>
            )}

            <div>
              <DetailInfoSection
                metaData={tvSeries?.metaData || ({} as API.ContentDto)}
              />
            </div>

            <div>
              <MoreTVSeriesSection tvSeriesId={tvSeries?.id || ""} />
            </div>

            {/* Reviews Section có thể thêm sau */}
            <EpisodeReviewSection episodeId={episodeId || ""} />
          </div>
          {/* Nội dung phải */}
          <div className="lg:col-span-3">
            {/* Nội dung chi tiết TV series bao gom tv danh sach tap va rank list */}
            <EpisodeCardList
              tvSeriesName={tvSeries?.metaData.title}
              tvSeriesId={tvSeries?.id}
              season={tvSeries?.seasons || []}
              selectedEpisodeId={episodeId}
            />
            <RankList
              type="tv_series"
              title="Popular TV"
              showFilterTabs={false}
            />
          </div>
        </div>
      </main>
      <Footer />

      {/* Resume Dialog */}
      <ResumeDialog
        isOpen={showResumeDialog}
        isLoading={progressLoading}
        contentTitle={`${tvSeries?.metaData.title} - Episode ${episode?.episodeNumber}`}
        watchedDuration={resumeData?.watchedDuration || 0}
        totalDuration={0} // We don't have total duration here, will be handled by video player
        onResume={handleResume}
        onStartOver={handleStartOver}
        onClose={() => setShowResumeDialog(false)}
      />

      {/* Error Alert Dialog */}
      <AlertDialog
        open={!isAccessLoading && !videoContent && showError}
        onOpenChange={setShowError}
      >
        <AlertDialogContent className="bg-zinc-950/95 border border-zinc-800 text-white backdrop-blur-md max-w-md">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2 animate-pulse">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-white">
              Playback Error
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm mt-2">
              {getFriendlyErrorMessage(accessError)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 w-full justify-end">
            {isUnauthenticatedError(accessError) ? (
              // 401: Not logged in → offer Sign In
              <>
                <AlertDialogAction
                  onClick={() => setShowError(false)}
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold"
                >
                  Cancel
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={() => {
                    setShowError(false);
                    setPendingWatch(true);
                    openLoginModal();
                  }}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                >
                  Sign In
                </AlertDialogAction>
              </>
            ) : isPermissionError(accessError) ? (
              // 403: Logged in but no subscription/permission → just Dismiss
              <AlertDialogAction
                onClick={() => setShowError(false)}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
              >
                Dismiss
              </AlertDialogAction>
            ) : (
              // Other errors → Dismiss
              <AlertDialogAction
                onClick={() => setShowError(false)}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
              >
                Dismiss
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
