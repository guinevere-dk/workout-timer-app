import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadWorkoutHistory } from '../../domain/workoutHistoryStorage';
import {
  getTotalActualDurationSec,
  getTotalActualDurationSecForPastNDays,
} from '../../domain/workoutHistorySelectors';
import type { WorkoutHistoryItem } from '../../domain/historyTypes';

function formatSecondsToLabel(sec: number): string {
  const totalSec = Math.max(Math.floor(sec), 0);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}분 ${seconds.toString().padStart(2, '0')}초`;
}

function formatSessionDateLabel(timestamp: number): string {
  const d = new Date(timestamp);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${month}월 ${day}일 ${hh}:${mm}`;
}

export function HistoryScreen() {
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDurationSec, setTotalDurationSec] = useState(0);
  const [last7DaysDurationSec, setLast7DaysDurationSec] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadWorkoutHistory();
        // Sort by completedAt DESC (most recent first)
        const sorted = [...data].sort((a, b) => b.completedAt - a.completedAt);
        
        // Compute statistics
        const total = getTotalActualDurationSec(sorted);
        const last7Days = getTotalActualDurationSecForPastNDays(sorted, 7, Date.now());
        
        setHistory(sorted);
        setTotalDurationSec(total);
        setLast7DaysDurationSec(last7Days);
      } catch (error) {
        // Silently handle error
        setHistory([]);
        setTotalDurationSec(0);
        setLast7DaysDurationSec(0);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={styles.title}>운동 기록</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          최근에 함께한 루틴들을 모아두었어요.
        </Text>

        {/* Summary stats card */}
        {!loading && history.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>지금까지 함께한 시간</Text>
              <Text style={styles.summaryValue}>
                {formatSecondsToLabel(totalDurationSec)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>최근 7일 동안</Text>
              <Text style={styles.summaryValue}>
                {formatSecondsToLabel(last7DaysDurationSec)}
              </Text>
            </View>
          </View>
        )}

        {/* Loading state */}
        {loading && (
          <Text style={styles.loadingText}>기록을 불러오는 중이에요...</Text>
        )}

        {/* Empty state */}
        {!loading && history.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              아직 저장된 운동 기록이 없어요.
            </Text>
            <Text style={styles.emptyText}>
              오늘은 3분만 가볍게 몸을 풀어볼까요?
            </Text>
          </View>
        )}

        {/* History list */}
        {!loading && history.length > 0 && (
          <View style={styles.historyList}>
            {history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyName}>{item.playlistName}</Text>
                <Text style={styles.historyMeta}>
                  {formatSessionDateLabel(item.completedAt)} ·{' '}
                  {formatSecondsToLabel(item.actualDurationSec)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer note */}
        {!loading && history.length > 0 && (
          <Text style={styles.footerNote}>
            기록은 혼내려고가 아니라, 내가 얼마나 잘 해내고 있는지 기억하려고
            남겨두는 거예요.
          </Text>
        )}
      </ScrollView>
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
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  historyList: {
    marginTop: 16,
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyName: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: '#888888',
  },
  footerNote: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
