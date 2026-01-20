// src/domain/editSteps.ts
import type { Playlist, PlaylistStep, ExerciseStep, RestStep, StepPhase } from './types';

const uid = () => `step-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export type InsertKind = 'exercise' | 'rest';

export function insertStepAfter(
  playlist: Playlist,
  afterIndex: number,
  kind: InsertKind
): Playlist {
  const next: PlaylistStep =
    kind === 'exercise'
      ? ({
          id: uid(),
          type: 'exercise',
          durationSec: 30,
          // 기본값: 아직 선택 안함 -> UI에서 "운동 선택하기" 뜨게 처리하려면
          // exerciseType을 임시값으로 두기 싫으면,
          // 너의 타입을 exerciseType?: 로 바꾸거나 "placeholder" 타입을 추가해야 함.
          // 지금 타입이 필수라서, 일단 안전한 기본값 하나 넣어둠.
          exerciseType: 'walking',
        } as ExerciseStep)
      : ({
          id: uid(),
          type: 'rest',
          durationSec: 30,
        } as RestStep);

  const steps = [...playlist.steps];
  const insertAt = Math.min(Math.max(afterIndex + 1, 0), steps.length);
  steps.splice(insertAt, 0, next);

  return {
    ...playlist,
    steps: normalizePhases(steps),
    updatedAt: Date.now(),
  };
}

export function removeStepAt(playlist: Playlist, index: number): Playlist {
  const steps = [...playlist.steps];
  if (steps.length <= 1) return playlist; // 최소 1개는 유지 (원하면 제거)
  if (index < 0 || index >= steps.length) return playlist;

  steps.splice(index, 1);

  return {
    ...playlist,
    steps: normalizePhases(steps),
    updatedAt: Date.now(),
  };
}

export function moveStep(playlist: Playlist, from: number, to: number): Playlist {
  const steps = [...playlist.steps];
  if (from < 0 || from >= steps.length) return playlist;
  if (to < 0 || to >= steps.length) return playlist;
  if (from === to) return playlist;

  const [picked] = steps.splice(from, 1);
  steps.splice(to, 0, picked);

  return {
    ...playlist,
    steps: normalizePhases(steps),
    updatedAt: Date.now(),
  };
}

/**
 * phase 자동 정규화:
 * - 운동 스텝 중 첫 번째 = warmup
 * - 운동 스텝 중 마지막 = cooldown
 * - 그 외 운동 = exercise
 * - rest는 phase 없음
 */
export function normalizePhases(steps: PlaylistStep[]): PlaylistStep[] {
  const exerciseIndexes: number[] = [];
  steps.forEach((s, i) => {
    if (s.type === 'exercise') exerciseIndexes.push(i);
  });

  if (exerciseIndexes.length === 0) return steps;

  const first = exerciseIndexes[0];
  const last = exerciseIndexes[exerciseIndexes.length - 1];

  return steps.map((s, i) => {
    if (s.type !== 'exercise') return s;
    const phase: StepPhase = i === first ? 'warmup' : i === last ? 'cooldown' : 'exercise';
    return { ...s, phase };
  });
}