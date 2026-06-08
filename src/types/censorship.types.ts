/**
 * Phase 4: Content Censorship Types
 *
 * These types mirror the backend `CensorFrame` / `CensorBox` structures
 * from the streaming-service (violence-detector & nudity-detector).
 */

/** A single detected bounding box within one video frame. */
export interface CensorBox {
  /** Normalized horizontal offset from left edge (0.0 – 1.0) */
  x: number;
  /** Normalized vertical offset from top edge (0.0 – 1.0) */
  y: number;
  /** Normalized width (0.0 – 1.0) */
  w: number;
  /** Normalized height (0.0 – 1.0) */
  h: number;
  /** Confidence score of the detection (0.0 – 1.0) */
  score: number;
  /** Label / class of the detected object (optional) */
  label?: string;
}

/** A discrete detection frame from the backend. */
export interface CensorFrame {
  /** Video timestamp in seconds for this detection frame */
  timestamp: number;
  /** Detected bounding boxes within this frame */
  boxes: CensorBox[];
}

/**
 * A merged, client-side playback segment derived from multiple nearby CensorFrames.
 * Used for full-blur activation to prevent flickering.
 */
export interface PlaybackSegment {
  start: number;
  end: number;
  maxScore: number;
  type: 'violence' | 'nudity';
}

/**
 * Per-category sensitivity setting controlled by the user.
 *  - 'off'      → No censorship, only warning badge shown
 *  - 'moderate' → Selective bounding-box blur over detected regions
 *  - 'strict'   → Full container blur + warning modal
 */
export type CensorSensitivity = 'off' | 'moderate' | 'strict';

export interface ContentPreferences {
  violence: CensorSensitivity;
  nudity: CensorSensitivity;
}

/** Default preferences (no censorship applied). */
export const DEFAULT_CONTENT_PREFERENCES: ContentPreferences = {
  violence: 'off',
  nudity: 'off',
};
