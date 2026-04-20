/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Footer } from "../footer";
import { Header } from "../header";
import { RankList } from "../rank-list";
import { TVSeriesVideoPlayerComponent } from "../ui/video-player/tv-series-player";
import { EpisodeCardList } from "./card/episode-card";
import { useWatchProgress } from "@/hooks/use-watch-progress";
import { videoControllerFindOne } from "@/apis/api/video";
import { MoreTVSeriesSection } from "./section/more-tv-series-section";
import { DetailInfoSection } from "./section/detail-info-section";
import Link from "next/link";
import { EpisodeReviewSection } from "./section/episode-review-section";
import { useRouter } from "next/navigation";
import { getS3Url } from "@/hooks/aws";
import { ResumeDialog } from "@/components/ui/resume-dialog";

interface TVSeriesPageContentProps {
  episodeId: string;
  tvSeries: API.TVSeriesDto | null;
}

export default function TVSeriesVideoContent({
  episodeId,
  tvSeries,
}: TVSeriesPageContentProps) {
  const router = useRouter();
  const episode = tvSeries?.seasons
    .flatMap((season) => season.episodes)
    .find((ep) => ep.id === episodeId);
  const [skipInitialTime, setSkipInitialTime] = useState(false);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  // Fetch watch progress and resume data
  const { resumeData, isLoading: progressLoading } = useWatchProgress({
    videoId: episode?.video.id,
    enabled: true,
    contentType: "tv_series",
    episodeId: episode?.id,
  });

  useEffect(() => {
    if (episode?.video.id) {
      videoControllerFindOne({ id: episode?.video.id })
        .then((res) => {
          setVideoDetails(res.data.data);
        })
        .catch((err) => console.error("Failed to fetch video details", err));
    }
  }, [episode?.video.id]);

  // Show resume dialog when resume data is available
  useEffect(() => {
    if (resumeData && resumeData.watchedDuration > 0 && !skipInitialTime) {
      setShowResumeDialog(true);
    }
  }, [resumeData, skipInitialTime]);

  const handleNextEpisode = () => {
    if (!tvSeries || !episode) return;

    // Create properly sorted episodes by season then episode number
    const allEpisodes = tvSeries.seasons
      .sort((a, b) => a.seasonNumber - b.seasonNumber) // Sort seasons first
      .flatMap(
        (season) =>
          season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber), // Then sort episodes within each season
      );

    // console.log(
    //   "All episodes order:",
    //   allEpisodes.map(
    //     (ep) =>
    //       `S${
    //         tvSeries.seasons.find((s) => s.episodes.some((e) => e.id === ep.id))
    //           ?.seasonNumber
    //       }E${ep.episodeNumber}`
    //   )
    // );

    const currentIndex = allEpisodes.findIndex((ep) => ep.id === episode.id);
    // console.log(
    //   "Current episode:",
    //   `S${
    //     tvSeries.seasons.find((s) =>
    //       s.episodes.some((e) => e.id === episode.id)
    //     )?.seasonNumber
    //   }E${episode.episodeNumber}`,
    //   "at index:",
    //   currentIndex
    // );

    if (currentIndex >= 0 && currentIndex < allEpisodes.length - 1) {
      const nextEpisode = allEpisodes[currentIndex + 1];
      // const nextSeasonNum = tvSeries.seasons.find((s) =>
      //   s.episodes.some((e) => e.id === nextEpisode.id)
      // )?.seasonNumber;
      // console.log(
      //   "Next episode:",
      //   `S${nextSeasonNum}E${nextEpisode.episodeNumber}`
      // );

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
      console.log("Prev Episode Click:", prevEpisode);
      router.push(
        `/tv_series/${tvSeries.metaData.title}-${tvSeries.id}/episode/${prevEpisode.episodeTitle}-${prevEpisode.id}`,
      );
    }
  };

  // Handle resume from last position
  const handleResume = () => {
    setShowResumeDialog(false);
    setSkipInitialTime(false);
    // Video player will auto-seek to resumeData.watchedDuration via useWatchProgress hook
  };

  // Handle start over
  const handleStartOver = () => {
    setShowResumeDialog(false);
    setSkipInitialTime(true);
    // Video player will start from 0
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
            <TVSeriesVideoPlayerComponent
              src={getS3Url(episode?.video.videoUrl || "")}
              poster={episode?.video.thumbnailUrl || ""}
              autoPlay={true}
              videoId={episode?.video.id}
              episodeId={episode?.id}
              initialTime={skipInitialTime ? 0 : resumeData?.watchedDuration}
              sprites={videoDetails?.sprites}
              vttFiles={videoDetails?.vttFiles}
              onTimeUpdate={(currentTime) => {
                // Callback to update duration when available
              }}
              episodeIndex={episode?.episodeNumber}
              totalEpisodes={
                tvSeries?.seasons.find((season) =>
                  season.episodes.some((ep) => ep.id === episodeId),
                )?.episodes.length || 0
              }
              onPrevEpisode={handlePrevEpisode}
              onNextEpisode={handleNextEpisode}
            />
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
    </div>
  );
}
