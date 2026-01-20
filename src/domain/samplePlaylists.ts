/**
 * Sample playlists shown to users on HomeScreen
 * 실제 운동용 기본 루틴 3개 (읽기 전용)
 */

import type { Playlist } from './types';

const baseTimestamp = 1704067200000; // 고정 타임스탬프 (임의 값)

/**
 * 샘플 1: 첫날 5분 루틴
 * - 아주 가볍게 몸을 깨우는 정도
 */
export const samplePlaylistEasy: Playlist = {
  id: 'sample-easy-5min',
  name: '첫날 5분 루틴',
  steps: [
    {
      id: 'easy-1',
      type: 'exercise',
      exerciseType: 'walking',
      durationSec: 90, // 1분 30초
    },
    {
      id: 'easy-2',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'easy-3',
      type: 'exercise',
      exerciseType: 'squats',
      durationSec: 60,
    },
    {
      id: 'easy-4',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'easy-5',
      type: 'exercise',
      exerciseType: 'jumping-jacks',
      durationSec: 60,
    },
  ],
  isSample: true,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/**
 * 샘플 2: 전신 10분 루틴
 * - 상·하체를 골고루 쓰는 기본 루틴
 */
export const samplePlaylistFullBody: Playlist = {
  id: 'sample-full-10min',
  name: '전신 10분 루틴',
  steps: [
    {
      id: 'full-1',
      type: 'exercise',
      exerciseType: 'jumping-jacks',
      durationSec: 60,
    },
    {
      id: 'full-2',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'full-3',
      type: 'exercise',
      exerciseType: 'squats',
      durationSec: 90,
    },
    {
      id: 'full-4',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'full-5',
      type: 'exercise',
      exerciseType: 'push-ups',
      durationSec: 60,
    },
    {
      id: 'full-6',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'full-7',
      type: 'exercise',
      exerciseType: 'mountain-climbers',
      durationSec: 90,
    },
  ],
  isSample: true,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};

/**
 * 샘플 3: 걷기 + 달리기 12분 루틴
 * - 러닝 1회 포함 (Phase1 규칙 지킴)
 */
export const samplePlaylistRun: Playlist = {
  id: 'sample-run-12min',
  name: '걷기 + 달리기 12분',
  steps: [
    {
      id: 'run-1',
      type: 'exercise',
      exerciseType: 'walking',
      durationSec: 120,
    },
    {
      id: 'run-2',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'run-3',
      type: 'exercise',
      exerciseType: 'running', // 러닝은 1번만
      durationSec: 120,
    },
    {
      id: 'run-4',
      type: 'rest',
      durationSec: 60,
    },
    {
      id: 'run-5',
      type: 'exercise',
      exerciseType: 'squats',
      durationSec: 60,
    },
    {
      id: 'run-6',
      type: 'rest',
      durationSec: 30,
    },
    {
      id: 'run-7',
      type: 'exercise',
      exerciseType: 'walking',
      durationSec: 120,
    },
  ],
  isSample: true,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
};
