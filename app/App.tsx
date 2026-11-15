/**
 * GhibliGossip — Main App Entry
 * React Navigation stack wiring all Metaverse screens together.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ── Auth / Login Screen ──
import LoginScreen from './src/screens/LoginScreen';

// ── Real-time Socket Connection ──
import { connectSocket } from './src/services/socketService';

// ── New Screens (Real-time) ──
import CreateRoomScreen from './src/screens/CreateRoomScreen';
import LiveRoomScreen from './src/screens/LiveRoomScreen';

// ── Metaverse Screens ──
import GalaVerseEntryScreen from './src/metaverse/GalaVerseEntryScreen';
import RoomListScreen from './src/metaverse/RoomListScreen';
import MainLobbyScreen from './src/metaverse/MainLobbyScreen';
import LaughVaultScreen from './src/metaverse/LaughVaultScreen';
import GalaverseScreen from './src/metaverse/GalaverseScreen';
import LoungeScreen from './src/metaverse/LoungeScreen';
import TruthDareScreen from './src/metaverse/TruthDareScreen';
import FashionRunwayScreen from './src/metaverse/FashionRunwayScreen';
import VipCinemaScreen from './src/metaverse/VipCinemaScreen';
import SpinBottleScreen from './src/metaverse/SpinBottleScreen';

// ── Navigation Types ──
export type RootStackParamList = {
  Login: undefined;
  GalaVerseEntry: undefined;
  RoomList: undefined;
  CreateRoom: undefined;
  LiveRoom: { roomId: string; roomData?: any };
  MainLobby: undefined;
  LaughVault: undefined;
  GalaverseDance: undefined;
  TruthDare: undefined;
  FashionRunway: undefined;
  VipCinema: undefined;
  SpinBottle: undefined;
  Lounge: { roomId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ── Wrapper Components (to bridge props → navigation) ──

function LoginWrapper({ navigation }: any) {
  return (
    <LoginScreen
      onLoginSuccess={(_user, _isNewUser) => {
        // Connect to real-time Socket.IO server
        connectSocket();

        // After login, navigate to the main entry and remove login from stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'GalaVerseEntry' }],
        });
      }}
    />
  );
}

function GalaVerseEntryWrapper({ navigation }: any) {
  return (
    <GalaVerseEntryScreen
      onEnterBackstage={() => navigation.navigate('RoomList')}
      onCreateRoom={() => navigation.navigate('RoomList')}
      onBack={() => {
        // At root, do nothing or exit
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }}
    />
  );
}

function RoomListWrapper({ navigation }: any) {
  return (
    <RoomListScreen
      onJoinRoom={(roomId: string, roomName: string, roomData?: any) => {
        switch (roomId) {
          case 'lobby':
            navigation.navigate('MainLobby');
            break;
          case 'comedy':
            navigation.navigate('LaughVault');
            break;
          case 'dance':
            navigation.navigate('GalaverseDance');
            break;
          case 'truthdare':
            navigation.navigate('TruthDare');
            break;
          case 'runway':
            navigation.navigate('FashionRunway');
            break;
          case 'vip':
            navigation.navigate('VipCinema');
            break;
          case 'spinbottle':
            navigation.navigate('SpinBottle');
            break;
          case 'acoustic':
          case 'dj':
            navigation.navigate('Lounge', { roomId });
            break;
          default:
            navigation.navigate('LiveRoom', { roomId, roomData });
            break;
        }
      }}
      onCreateRoom={() => navigation.navigate('CreateRoom')}
      onBack={() => navigation.goBack()}
    />
  );
}

function MainLobbyWrapper({ navigation }: any) {
  return (
    <MainLobbyScreen
      onBack={() => navigation.goBack()}
      onShowRooms={() => navigation.navigate('RoomList')}
    />
  );
}

function LaughVaultWrapper({ navigation }: any) {
  return <LaughVaultScreen onBack={() => navigation.goBack()} />;
}

function GalaverseDanceWrapper({ navigation }: any) {
  return <GalaverseScreen onBack={() => navigation.goBack()} />;
}

function TruthDareWrapper({ navigation }: any) {
  return <TruthDareScreen onBack={() => navigation.goBack()} />;
}

function FashionRunwayWrapper({ navigation }: any) {
  return <FashionRunwayScreen onBack={() => navigation.goBack()} />;
}

function VipCinemaWrapper({ navigation }: any) {
  return <VipCinemaScreen onBack={() => navigation.goBack()} />;
}

function SpinBottleWrapper({ navigation }: any) {
  return <SpinBottleScreen onBack={() => navigation.goBack()} />;
}

function CreateRoomWrapper({ navigation }: any) {
  return (
    <CreateRoomScreen
      onRoomCreated={(room: any) => {
        navigation.replace('LiveRoom', { roomId: room._id, roomData: room });
      }}
      onBack={() => navigation.goBack()}
    />
  );
}

function LiveRoomWrapper({ navigation, route }: any) {
  return (
    <LiveRoomScreen
      roomId={route.params?.roomId}
      roomData={route.params?.roomData}
      onBack={() => navigation.goBack()}
    />
  );
}

function LoungeWrapper({ navigation, route }: any) {
  return (
    <LoungeScreen
      roomId={route.params?.roomId || 'acoustic'}
      onBack={() => navigation.goBack()}
    />
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen name="Login" component={LoginWrapper} />
        <Stack.Screen name="GalaVerseEntry" component={GalaVerseEntryWrapper} />
        <Stack.Screen name="RoomList" component={RoomListWrapper} />
        <Stack.Screen name="CreateRoom" component={CreateRoomWrapper} />
        <Stack.Screen name="LiveRoom" component={LiveRoomWrapper} />
        <Stack.Screen name="MainLobby" component={MainLobbyWrapper} />
        <Stack.Screen name="LaughVault" component={LaughVaultWrapper} />
        <Stack.Screen name="GalaverseDance" component={GalaverseDanceWrapper} />
        <Stack.Screen name="TruthDare" component={TruthDareWrapper} />
        <Stack.Screen name="FashionRunway" component={FashionRunwayWrapper} />
        <Stack.Screen name="VipCinema" component={VipCinemaWrapper} />
        <Stack.Screen name="SpinBottle" component={SpinBottleWrapper} />
        <Stack.Screen name="Lounge" component={LoungeWrapper} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

