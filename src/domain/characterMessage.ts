import type { WorkoutHistoryItem } from './historyTypes';

export type CharacterMessageContext = {
  todayTotalSec: number;
  recentSessions: WorkoutHistoryItem[];
  now: number;
};

/**
 * Compute the start of day timestamp (00:00:00) in local time.
 */
function getStartOfDay(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Deterministically select a message from a pool based on day seed.
 */
function selectMessage(messages: string[], now: number, bucketNumber: number): string {
  const startOfDay = getStartOfDay(now);
  const daysSinceEpoch = Math.floor(startOfDay / 86400000);
  const index = (daysSinceEpoch + bucketNumber) % messages.length;
  return messages[index];
}

/**
 * Get character message based on workout context.
 * Message is deterministic within the same day.
 */
export function getCharacterMessage(ctx: CharacterMessageContext): string {
  const { todayTotalSec, recentSessions, now } = ctx;
  const hasAnyHistory = recentSessions.length > 0;

  // Bucket A: No history at all
  if (!hasAnyHistory) {
    const messages = [
      '아직 함께한 운동이 없어요. 오늘은 3분만 가볍게 움직여볼까요?',
      '처음 시작하는 날이네요. 부담 없이 짧은 루틴 하나 골라보세요.',
      '새로운 시작이에요. 천천히, 편안하게 시작하면 돼요.',
      '오늘이 첫날이네요. 5분 정도면 충분해요.',
      '함께 움직여볼까요? 가벼운 루틴 하나로 시작해봐요.',
    ];
    return selectMessage(messages, now, 0);
  }

  // Bucket B: Has history, but not today
  if (todayTotalSec === 0) {
    const last = recentSessions[0];
    const playlistName = last.playlistName || '루틴';
    
    const messages = [
      `최근에는 "${playlistName}"을(를) 함께 했어요. 오늘도 천천히 이어가볼까요?`,
      `지난번 "${playlistName}" 기억나요? 오늘은 가볍게 시작해도 좋아요.`,
      '오늘은 어떤 루틴이 끌리나요? 마음 가는 대로 골라보세요.',
      `이전에 "${playlistName}"을(를) 했었네요. 다시 해도 좋고, 다른 걸 해도 좋아요.`,
      '오늘은 몸이 어떤가요? 편안한 루틴 하나 골라보세요.',
      '쉬었다가 다시 시작하는 것도 좋은 리듬이에요. 천천히 해봐요.',
    ];
    return selectMessage(messages, now, 1);
  }

  const minutes = todayTotalSec / 60;

  // Bucket C: Today < 5 min
  if (minutes < 5) {
    const messages = [
      '오늘은 가볍게 몸을 깨웠네요. 이 정도면 충분해요.',
      '짧게라도 움직였어요. 몸이 기억할 거예요.',
      '오늘은 이만큼으로도 좋아요. 무리하지 않아도 돼요.',
      '가볍게 시작했네요. 이런 날도 소중해요.',
      '몸을 깨우는 시간이었어요. 잘했어요.',
    ];
    return selectMessage(messages, now, 2);
  }

  // Bucket D: Today 5~20 min
  if (minutes < 20) {
    const messages = [
      '오늘 루틴 좋았어요. 몸이 기억하도록 이런 날을 하나씩 쌓아봐요.',
      '오늘도 꾸준히 했네요. 이런 리듬이 쌓여가고 있어요.',
      '적당히 움직였어요. 무리하지 않는 게 오래 가는 비결이에요.',
      '오늘 루틴 완료했어요. 이 정도 페이스가 좋아요.',
      '꾸준한 하루였어요. 이런 날들이 모여 습관이 돼요.',
      '오늘도 함께했네요. 천천히 가는 게 멀리 가는 길이에요.',
    ];
    return selectMessage(messages, now, 3);
  }

  // Bucket E: Today >= 20 min
  const messages = [
    '오늘 꽤 오래 함께 했네요. 남은 시간은 마음껏 쉬어도 괜찮아요.',
    '오늘은 충분히 움직였어요. 이제 편히 쉬어도 좋아요.',
    '오늘 많이 했네요. 내일은 더 가볍게 해도 괜찮아요.',
    '긴 시간 함께했어요. 몸이 회복할 시간도 필요해요.',
    '오늘은 이 정도면 충분해요. 푹 쉬세요.',
  ];
  return selectMessage(messages, now, 4);
}
