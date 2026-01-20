// src/ui/screens/EditPlaylistScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  LayoutChangeEvent,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import type { Playlist, Step, StepPhase } from '../../domain/types';
import {
  validatePlaylist,
  getTotalDurationSec,
} from '../../domain/validatePlaylist';
import { LIMITS } from '../../domain/constraints';
import { upsertCustomPlaylist } from '../../domain/playlistsStorage';
import {
  insertStepAfter,
  removeStepAt,
  moveStep as moveStepByIndex,
} from '../../domain/editSteps';
import { getExerciseLabel } from '../../domain/exerciseLabels';

type RootStackParamList = {
  HomeScreen: undefined;
  EditPlaylistScreen: { playlist: Playlist };
};

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditPlaylistScreen'
>;
type RouteP = RouteProp<RootStackParamList, 'EditPlaylistScreen'>;

interface Props {
  navigation: NavProp;
  route: RouteP;
}

// 운동 선택 후보들 (표시용 라벨)
const EXERCISE_OPTIONS = [
  '빠른 걷기',
  '제자리 달리기',
  '점핑 잭',
  '스쿼트',
  '런지',
  '푸시업',
  '플랭크',
  '버피',
];

// 🔹 현재 step 배열에서 phase 자동 계산
function computePhases(steps: Step[]): Step[] {
  if (steps.length === 0) return steps;

  const cloned = steps.map(s => ({ ...s }));

  const exerciseIndices = cloned
    .map((s, idx) => (s.type === 'exercise' ? idx : -1))
    .filter(idx => idx >= 0);

  if (exerciseIndices.length === 0) {
    // 전부 휴식이면 전부 phase='rest'
    return cloned.map(s =>
      s.type === 'rest' ? { ...s, phase: 'rest' as StepPhase } : s,
    );
  }

  const firstEx = exerciseIndices[0];
  const lastEx = exerciseIndices[exerciseIndices.length - 1];

  return cloned.map((step, idx) => {
    if (step.type === 'rest') {
      return { ...step, phase: 'rest' as StepPhase };
    }

    if (idx === firstEx) {
      return { ...step, phase: 'warmup' as StepPhase };
    }

    if (idx === lastEx) {
      return { ...step, phase: 'cooldown' as StepPhase };
    }

    return { ...step, phase: 'exercise' as StepPhase };
  });
}

// 🔹 Playlist 전체에 phase를 채워주는 헬퍼
function withComputedPhases(base: Playlist): Playlist {
  return {
    ...base,
    steps: computePhases(base.steps),
  };
}

export function EditPlaylistScreen({ navigation, route }: Props) {
  const [playlist, setPlaylist] = useState<Playlist>(() => {
    const base = route.params.playlist;
    const now = Date.now();
    const isFromSample = base.isSample;
    const normalized: Playlist = {
      ...base,
      id: isFromSample ? `custom-${now}` : base.id,
      name: isFromSample ? `${base.name} (커스텀)` : base.name,
      isSample: false,
      createdAt: base.createdAt ?? now,
      updatedAt: now,
    };
    // phase 자동 계산
    return withComputedPhases(normalized);
  });

  const [nameTouched, setNameTouched] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);

  // 운동 선택 모달 관련 상태
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(
    null,
  );

  const onFooterLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h !== footerHeight) setFooterHeight(h);
  };

  // 총 시간
  const totalSec = useMemo(() => getTotalDurationSec(playlist), [playlist]);
  const totalMinApprox = Math.round((totalSec / 60) * 10) / 10;
  const totalMinutes = Math.floor(totalSec / 60);
  const totalSeconds = totalSec % 60;
  const totalLabel = `${totalMinutes}분 ${totalSeconds
    .toString()
    .padStart(2, '0')}초`;

  // 유효성 검사
  const rawErrors = useMemo(() => validatePlaylist(playlist), [playlist]);
  const isNameEmpty = playlist.name.trim().length === 0;

  const filteredErrors = useMemo(
    () => rawErrors.filter(e => e.code !== 'NAME_REQUIRED'),
    [rawErrors],
  );

  const isValidName = !isNameEmpty;
  const isValidDomain = filteredErrors.length === 0;
  const isValid = isValidName && isValidDomain;

  // 시간 조정
  const updateStepDuration = (index: number, delta: number) => {
    setPlaylist(prev => {
      const steps = [...prev.steps];
      const step = steps[index];

      const nextSec = step.durationSec + delta;
      if (
        nextSec < LIMITS.STEP_MIN_SEC ||
        nextSec > LIMITS.STEP_MAX_SEC
      ) {
        return prev;
      }

      steps[index] = {
        ...step,
        durationSec: nextSec,
      };

      const recomputed = computePhases(steps);
      return {
        ...prev,
        steps: recomputed,
        updatedAt: Date.now(),
      };
    });
  };

  // 순서 변경 (위로/아래로) – 도메인 moveStepByIndex 사용
  const handleMoveStep = (index: number, dir: 'up' | 'down') => {
    setPlaylist(prev => {
      const to = dir === 'up' ? index - 1 : index + 1;
      const moved = moveStepByIndex(prev, index, to);
      return withComputedPhases({
        ...moved,
        updatedAt: Date.now(),
      });
    });
  };

  // 운동 이름 선택 모달 열기
  const openExerciseModal = (index: number) => {
    setSelectedStepIndex(index);
    setExerciseModalVisible(true);
  };

  const closeExerciseModal = () => {
    setExerciseModalVisible(false);
    setSelectedStepIndex(null);
  };

  const handleSelectExercise = (label: string) => {
    if (selectedStepIndex == null) return;

    setPlaylist(prev => {
      const steps = [...prev.steps];
      const step = steps[selectedStepIndex];

      steps[selectedStepIndex] = {
        ...step,
        label,
        // 필요하다면 여기서 exerciseType도 함께 매핑해줄 수 있음
      };

      return withComputedPhases({
        ...prev,
        steps,
        updatedAt: Date.now(),
      });
    });

    closeExerciseModal();
  };

  const handleSave = async () => {
    if (!isValid) return;
    await upsertCustomPlaylist(playlist);
    navigation.navigate('HomeScreen');
  };

  const handleBack = () => navigation.goBack();

  const handleChangeName = (text: string) => {
    setPlaylist(prev => ({
      ...prev,
      name: text,
      updatedAt: Date.now(),
    }));
  };

  const renderPhaseLabel = (step: Step) => {
    switch (step.phase) {
      case 'warmup':
        return '준비운동';
      case 'exercise':
        return '운동';
      case 'cooldown':
        return '마무리운동';
      case 'rest':
        return '휴식';
      default:
        return '운동';
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.root}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: 24 + footerHeight },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>커스텀 루틴 편집</Text>

            {/* 루틴 이름 카드 */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>루틴 이름</Text>

              <TextInput
                style={styles.nameInput}
                placeholder="예: 아침 5분 루틴"
                placeholderTextColor="#BBBBBB"
                value={playlist.name}
                onChangeText={handleChangeName}
                onBlur={() => setNameTouched(true)}
                returnKeyType="done"
              />

              {nameTouched && isNameEmpty && (
                <Text style={styles.nameError}>루틴 이름을 적어주세요.</Text>
              )}

              <Text style={styles.meta}>
                {playlist.steps.length}개 동작 · 총 약 {totalMinApprox}분
              </Text>
            </View>

            {/* 스텝 리스트 */}
            <View style={styles.stepList}>
              {playlist.steps.map((step, index) => {
                const isExercise = step.type === 'exercise';
                const isFirst = index === 0;
                const isLast = index === playlist.steps.length - 1;

                return (
                  <View key={step.id} style={styles.stepCard}>
                    <Text style={styles.stepIndex}>{index + 1}</Text>

                    <View style={styles.stepBody}>
                      <Text style={styles.stepType}>
                        {renderPhaseLabel(step)}
                      </Text>

                      {isExercise ? (
                        <TouchableOpacity
                          onPress={() => openExerciseModal(index)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.stepName}>
                            {step.label ||
                              getExerciseLabel((step as any).exerciseType)}
                          </Text>
                          <Text style={styles.stepSubLabel}>
                            (탭해서 운동을 고르세요)
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.stepName}>
                          {step.label || '휴식'}
                        </Text>
                      )}

                      <Text style={styles.stepTime}>
                        {step.durationSec}초
                      </Text>

                      {/* 시간 */}
                      <Text style={styles.sectionLabel}>시간</Text>
                      <View style={styles.controlsRow}>
                        <TouchableOpacity
                          onPress={() => updateStepDuration(index, -10)}
                          style={styles.adjustBtn}
                        >
                          <Text style={styles.adjustText}>-10</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => updateStepDuration(index, +10)}
                          style={styles.adjustBtn}
                        >
                          <Text style={styles.adjustText}>+10</Text>
                        </TouchableOpacity>
                      </View>

                      {/* 순서 */}
                      <Text style={styles.sectionLabel}>순서</Text>
                      <View style={styles.reorderRow}>
                        <TouchableOpacity
                          onPress={() => handleMoveStep(index, 'up')}
                          disabled={isFirst}
                          style={[
                            styles.reorderBtn,
                            isFirst && styles.reorderBtnDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.reorderText,
                              isFirst && styles.reorderTextDisabled,
                            ]}
                          >
                            위로
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleMoveStep(index, 'down')}
                          disabled={isLast}
                          style={[
                            styles.reorderBtn,
                            isLast && styles.reorderBtnDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.reorderText,
                              isLast && styles.reorderTextDisabled,
                            ]}
                          >
                            아래로
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* 구조 */}
                      <Text style={styles.sectionLabel}>구조</Text>
                      <View style={styles.editRow}>
                        <TouchableOpacity
                          onPress={() =>
                            setPlaylist(prev =>
                              withComputedPhases({
                                ...insertStepAfter(prev, index, 'exercise'),
                                updatedAt: Date.now(),
                              }),
                            )
                          }
                          style={[
                            styles.editBtn,
                            step.type === 'rest' && styles.editBtnEmphasized,
                          ]}
                        >
                          <Text
                            style={[
                              styles.editText,
                              step.type === 'rest' && styles.editTextEmphasized,
                            ]}
                          >
                            +운동
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() =>
                            setPlaylist(prev =>
                              withComputedPhases({
                                ...insertStepAfter(prev, index, 'rest'),
                                updatedAt: Date.now(),
                              }),
                            )
                          }
                          style={[
                            styles.editBtn,
                            step.type === 'rest' && styles.editBtnDeemphasized,
                          ]}
                        >
                          <Text
                            style={[
                              styles.editText,
                              step.type === 'rest' && styles.editTextDeemphasized,
                            ]}
                          >
                            +휴식
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() =>
                            setPlaylist(prev =>
                              withComputedPhases({
                                ...removeStepAt(prev, index),
                                updatedAt: Date.now(),
                              }),
                            )
                          }
                          style={[styles.editBtn, styles.deleteBtn]}
                        >
                          <Text style={styles.deleteText}>삭제</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* 에러 박스 */}
            {(!isValidName || !isValidDomain) && (
              <View style={styles.errorsBox}>
                {!isValidName && (
                  <Text style={styles.errorText}>
                    • 루틴 이름을 적어주세요.
                  </Text>
                )}

                {filteredErrors.map(e => (
                  <Text key={e.code} style={styles.errorText}>
                    • {e.message}
                  </Text>
                ))}
              </View>
            )}

            {/* 저장 / 뒤로 버튼 */}
            <View style={styles.buttonsWrapper}>
              <TouchableOpacity
                style={[styles.primaryButton, !isValid && styles.disabled]}
                onPress={handleSave}
                disabled={!isValid}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>저장</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.backText}>뒤로</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* 하단 고정 총 시간 바 */}
          <View style={styles.totalBar} onLayout={onFooterLayout}>
            <Text
              style={[
                styles.totalBarText,
                totalSec < 180 && styles.totalBarTextWarning,
              ]}
            >
              총 시간 {totalLabel} / 최소 3분
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 운동 선택 모달 */}
      <Modal
        visible={exerciseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeExerciseModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>운동 선택</Text>

            <ScrollView style={{ maxHeight: 320 }}>
              {EXERCISE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalItem}
                  onPress={() => handleSelectExercise(option)}
                >
                  <Text style={styles.modalItemText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={closeExerciseModal}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  content: { padding: 24 },

  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },

  totalBar: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  totalBarText: { color: '#000', fontSize: 14 },
  totalBarTextWarning: { color: '#D32F2F' },

  card: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
  },
  cardLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  nameInput: {
    borderWidth: 0,
    paddingVertical: 4,
    paddingHorizontal: 0,
    fontSize: 18,
    color: '#000',
    marginBottom: 4,
  },
  nameError: { fontSize: 13, color: '#D32F2F', marginBottom: 8 },
  meta: { fontSize: 14, color: '#666', marginTop: 4 },

  stepList: { gap: 12 },

  stepCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  stepIndex: {
    width: 24,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginRight: 8,
  },
  stepBody: { flex: 1 },
  stepType: { fontSize: 12, color: '#666' },
  stepName: { fontSize: 16, marginTop: 2, color: '#000' },
  stepSubLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  stepTime: { fontSize: 14, marginTop: 6, color: '#000' },

  sectionLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 12,
    marginBottom: 4,
  },

  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 0,
  },
  adjustBtn: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  adjustText: { fontSize: 14, color: '#000' },

  reorderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 0,
  },
  reorderBtn: {
    flexGrow: 0,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  reorderBtnDisabled: {
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5',
  },
  reorderText: {
    fontSize: 13,
    color: '#000',
  },
  reorderTextDisabled: {
    color: '#AAAAAA',
  },

  // 추가/삭제 버튼 row
  editRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 0,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  editText: {
    fontSize: 13,
    color: '#000',
  },
  editBtnEmphasized: {
    borderWidth: 1.5,
    borderColor: '#000',
  },
  editTextEmphasized: {
    fontWeight: '600',
  },
  editBtnDeemphasized: {
    opacity: 0.5,
  },
  editTextDeemphasized: {
    opacity: 0.5,
  },
  deleteBtn: {
    borderColor: '#D32F2F',
    marginLeft: 'auto',
  },
  deleteText: {
    fontSize: 13,
    color: '#D32F2F',
  },

  errorsBox: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  errorText: { fontSize: 13, color: '#666' },

  buttonsWrapper: { marginTop: 24 },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: { fontSize: 18, color: '#FFF' },
  disabled: { opacity: 0.3 },

  backBtn: { marginTop: 16, alignItems: 'center' },
  backText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },

  // 모달 스타일
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#000',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
  },
  modalCancelBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 15,
    color: '#666',
  },
});
