// src/domain/playlistsStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Playlist } from './types';

const STORAGE_KEY = 'custom_playlists_v1';

export async function loadCustomPlaylists(): Promise<Playlist[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Playlist[];

    // 혹시 샘플이 섞여 들어가도 방어
    return parsed.filter((p) => !p.isSample);
  } catch (e) {
    console.warn('loadCustomPlaylists error', e);
    return [];
  }
}

export async function saveCustomPlaylists(playlists: Playlist[]): Promise<void> {
  try {
    const onlyCustom = playlists.filter((p) => !p.isSample);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(onlyCustom));
  } catch (e) {
    console.warn('saveCustomPlaylists error', e);
  }
}

/**
 * 하나의 커스텀 플레이리스트를 추가/업데이트
 */
export async function upsertCustomPlaylist(playlist: Playlist): Promise<void> {
  const existing = await loadCustomPlaylists();

  const idx = existing.findIndex((p) => p.id === playlist.id);
  if (idx >= 0) {
    existing[idx] = playlist;
  } else {
    existing.push(playlist);
  }

  await saveCustomPlaylists(existing);
}

/**
 * 커스텀 플레이리스트 삭제
 * sample playlist는 loadCustomPlaylists에서 이미 제외되므로 삭제 대상이 아님
 */
export async function deleteCustomPlaylist(id: string): Promise<void> {
  const existing = await loadCustomPlaylists();
  const filtered = existing.filter((p) => p.id !== id);
  await saveCustomPlaylists(filtered);
}
