/**
 * Sample playlists for manual testing of validation and player engine
 * Used for development and testing purposes only
 */

import type { Playlist } from './types';

const baseTimestamp = 1704067200000; // Fixed timestamp for consistency

/** Sample playlist 1 - Morning Routine */
export const samplePlaylist1: Playlist = {
  id: 'sample-1',
  name: '아침 루틴',
  steps: [
    {
      id: 'step-1',
      type: 'exercise',
      exerciseType: 'jumping-jacks',
      durationSec: 60,
    },
    {
      id: 'step-2',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'step-3',
      type: 'exercise',
      exerciseType: 'squats',
      durationSec: 90,
    },
  ],
  isSample: true,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/** Sample playlist 2 - Quick Break */
export const samplePlaylist2: Playlist = {
  id: 'sample-2',
  name: '짧은 휴식',
  steps: [
    {
      id: 'step-1',
      type: 'exercise',
      exerciseType: 'push-ups',
      durationSec: 60,
    },
    {
      id: 'step-2',
      type: 'rest',
      durationSec: 20,
    },
    {
      id: 'step-3',
      type: 'exercise',
      exerciseType: 'mountain-climbers',
      durationSec: 60,
    },
    {
      id: 'step-4',
      type: 'rest',
      durationSec: 20,
    },
  ],
  isSample: true,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/** Sample playlist 3 - Full Body */
export const samplePlaylist3: Playlist = {
  id: 'sample-3',
  name: '전신 운동',
  steps: [
    {
      id: 'step-1',
      type: 'exercise',
      exerciseType: 'burpees',
      durationSec: 90,
    },
    {
      id: 'step-2',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'step-3',
      type: 'exercise',
      exerciseType: 'squats',
      durationSec: 60,
    },
  ],
  isSample: true,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/** Valid playlist with 3 steps, total duration ~200 seconds */
export const validShortPlaylist: Playlist = {
  id: 'dev-valid-short',
  name: 'Valid Short Playlist',
  steps: [
    {
      id: 'step-1',
      type: 'exercise',
      exerciseType: 'squats',
      durationSec: 60,
    },
    {
      id: 'step-2',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'step-3',
      type: 'exercise',
      exerciseType: 'push-ups',
      durationSec: 110,
    },
  ],
  isSample: false,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/** Playlist with too many steps (>12) */
export const tooManyStepsPlaylist: Playlist = {
  id: 'dev-too-many-steps',
  name: 'Too Many Steps',
  steps: Array.from({ length: 13 }, (_, i) => ({
    id: `step-${i + 1}`,
    type: 'exercise' as const,
    exerciseType: 'squats' as const,
    durationSec: 30,
  })),
  isSample: false,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/** Playlist with total duration < 180 seconds */
export const tooShortPlaylist: Playlist = {
  id: 'dev-too-short',
  name: 'Too Short Playlist',
  steps: [
    {
      id: 'step-1',
      type: 'exercise',
      exerciseType: 'jumping-jacks',
      durationSec: 60,
    },
    {
      id: 'step-2',
      type: 'rest',
      durationSec: 30,
    },
  ],
  isSample: false,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/** Playlist with total duration > 1800 seconds */
export const tooLongPlaylist: Playlist = {
  id: 'dev-too-long',
  name: 'Too Long Playlist',
  steps: [
    {
      id: 'step-1',
      type: 'exercise',
      exerciseType: 'burpees',
      durationSec: 600,
    },
    {
      id: 'step-2',
      type: 'rest',
      durationSec: 60,
    },
    {
      id: 'step-3',
      type: 'exercise',
      exerciseType: 'mountain-climbers',
      durationSec: 600,
    },
    {
      id: 'step-4',
      type: 'rest',
      durationSec: 60,
    },
    {
      id: 'step-5',
      type: 'exercise',
      exerciseType: 'squats',
      durationSec: 600,
    },
  ],
  isSample: false,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/** Playlist with at least one step having invalid duration */
export const invalidStepDurationPlaylist: Playlist = {
  id: 'dev-invalid-step-duration',
  name: 'Invalid Step Duration',
  steps: [
    {
      id: 'step-1',
      type: 'exercise',
      exerciseType: 'squats',
      durationSec: 15, // < 20 seconds (invalid)
    },
    {
      id: 'step-2',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'step-3',
      type: 'exercise',
      exerciseType: 'push-ups',
      durationSec: 200, // > 180 seconds (invalid)
    },
  ],
  isSample: false,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/** Playlist with more than 1 running exercise */
export const tooManyRunningPlaylist: Playlist = {
  id: 'dev-too-many-running',
  name: 'Too Many Running',
  steps: [
    {
      id: 'step-1',
      type: 'exercise',
      exerciseType: 'running',
      durationSec: 60,
    },
    {
      id: 'step-2',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'step-3',
      type: 'exercise',
      exerciseType: 'running',
      durationSec: 60,
    },
  ],
  isSample: false,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};
