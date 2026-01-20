// src/domain/workoutHistoryStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutHistoryItem } from './historyTypes';

const STORAGE_KEY = 'WORKOUT_HISTORY_V1';

export async function loadWorkoutHistory(): Promise<WorkoutHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    // Gracefully handle JSON parse errors or storage errors
    return [];
  }
}

export async function appendWorkoutHistory(
  item: WorkoutHistoryItem,
): Promise<void> {
  const history = await loadWorkoutHistory();
  history.push(item);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export async function clearWorkoutHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
