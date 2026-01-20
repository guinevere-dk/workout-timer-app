import type { ExerciseType } from './types';

/**
 * ExerciseType을 한글 운동명으로 변환
 */
export function getExerciseLabel(exerciseType: ExerciseType): string {
  switch (exerciseType) {
    case 'walking':
      return '걷기';
    case 'running':
      return '달리기';
    case 'squats':
      return '스쿼트';
    case 'push-ups':
      return '푸시업';
    case 'jumping-jacks':
      return '점핑 잭';
    case 'mountain-climbers':
      return '마운틴 클라이머';
    case 'burpees':
      return '버피';
    default:
      return '운동';
  }
}
