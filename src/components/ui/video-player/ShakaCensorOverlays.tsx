'use client';

/**
 * Phase 4: ShakaCensorOverlays
 *
 * Renders two types of censorship overlays as siblings of the <video> element
 * inside the Shaka Player container.  Both overlays use `backdrop-filter: blur`
 * rather than `filter: blur` on the <video> itself, which avoids the DRM
 * blackout issue in hardware-DRM browsers (Chrome, Edge, Safari on macOS/Windows).
 *
 * Z-Index hierarchy (required for Shaka UI compatibility):
 *   <video>                       z-index: 1  (Shaka default)
 *   ShakaCensorOverlays container z-index: 2  (our overlay)
 *   .shaka-controls-container     z-index: 3+ (Shaka controls, must stay on top)
 *
 * The component uses a ResizeObserver on the <video> element to track its
 * exact rendered dimensions (accounts for letterboxing / pillarboxing) so
 * that bounding-box coordinates scale correctly to the visible video frame.
 */

import React, { useRef, useEffect, useState } from 'react';
import { CensorBox } from '@/types/censorship.types';

interface ShakaCensorOverlaysProps {
  /** Ref pointing to the .shaka-video-container or equivalent wrapper div */
  videoContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref pointing to the <video> element managed by Shaka Player */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Whether full-container blur should be shown (strict mode) */
  isFullBlurActive: boolean;
  /** Bounding boxes to individually blur (moderate mode) */
  activeBoxes: CensorBox[];
}

interface VideoDimensions {
  /** Actual rendered video content width (excluding black bars) */
  width: number;
  /** Actual rendered video content height (excluding black bars) */
  height: number;
  /** Horizontal offset from the left edge of the container to the video content */
  offsetX: number;
  /** Vertical offset from the top edge of the container to the video content */
  offsetY: number;
}

export const ShakaCensorOverlays: React.FC<ShakaCensorOverlaysProps> = ({
  videoContainerRef,
  videoRef,
  isFullBlurActive,
  activeBoxes,
}) => {
  const [dimensions, setDimensions] = useState<VideoDimensions>({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const observerRef = useRef<ResizeObserver | null>(null);

  // Track the exact rendered size of the video *content* (not the <video>
  // element) so that normalised box coordinates (0–1) map to the correct
  // pixel positions.  When the <video> uses object-fit:contain, the content
  // is centered inside the element with letterboxing or pillarboxing.  We
  // compute the actual rendered area from the natural aspect ratio.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => {
      const elementW = video.clientWidth || videoContainerRef.current?.clientWidth || 0;
      const elementH = video.clientHeight || videoContainerRef.current?.clientHeight || 0;
      const naturalW = video.videoWidth;
      const naturalH = video.videoHeight;

      if (!naturalW || !naturalH || !elementW || !elementH) {
        setDimensions({ width: elementW, height: elementH, offsetX: 0, offsetY: 0 });
        return;
      }

      const videoAspect = naturalW / naturalH;
      const elementAspect = elementW / elementH;

      let renderedW: number;
      let renderedH: number;

      if (elementAspect > videoAspect) {
        // Pillarboxing — black bars on left & right
        renderedH = elementH;
        renderedW = elementH * videoAspect;
      } else {
        // Letterboxing — black bars on top & bottom
        renderedW = elementW;
        renderedH = elementW / videoAspect;
      }

      setDimensions({
        width: renderedW,
        height: renderedH,
        offsetX: (elementW - renderedW) / 2,
        offsetY: (elementH - renderedH) / 2,
      });
    };

    observerRef.current = new ResizeObserver(update);
    observerRef.current.observe(video);
    // Also recalculate when the video metadata loads (provides videoWidth/videoHeight)
    video.addEventListener('loadedmetadata', update);
    window.addEventListener('resize', update);
    update(); // initial measurement

    return () => {
      observerRef.current?.disconnect();
      video.removeEventListener('loadedmetadata', update);
      window.removeEventListener('resize', update);
    };
  }, [videoRef, videoContainerRef]);

  const hasBoxes = activeBoxes.length > 0 && !isFullBlurActive;

  if (process.env.NODE_ENV === "development") {
    console.log("ShakaCensorOverlays State:", {
      isFullBlurActive,
      activeBoxesCount: activeBoxes.length,
      hasBoxes,
      dimensions,
      activeBoxes,
    });
  }

  if (!isFullBlurActive && !hasBoxes) return null;

  return (
    <>
      {/* ── Full Container Blur (strict mode) ─────────────────────────── */}
      {isFullBlurActive && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            backgroundColor: 'rgba(0,0,0,0.15)',
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}

      {/* ── Selective Bounding-Box Blur (moderate mode) ───────────────── */}
      {hasBoxes && dimensions.width > 0 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 2 }}
        >
          {/* Inner wrapper positioned at the exact video content area (respects letterboxing/pillarboxing) */}
          <div
            className="absolute"
            style={{
              left: dimensions.offsetX,
              top: dimensions.offsetY,
              width: dimensions.width,
              height: dimensions.height,
            }}
          >
            {activeBoxes.map((box, index) => {
              const left = box.x * dimensions.width;
              const top = box.y * dimensions.height;
              const width = box.w * dimensions.width;
              const height = box.h * dimensions.height;

              return (
                <div
                  key={index}
                  className="absolute rounded-sm"
                  style={{
                    left,
                    top,
                    width,
                    height,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    transition: 'all 0.08s linear',
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
