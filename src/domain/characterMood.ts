export type CharacterMood = 'idle' | 'gentle' | 'positive';

/**
 * Determine character mood based on workout activity.
 * This affects the visual tone of the character area.
 */
export function getCharacterMood(
  todayTotalSec: number,
  recentSessionsCount: number,
): CharacterMood {
  // No history or no workout today
  if (recentSessionsCount === 0 || todayTotalSec === 0) {
    return 'idle';
  }

  // Light workout today (< 5 minutes)
  if (todayTotalSec < 5 * 60) {
    return 'gentle';
  }

  // 5+ minutes today
  return 'positive';
}
