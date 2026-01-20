// src/domain/workoutHistorySelectors.ts
import type { WorkoutHistoryItem } from './historyTypes';

export function getRecentSessions(
  history: WorkoutHistoryItem[],
  count: number,
): WorkoutHistoryItem[] {
  const sorted = [...history].sort((a, b) => b.completedAt - a.completedAt);
  return sorted.slice(0, count);
}

export function getTotalActualDurationSec(
  history: WorkoutHistoryItem[],
): number {
  return history.reduce((sum, item) => sum + item.actualDurationSec, 0);
}

export function getTotalActualDurationSecForPastNDays(
  history: WorkoutHistoryItem[],
  days: number,
  now: number,
): number {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  
  return history
    .filter(item => item.completedAt >= cutoff)
    .reduce((sum, item) => sum + item.actualDurationSec, 0);
}

export function getTodayActualDurationSec(
  history: WorkoutHistoryItem[],
  now: number,
): number {
  const date = new Date(now);
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  ).getTime();
  const nextStartOfDay = startOfDay + 24 * 60 * 60 * 1000;

  return history
    .filter(item => item.completedAt >= startOfDay && item.completedAt < nextStartOfDay)
    .reduce((sum, item) => sum + item.actualDurationSec, 0);
}
