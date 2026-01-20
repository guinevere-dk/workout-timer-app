/**
 * Development sandbox for manual testing
 * This file is for development only and can be removed later
 */

import type { Playlist } from './types';
import { validatePlaylist } from './validatePlaylist';
import {
  createInitialPlayerState,
  startPlaylist,
  tick,
} from './playerEngine';
import {
  validShortPlaylist,
  tooManyStepsPlaylist,
  tooShortPlaylist,
  tooLongPlaylist,
  invalidStepDurationPlaylist,
  tooManyRunningPlaylist,
} from './devPlaylists';

/**
 * Logs validation results for all sample playlists
 */
export function logValidationResults(): void {
  const playlists = [
    validShortPlaylist,
    tooManyStepsPlaylist,
    tooShortPlaylist,
    tooLongPlaylist,
    invalidStepDurationPlaylist,
    tooManyRunningPlaylist,
  ];

  console.log('=== Validation Results ===\n');

  for (const playlist of playlists) {
    const errors = validatePlaylist(playlist);
    const errorCodes = errors.map((e) => e.code).join(', ') || 'none';

    console.log(`${playlist.name}:`);
    console.log(`  Errors: ${errorCodes}`);
    if (errors.length > 0) {
      errors.forEach((error) => {
        console.log(`    - ${error.code}: ${error.message}`);
      });
    }
    console.log('');
  }
}

/**
 * Simulates playback of a playlist with tick calls
 */
export function simulatePlaybackOnce(playlist: Playlist): void {
  console.log(`=== Playback Simulation: ${playlist.name} ===\n`);

  const initial = createInitialPlayerState();
  console.log('Idle state (before start):', initial);
  const playing = startPlaylist(playlist);

  let state = playing;
  const deltaSec = 10;
  const maxIterations = 100; // Safety limit
  let iteration = 0;

  console.log('Initial state:');
  console.log(`  Step: ${state.currentStepIndex}`);
  console.log(`  Elapsed: ${state.elapsedSec}s`);
  console.log(`  Remaining: ${state.remainingSec}s`);
  console.log(`  Status: ${state.status}`);
  console.log('');

  while (state.status === 'playing' && iteration < maxIterations) {
    state = tick(state, deltaSec, playlist);
    iteration++;

    console.log(`Tick ${iteration} (delta: ${deltaSec}s):`);
    console.log(`  Step: ${state.currentStepIndex}`);
    console.log(`  Elapsed: ${state.elapsedSec}s`);
    console.log(`  Remaining: ${state.remainingSec}s`);
    console.log(`  Status: ${state.status}`);

    if (state.status === 'completed') {
      console.log('\n✓ Playback completed');
      break;
    }
    console.log('');
  }

  if (iteration >= maxIterations) {
    console.log('\n⚠ Max iterations reached');
  }

  console.log('');
}

/**
 * Convenience function to run all dev sandbox tests
 */
export function runDevSandbox(): void {
  logValidationResults();
  console.log('');
  simulatePlaybackOnce(validShortPlaylist);
}
