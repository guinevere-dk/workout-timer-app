// src/domain/player.ts
import type { Playlist } from './types';
import type { PlayerState, PlayerStatus } from './playerTypes';

export function createInitialPlayerState(
  playlist: Playlist,
  now: number,
): PlayerState {
  return {
    status: 'idle',
    playlist,
    currentStepIndex: 0,
    stepElapsedSec: 0,
    totalElapsedSec: 0,
    lastTickAt: null,
  };
}

export function startPlayer(state: PlayerState, now: number): PlayerState {
  if (state.status !== 'idle') {
    return state;
  }

  return {
    ...state,
    status: 'running',
    currentStepIndex: 0,
    stepElapsedSec: 0,
    totalElapsedSec: 0,
    lastTickAt: now,
  };
}

export function pausePlayer(state: PlayerState): PlayerState {
  if (state.status !== 'running') {
    return state;
  }

  return {
    ...state,
    status: 'paused',
    lastTickAt: null,
  };
}

export function resumePlayer(state: PlayerState, now: number): PlayerState {
  if (state.status !== 'paused') {
    return state;
  }

  return {
    ...state,
    status: 'running',
    lastTickAt: now,
  };
}

export function stopPlayer(state: PlayerState): PlayerState {
  return {
    ...state,
    status: 'completed',
  };
}

export function tickPlayer(state: PlayerState, now: number): PlayerState {
  if (state.status !== 'running' || state.lastTickAt === null) {
    return state;
  }

  const deltaSec = Math.max((now - state.lastTickAt) / 1000, 0);
  let newStepElapsed = state.stepElapsedSec + deltaSec;
  let newTotalElapsed = state.totalElapsedSec + deltaSec;
  let newStepIndex = state.currentStepIndex;
  let newStatus: PlayerStatus = state.status;

  // Advance through steps if current step is completed
  while (newStepIndex < state.playlist.steps.length) {
    const currentStep = state.playlist.steps[newStepIndex];
    const stepDuration = currentStep.durationSec;

    if (newStepElapsed >= stepDuration) {
      // Step completed, move to next
      newStepElapsed -= stepDuration;
      newStepIndex += 1;

      // Check if playlist is complete
      if (newStepIndex >= state.playlist.steps.length) {
        newStatus = 'completed';
        newStepElapsed = 0;
        break;
      }
    } else {
      // Still within current step
      break;
    }
  }

  return {
    ...state,
    status: newStatus,
    currentStepIndex: newStepIndex,
    stepElapsedSec: newStepElapsed,
    totalElapsedSec: newTotalElapsed,
    lastTickAt: now,
  };
}
