/**
 * Domain types for the fitness app (Phase 1)
 * - Time-based workouts only (no reps, no counting)
 * - Quiet, steady, non-competitive
 */

/** 운동 종류 식별자 (Phase 1 간단 버전) */
export type ExerciseType =
  | 'jumping-jacks'
  | 'mountain-climbers'
  | 'burpees'
  | 'squats'
  | 'push-ups'
  | 'running'
  | 'walking';

/**
 * 운동 단계(phase)
 * - warmup: 워밍업
 * - exercise: 본 운동 구간
 * - cooldown: 마무리/쿨다운
 *
 * 휴식은 굳이 phase에 넣지 않고 type === 'rest'로만 구분한다.
 */
export type StepPhase = 'warmup' | 'exercise' | 'cooldown';

/** 공통 Step 기본 구조 */
export interface BaseStep {
  id: string;
  /** 이 동작을 유지하는 시간 (초 단위) */
  durationSec: number;
}

/** 실제 운동 Step */
export interface ExerciseStep extends BaseStep {
  type: 'exercise';
  exerciseType: ExerciseType;

  /**
   * 이 운동 스텝이 루틴에서 어떤 역할인지
   * - 지정되지 않았으면 에디터/도메인 로직에서 자동 계산해서 채워줄 예정
   */
  phase?: StepPhase;
}

/** 휴식 Step */
export interface RestStep extends BaseStep {
  type: 'rest';
}

/** 재생 가능한 Step 유니온 타입 */
export type PlaylistStep = ExerciseStep | RestStep;

/** 운동 플레이리스트 */
export interface Playlist {
  id: string;
  name: string;
  steps: PlaylistStep[];

  /** true면 샘플(읽기 전용), false면 유저 커스텀 */
  isSample: boolean;

  /** 생성/수정 시각 (epoch ms) */
  createdAt: number;
  updatedAt: number;

  /** 마지막으로 재생한 시각 (홈 정렬용, 없을 수도 있음) */
  lastPlayedAt?: number;
}

/** 재생 상태 */
export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'completed';

/** 현재 재생 중인 상태 전체 */
export interface PlayerState {
  /** 재생 중인 플레이리스트 id, 없으면 null */
  playlistId: string | null;

  /** 현재 재생 중인 step index (0..steps.length-1) */
  currentStepIndex: number;

  /** 현재 step에서 지난 시간(초) */
  elapsedSec: number;

  /** 현재 step에서 남은 시간(초) */
  remainingSec: number;

  /** 재생 상태 */
  status: PlayerStatus;
}

/** 캐릭터 상태 (리듬 파트너) */
export interface CharacterState {
  /**
   * 캐릭터의 모드
   * - idle: 아무 것도 안 하는 기본 자세
   * - exercising: 운동 동작 중
   * - resting: 휴식 동작 중
   * - completed: 오늘 루틴 완료 후 마무리 자세
   */
  mode: 'idle' | 'exercising' | 'resting' | 'completed';

  /** 현재 운동 중이라면 어떤 운동인지 (rest일 때는 없음) */
  currentExerciseType?: ExerciseType;
}

/**
 * 진행 상태 (내부용) — 숫자지만 UI에 직접 노출하지 않음
 */
export interface ProgressState {
  /** 지금까지 완료한 세션 수 (내부 카운터) */
  totalSessions: number;

  /** 마지막 운동 일자 (epoch ms), 없다면 null */
  lastWorkoutDate: number | null;

  /** 한 번이라도 끝까지 완료한 플레이리스트 id 목록 */
  completedPlaylistIds: string[];
}

/**
 * 앱 전체 상태 (로컬 우선)
 * - 나중에 Zustand/Redux 등과 연결해도 됨
 */
export interface AppState {
  playlists: Record<string, Playlist>;
  player: PlayerState;
  character: CharacterState;
  progress: ProgressState;
}