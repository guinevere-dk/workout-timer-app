// src/domain/playerTypes.ts
import type { Playlist } from './types';

export type PlayerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface PlayerState {
  status: PlayerStatus;
  playlist: Playlist;
  currentStepIndex: number;
  stepElapsedSec: number;
  totalElapsedSec: number;
  lastTickAt: number | null;
}
