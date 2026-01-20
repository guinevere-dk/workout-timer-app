import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Playlist } from '../../domain/types';

import {
  samplePlaylistEasy,
  samplePlaylistFullBody,
  samplePlaylistRun,
} from '../../domain/samplePlaylists';
import { loadCustomPlaylists, deleteCustomPlaylist } from '../../domain/playlistsStorage';
import { loadWorkoutHistory } from '../../domain/workoutHistoryStorage';
import { getTodayActualDurationSec, getRecentSessions } from '../../domain/workoutHistorySelectors';
import type { WorkoutHistoryItem } from '../../domain/historyTypes';
import { getCharacterMessage } from '../../domain/characterMessage';
import { getCharacterMood } from '../../domain/characterMood';

type RootStackParamList = {
  HomeScreen: undefined;
  PlayerScreen: { playlist: Playlist };
  HistoryScreen: undefined;
  PickTemplateScreen: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HomeScreen'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

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

export function HomeScreen({ navigation }: HomeScreenProps) {
  const isFocused = useIsFocused();
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>([]);
  const [todayTotalSec, setTodayTotalSec] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState<WorkoutHistoryItem[]>([]);

  const samplePlaylists = [
    samplePlaylistEasy,
    samplePlaylistFullBody,
    samplePlaylistRun,
  ];

  useEffect(() => {
    if (!isFocused) return;

    loadCustomPlaylists()
      .then(setCustomPlaylists)
      .catch((e) => console.warn('load custom playlists error', e));
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;

    let isMounted = true;

    const load = async () => {
      try {
        const history = await loadWorkoutHistory();
        const todaySec = getTodayActualDurationSec(history, Date.now());
        const recent = getRecentSessions(history, 3);

        if (isMounted) {
          setTodayTotalSec(todaySec);
          setRecentSessions(recent);
        }
      } catch (error) {
        // silently ignore errors
        if (isMounted) {
          setTodayTotalSec(0);
          setRecentSessions([]);
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const handlePlaylistPress = (playlist: Playlist) => {
    navigation.navigate('PlayerScreen', { playlist });
  };

  const handleCreateCustom = () => {
    navigation.navigate('PickTemplateScreen');
  };

  const handleViewHistory = () => {
    navigation.navigate('HistoryScreen');
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      '루틴 삭제',
      `"${playlist.name}" 루틴을 삭제하시겠어요?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomPlaylist(playlist.id);
              // 삭제 후 목록 다시 로드
              const updated = await loadCustomPlaylists();
              setCustomPlaylists(updated);
            } catch (error) {
              console.warn('Failed to delete playlist', error);
            }
          },
        },
      ],
    );
  };

  const characterMood = getCharacterMood(
    todayTotalSec,
    recentSessions.length,
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Character area placeholder */}
      <View
        style={[
          styles.characterArea,
          characterMood === 'idle' && styles.characterIdle,
          characterMood === 'gentle' && styles.characterGentle,
          characterMood === 'positive' && styles.characterPositive,
        ]}
      >
        <Text style={styles.characterPlaceholder}>
          {historyLoading
            ? '오늘 컨디션을 살펴보고 있어요...'
            : getCharacterMessage({
                todayTotalSec,
                recentSessions,
                now: Date.now(),
              })}
        </Text>
      </View>

      {/* Today's workout time */}
      <Text style={styles.todayWorkoutText}>
        {historyLoading
          ? '오늘 운동 기록을 불러오는 중...'
          : `오늘 운동: ${formatSecondsToLabel(todayTotalSec)}`}
      </Text>

      {/* View all history button */}
      <TouchableOpacity
        style={styles.viewHistoryButton}
        onPress={handleViewHistory}
        activeOpacity={0.7}
      >
        <Text style={styles.viewHistoryText}>전체 기록 보기</Text>
      </TouchableOpacity>

      {recentSessions.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>최근 루틴</Text>
          <View style={styles.recentList}>
            {recentSessions.map((item) => (
              <View key={item.id} style={styles.recentItem}>
                <Text style={styles.recentName}>{item.playlistName}</Text>
                <Text style={styles.recentMeta}>
                  {formatSessionDateLabel(item.completedAt)} ·{' '}
                  {formatSecondsToLabel(item.actualDurationSec)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Custom playlists 영역 */}
      {customPlaylists.length > 0 && (
        <View style={{ marginBottom: 32 }}>
          <Text style={styles.sectionTitle}>내 루틴</Text>
          <View style={styles.playlistContainer}>
            {customPlaylists.map((playlist) => (
              <View key={playlist.id} style={styles.playlistCardWrapper}>
                <TouchableOpacity
                  style={styles.playlistCard}
                  onPress={() => handlePlaylistPress(playlist)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  <Text style={styles.playlistSteps}>
                    {playlist.steps.length}개 동작
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePlaylist(playlist)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Gentle guidance text + 샘플 */}
      <Text style={styles.guidanceText}>
        망설이신다면 이 중 하나를 시작해보세요.
      </Text>

      <View style={styles.playlistContainer}>
        {samplePlaylists.map((playlist) => (
          <TouchableOpacity
            key={playlist.id}
            style={styles.playlistCard}
            onPress={() => handlePlaylistPress(playlist)}
            activeOpacity={0.7}
          >
            <Text style={styles.playlistName}>{playlist.name}</Text>
            <Text style={styles.playlistSteps}>
              {playlist.steps.length}개 동작
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Secondary action */}
      <TouchableOpacity
        style={styles.customButton}
        onPress={handleCreateCustom}
        activeOpacity={0.7}
      >
        <Text style={styles.customButtonText}>커스텀 만들기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  characterArea: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  characterIdle: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  characterGentle: {
    backgroundColor: '#F7F9F7',
    borderColor: '#D8E6DC',
  },
  characterPositive: {
    backgroundColor: '#F2F8F4',
    borderColor: '#C8E6D0',
  },
  characterPlaceholder: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  todayWorkoutText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentList: {
    marginTop: 8,
    gap: 8,
  },
  recentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentName: {
    fontSize: 14,
    color: '#000000',
  },
  recentMeta: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  viewHistoryButton: {
    alignSelf: 'center',
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewHistoryText: {
    fontSize: 13,
    color: '#666666',
    textDecorationLine: 'underline',
  },
  guidanceText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  playlistContainer: {
    gap: 16,
    marginBottom: 32,
  },
  playlistCardWrapper: {
    position: 'relative',
  },
  playlistCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#D32F2F',
    lineHeight: 24,
  },
  playlistName: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 4,
    fontWeight: '400',
  },
  playlistSteps: {
    fontSize: 14,
    color: '#666666',
  },
  customButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  customButtonText: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'underline',
  },
});
