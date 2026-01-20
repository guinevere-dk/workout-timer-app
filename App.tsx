import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/ui/screens/HomeScreen';
import { PlayerScreen } from './src/ui/screens/PlayerScreen';
import { CompleteScreen } from './src/ui/screens/CompleteScreen';
import { PickTemplateScreen } from './src/ui/screens/PickTemplateScreen';
import { EditPlaylistScreen } from './src/ui/screens/EditPlaylistScreen';
import { HistoryScreen } from './src/ui/screens/HistoryScreen';
import { runDevSandbox } from './src/domain/devSandbox';
import type { Playlist } from './src/domain/types';

export type RootStackParamList = {
  HomeScreen: undefined;
  PickTemplateScreen: undefined;
  EditPlaylistScreen: { playlist: Playlist };
  PlayerScreen: { playlist: Playlist };
  CompleteScreen: { playlistId: string; playlistName: string };
  HistoryScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="PickTemplateScreen" component={PickTemplateScreen} />
      <Stack.Screen name="EditPlaylistScreen" component={EditPlaylistScreen} />
      <Stack.Screen name="PlayerScreen" component={PlayerScreen} />
      <Stack.Screen name="CompleteScreen" component={CompleteScreen} />
      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ headerShown: true, title: '운동 기록' }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
