// src/ui/screens/PlayerScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import type { Playlist, StepPhase } from '../../domain/types';
import type { PlayerState } from '../../domain/playerTypes';
import type { WorkoutHistoryItem } from '../../domain/historyTypes';
import {
  createInitialPlayerState,
  startPlayer,
  pausePlayer,
  resumePlayer,
  stopPlayer,
  tickPlayer,
} from '../../domain/player';
import { getTotalDurationSec } from '../../domain/validatePlaylist';
import { appendWorkoutHistory } from '../../domain/workoutHistoryStorage';
import { getExerciseLabel } from '../../domain/exerciseLabels';

type RootStackParamList = {
  PlayerScreen: { playlist: Playlist };
  CompleteScreen: {
    playlist: Playlist;
    summary?: {
      totalDurationSec: number;
      actualDurationSec: number;
      completedAt: number;
    };
  };
};

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlayerScreen'
>;
type RouteP = RouteProp<RootStackParamList, 'PlayerScreen'>;

interface Props {
  navigation: NavProp;
  route: RouteP;
}

function formatSeconds(sec: number): string {
  const totalSec = Math.max(Math.floor(sec), 0);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getPhaseLabel(step: any): string {
  if (step.type === 'rest') {
    return '휴식';
  }
  
  const phase = step.phase;
  switch (phase) {
    case 'warmup':
      return '준비운동';
    case 'exercise':
      return '운동';
    case 'cooldown':
      return '마무리운동';
    default:
      return '운동';
  }
}

export function PlayerScreen({ navigation, route }: Props) {
  const [player, setPlayer] = useState<PlayerState>(() =>
    createInitialPlayerState(route.params.playlist, Date.now()),
  );

  // Timer effect
  useEffect(() => {
    if (player.status !== 'running') {
      return;
    }

    const interval = setInterval(() => {
      setPlayer(prev => tickPlayer(prev, Date.now()));
    }, 500);

    return () => clearInterval(interval);
  }, [player.status]);

  // Auto-complete behavior
  useEffect(() => {
    if (player.status === 'completed') {
      const summary = {
        totalDurationSec: getTotalDurationSec(player.playlist),
        actualDurationSec: player.totalElapsedSec,
        completedAt: Date.now(),
      };

      const historyItem: WorkoutHistoryItem = {
        id: String(summary.completedAt),
        playlistId: player.playlist.id,
        playlistName: player.playlist.name,
        totalDurationSec: summary.totalDurationSec,
        actualDurationSec: summary.actualDurationSec,
        completedAt: summary.completedAt,
      };

      try {
        appendWorkoutHistory(historyItem);
      } catch (error) {
        // Silently ignore errors
      }

      navigation.replace('CompleteScreen', {
        playlist: player.playlist,
        summary,
      });
    }
  }, [player.status, navigation, player.playlist, player.totalElapsedSec]);

  // Button handlers
  const handleStart = () => {
    setPlayer(prev => startPlayer(prev, Date.now()));
  };

  const handlePause = () => {
    setPlayer(prev => pausePlayer(prev));
  };

  const handleResume = () => {
    setPlayer(prev => resumePlayer(prev, Date.now()));
  };

  const handleStop = () => {
    setPlayer(prev => stopPlayer(prev));
  };

  // Derived values for UI
  const steps = player.playlist.steps;
  const currentStep = steps[player.currentStepIndex] ?? steps[steps.length - 1];

  const stepRemainingSec = Math.max(
    currentStep.durationSec - player.stepElapsedSec,
    0,
  );

  const totalDurationSec = getTotalDurationSec(player.playlist);
  const totalRemainingSec = Math.max(
    totalDurationSec - player.totalElapsedSec,
    0,
  );

  const progressRatio =
    totalDurationSec > 0
      ? Math.min(player.totalElapsedSec / totalDurationSec, 1)
      : 0;

  const totalDurationFormatted = formatSeconds(totalDurationSec);
  const totalRemainingFormatted = formatSeconds(totalRemainingSec);
  const stepRemainingFormatted = formatSeconds(stepRemainingSec);

  // Main control button
  let mainButtonLabel = '시작';
  let mainButtonHandler = handleStart;

  if (player.status === 'running') {
    mainButtonLabel = '일시정지';
    mainButtonHandler = handlePause;
  } else if (player.status === 'paused') {
    mainButtonLabel = '계속';
    mainButtonHandler = handleResume;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.playlistName}>{player.playlist.name}</Text>

        {/* Phase + Step name */}
        <View style={styles.stepInfo}>
          <Text style={styles.phaseLabel}>
            {getPhaseLabel(currentStep)}
          </Text>
          <Text style={styles.stepName}>
            {currentStep.type === 'rest'
              ? (currentStep as any).label || '휴식'
              : (currentStep as any).label ||
                getExerciseLabel((currentStep as any).exerciseType)}
          </Text>
        </View>

        {/* Timer */}
        <View style={styles.timerSection}>
          <Text style={styles.timerMain}>{stepRemainingFormatted}</Text>
          <Text style={styles.timerSub}>
            전체 {totalDurationFormatted} / 남은 {totalRemainingFormatted}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBarFill, { flex: progressRatio }]}
          />
          <View style={{ flex: 1 - progressRatio }} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={mainButtonHandler}
            activeOpacity={0.7}
          >
            <Text style={styles.mainButtonText}>{mainButtonLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStop}
            activeOpacity={0.7}
          >
            <Text style={styles.stopButtonText}>종료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  playlistName: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 48,
  },

  stepInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  phaseLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stepName: {
    fontSize: 24,
    color: '#000',
    fontWeight: '500',
  },

  timerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerMain: {
    fontSize: 72,
    color: '#000',
    fontWeight: '300',
    letterSpacing: 2,
  },
  timerSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 48,
  },
  progressBarFill: {
    backgroundColor: '#000',
  },

  controls: {
    alignItems: 'center',
  },
  mainButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 18,
    color: '#FFF',
  },

  stopButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  stopButtonText: {
    fontSize: 14,
    color: '#D32F2F',
    textDecorationLine: 'underline',
  },
});
