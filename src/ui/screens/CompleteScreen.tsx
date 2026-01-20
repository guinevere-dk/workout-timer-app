// src/ui/screens/CompleteScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import type { Playlist } from '../../domain/types';
import { getTotalDurationSec } from '../../domain/validatePlaylist';

type SessionSummary = {
  totalDurationSec: number;
  actualDurationSec: number;
  completedAt: number;
};

type RootStackParamList = {
  HomeScreen: undefined;
  PlayerScreen: { playlist: Playlist };
  CompleteScreen: {
    playlist: Playlist;
    summary?: SessionSummary;
  };
};

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CompleteScreen'
>;
type RouteP = RouteProp<RootStackParamList, 'CompleteScreen'>;

interface Props {
  navigation: NavProp;
  route: RouteP;
}

function formatSeconds(sec: number): string {
  const totalSec = Math.max(Math.floor(sec), 0);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}분 ${seconds.toString().padStart(2, '0')}초`;
}

export function CompleteScreen({ navigation, route }: Props) {
  const { playlist, summary } = route.params;

  const plannedTotalSec =
    summary?.totalDurationSec ?? getTotalDurationSec(playlist);
  const actualTotalSec =
    summary?.actualDurationSec ?? plannedTotalSec;

  const totalLabel = formatSeconds(plannedTotalSec);
  const actualLabel = formatSeconds(actualTotalSec);
  const stepsCount = playlist.steps.length;

  const handleReplay = () => {
    navigation.replace('PlayerScreen', { playlist });
  };

  const handleGoHome = () => {
    navigation.navigate('HomeScreen');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* 상단 메시지 */}
        <Text style={styles.title}>루틴 완료!</Text>
        <Text style={styles.subtitle}>
          {playlist.name || '오늘의 루틴'}을 마쳤어요.
        </Text>

        {/* 세션 요약 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>이번 루틴 요약</Text>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>루틴 이름</Text>
            <Text style={styles.cardValue}>{playlist.name}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>총 예정 시간</Text>
            <Text style={styles.cardValue}>{totalLabel}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>실제 수행 시간</Text>
            <Text style={styles.cardValue}>{actualLabel}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>동작 개수</Text>
            <Text style={styles.cardValue}>{stepsCount}개</Text>
          </View>
        </View>

        {/* 안내 문구 */}
        <Text style={styles.helperText}>
          몸이 조금이라도 가벼워졌다면, 오늘 운동은 충분히 잘한 거예요.
        </Text>

        {/* CTA 버튼들 */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleReplay}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>
              다시 재생하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              다른 루틴 고르기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 루틴성 살짝 심어두는 문구 */}
        <Text style={styles.footerNote}>
          내일도 이 루틴으로 가볍게 몸을 깨워볼까요?
        </Text>
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

  title: {
    fontSize: 26,
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },

  card: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#FAFAFA',
  },
  cardTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
    fontWeight: '500',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
  },
  cardValue: {
    fontSize: 14,
    color: '#000',
  },

  helperText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },

  buttons: {
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },

  footerNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
  },
});