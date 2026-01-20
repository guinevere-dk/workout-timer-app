/**
 * Phase 1 constraints for playlists and steps
 * All time values are in seconds
 */

export const LIMITS = {
  /** Maximum number of steps per playlist */
  PLAYLIST_MAX_STEPS: 12,

  /** Minimum total duration for a playlist (3 minutes) */
  PLAYLIST_MIN_TOTAL_SEC: 180,

  /** Maximum total duration for a playlist (30 minutes) */
  PLAYLIST_MAX_TOTAL_SEC: 1800,

  /** Minimum duration per step */
  STEP_MIN_SEC: 20,

  /** Maximum duration per step */
  STEP_MAX_SEC: 180,

  /** Maximum number of running exercises per playlist */
  RUNNING_MAX_PER_PLAYLIST: 1,
} as const;

/** Type helper for limit keys */
export type LimitKey = keyof typeof LIMITS;
