import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Playlist } from '../../domain/types';
import {
  samplePlaylistEasy,
  samplePlaylistFullBody,
  samplePlaylistRun,
} from '../../domain/samplePlaylists';

type RootStackParamList = {
  HomeScreen: undefined;
  PickTemplateScreen: undefined;
  EditPlaylistScreen: { playlist: Playlist };
};

type NavProp = NativeStackNavigationProp<RootStackParamList, 'PickTemplateScreen'>;

interface Props {
  navigation: NavProp;
}

function deepCopyPlaylistAsCustom(sample: Playlist): Playlist {
  const now = Date.now();
  return {
    ...sample,
    id: `custom-${now}`,
    name: `${sample.name} (커스텀)`,
    isSample: false,
    createdAt: now,
    updatedAt: now,
    steps: sample.steps.map((s, idx) => ({
      ...s,
      // step id 충돌 방지용
      id: `custom-step-${now}-${idx}`,
    })),
  };
}

export function PickTemplateScreen({ navigation }: Props) {
  const templates = [samplePlaylistEasy, samplePlaylistFullBody, samplePlaylistRun];

  const handlePick = (tpl: Playlist) => {
    const copied = deepCopyPlaylistAsCustom(tpl);
    navigation.navigate('EditPlaylistScreen', { playlist: copied });
  };

  const handleBack = () => navigation.goBack();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>어떤 루틴으로 시작할까요?</Text>
      <Text style={styles.sub}>
        하나를 고르면 “커스텀 루틴”으로 복사돼요.
      </Text>

      <View style={styles.list}>
        {templates.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.card}
            onPress={() => handlePick(p)}
            activeOpacity={0.7}
          >
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.meta}>{p.steps.length}개 동작</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
        <Text style={styles.backText}>뒤로</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 20, color: '#000000', textAlign: 'center', marginTop: 8 },
  sub: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  list: { gap: 16, marginBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  name: { fontSize: 18, color: '#000000', marginBottom: 4, fontWeight: '400' },
  meta: { fontSize: 14, color: '#666666' },
  backBtn: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 24 },
  backText: { fontSize: 14, color: '#666666', textDecorationLine: 'underline' },
});
