/**
 * Playlist validation functions
 * Checks Phase 1 constraints and returns gentle error messages
 */

import type { Playlist, ExerciseStep } from './types';
import { LIMITS } from './constraints';

// 나머지 코드는 그대로
// (분 단위만 Math.round 쓸지 말지만 네가 선택)


/** Validation error codes */
export type PlaylistValidationErrorCode =
  | 'TOO_MANY_STEPS'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'STEP_DURATION_INVALID'
  | 'TOO_MANY_RUNNING'
  | 'EMPTY_PLAYLIST';

/** Validation error with gentle message */
export interface PlaylistValidationError {
  code: PlaylistValidationErrorCode;
  message: string;
}

/**
 * Calculates total duration of all steps in seconds
 */
export function getTotalDurationSec(playlist: Playlist): number {
  return playlist.steps.reduce((total, step) => total + step.durationSec, 0);
}

/**
 * Counts the number of running exercises in the playlist
 */
export function countRunningExercises(playlist: Playlist): number {
  return playlist.steps.filter(
    (step): step is ExerciseStep =>
      step.type === 'exercise' && step.exerciseType === 'running'
  ).length;
}

/**
 * Validates a playlist against Phase 1 constraints
 * Returns an array of validation errors (empty if valid)
 */
export function validatePlaylist(playlist: Playlist): PlaylistValidationError[] {
  const errors: PlaylistValidationError[] = [];

  // Check for empty playlist
  if (playlist.steps.length === 0) {
    errors.push({
      code: 'EMPTY_PLAYLIST',
      message: '플레이리스트에 운동을 추가해주세요.',
    });
    return errors; // Early return - can't validate further if empty
  }

  // Check step count
  if (playlist.steps.length > LIMITS.PLAYLIST_MAX_STEPS) {
    errors.push({
      code: 'TOO_MANY_STEPS',
      message: `운동은 최대 ${LIMITS.PLAYLIST_MAX_STEPS}개까지만 담을 수 있어요.`,
    });
  }

  // Check total duration
  const totalDuration = getTotalDurationSec(playlist);
  if (totalDuration < LIMITS.PLAYLIST_MIN_TOTAL_SEC) {
    const minMinutes = LIMITS.PLAYLIST_MIN_TOTAL_SEC / 60;
    errors.push({
      code: 'TOO_SHORT',
      message: `플레이리스트는 최소 ${minMinutes}분 이상이어야 해요.`,
    });
  }

  if (totalDuration > LIMITS.PLAYLIST_MAX_TOTAL_SEC) {
    const maxMinutes = LIMITS.PLAYLIST_MAX_TOTAL_SEC / 60;
    errors.push({
      code: 'TOO_LONG',
      message: `플레이리스트는 최대 ${maxMinutes}분까지만 가능해요.`,
    });
  }

  // Check individual step durations
  const invalidStep = playlist.steps.find(
    (step) =>
      step.durationSec < LIMITS.STEP_MIN_SEC ||
      step.durationSec > LIMITS.STEP_MAX_SEC
  );

  if (invalidStep) {
    errors.push({
      code: 'STEP_DURATION_INVALID',
      message: `각 운동은 ${LIMITS.STEP_MIN_SEC}초에서 ${LIMITS.STEP_MAX_SEC}초 사이여야 해요.`,
    });
  }

  // Check running exercise count
  const runningCount = countRunningExercises(playlist);
  if (runningCount > LIMITS.RUNNING_MAX_PER_PLAYLIST) {
    errors.push({
      code: 'TOO_MANY_RUNNING',
      message: `플레이리스트에는 달리기 운동을 ${LIMITS.RUNNING_MAX_PER_PLAYLIST}개까지만 담을 수 있어요.`,
    });
  }

  return errors;
}
