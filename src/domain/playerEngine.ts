/**
 * Pure functions for managing player state during workout playback
 * No side effects, no mutations - all functions return new state objects
 */

import type { PlayerState, Playlist } from './types';

/**
 * Creates the initial idle player state
 */
export function createInitialPlayerState(): PlayerState {
  return {
    status: 'idle',
    playlistId: null,
    currentStepIndex: 0,
    elapsedSec: 0,
    remainingSec: 0,
  };
}

/**
 * Starts playback of a playlist
 */
export function startPlaylist(playlist: Playlist): PlayerState {
  const firstStep = playlist.steps[0];
  const remainingSec = firstStep ? firstStep.durationSec : 0;

  return {
    status: 'playing',
    playlistId: playlist.id,
    currentStepIndex: 0,
    elapsedSec: 0,
    remainingSec,
  };
}

/**
 * Advances the player state by deltaSec seconds
 * Handles step transitions, large time deltas, and completion
 */
export function tick(
  state: PlayerState,
  deltaSec: number,
  playlist: Playlist
): PlayerState {
  // If not playing, return state as-is
  if (state.status !== 'playing') {
    return state;
  }

  // If no playlist is loaded, return state as-is
  if (state.playlistId === null || state.playlistId !== playlist.id) {
    return state;
  }

  // Safety check: if current step doesn't exist, mark as completed
  const currentStep = playlist.steps[state.currentStepIndex];
  if (!currentStep) {
    return {
      ...state,
      status: 'completed',
      remainingSec: 0,
      elapsedSec: 0,
    };
  }

  // Start with the current state and leftover time to process
  let currentIndex = state.currentStepIndex;
  let leftoverTime = deltaSec;
  let currentRemaining = state.remainingSec;

  // Process leftover time through steps until consumed or playlist ends
  while (leftoverTime > 0 && currentIndex < playlist.steps.length) {
    const step = playlist.steps[currentIndex];
    if (!step) {
      break;
    }

    // Consume time from current step
    const timeToConsume = Math.min(leftoverTime, currentRemaining);
    currentRemaining -= timeToConsume;
    leftoverTime -= timeToConsume;

    // If current step is finished, move to next step
    if (currentRemaining <= 0) {
      currentIndex++;
      
      // If there is a next step, transition to it
      if (currentIndex < playlist.steps.length) {
        const nextStep = playlist.steps[currentIndex];
        if (nextStep) {
          currentRemaining = nextStep.durationSec;
        }
      }
    }
  }

  // If we've gone past all steps, mark as completed
  if (currentIndex >= playlist.steps.length) {
    return {
      ...state,
      status: 'completed',
      currentStepIndex: playlist.steps.length - 1,
      elapsedSec: 0,
      remainingSec: 0,
    };
  }

  // Calculate elapsed time for current step (clamped to step duration)
  const finalStep = playlist.steps[currentIndex];
  if (!finalStep) {
    return {
      ...state,
      status: 'completed',
      remainingSec: 0,
      elapsedSec: 0,
    };
  }

  const elapsedSec = finalStep.durationSec - currentRemaining;
  const clampedElapsedSec = Math.min(elapsedSec, finalStep.durationSec);

  return {
    ...state,
    currentStepIndex: currentIndex,
    elapsedSec: clampedElapsedSec,
    remainingSec: currentRemaining,
  };
}

/**
 * Pauses playback if currently playing
 */
export function pause(state: PlayerState): PlayerState {
  if (state.status === 'playing') {
    return {
      ...state,
      status: 'paused',
    };
  }
  return state;
}

/**
 * Resumes playback if currently paused
 */
export function resume(state: PlayerState): PlayerState {
  if (state.status === 'paused') {
    return {
      ...state,
      status: 'playing',
    };
  }
  return state;
}

/**
 * Resets player to initial idle state
 */
export function resetPlayer(): PlayerState {
  return createInitialPlayerState();
}

/**
 * 현재 스텝을 건너뛰고 다음 스텝으로 이동
 * - 마지막 스텝에서 호출되면 곧바로 completed 상태로 전환
 * - playing / paused 에서만 동작
 */
export function skipToNextStep(
  state: PlayerState,
  playlist: Playlist
): PlayerState {
  // idle / completed 에서는 아무 일도 안 함
  if (state.status !== 'playing' && state.status !== 'paused') {
    return state;
  }

  const nextStepIndex = state.currentStepIndex + 1;
  const nextStep = playlist.steps[nextStepIndex];

  // 다음 스텝이 없으면 = 플레이리스트 끝 → 완료 처리
  if (!nextStep) {
    return {
      ...state,
      status: 'completed',
      elapsedSec: 0,
      remainingSec: 0,
    };
  }

  // 다음 스텝으로 이동, 타이머 리셋
  return {
    ...state,
    status: 'playing',
    currentStepIndex: nextStepIndex,
    elapsedSec: 0,
    remainingSec: nextStep.durationSec,
  };
}

