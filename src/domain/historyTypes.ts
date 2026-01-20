// src/domain/historyTypes.ts

export type WorkoutHistoryItem = {
  id: string;
  playlistId: string;
  playlistName: string;
  totalDurationSec: number;
  actualDurationSec: number;
  completedAt: number;
};
