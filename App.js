import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LandingScreen from './src/screens/LandingScreen';
import CreateRoomScreen from './src/screens/CreateRoomScreen';
import JoinRoomScreen from './src/screens/JoinRoomScreen';
import MeetingScreen from './src/screens/MeetingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D1B" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#6C5CE7',
            background: '#0B0D1B',
            card: '#111328',
            text: '#F1F5F9',
            border: 'rgba(255,255,255,0.10)',
            notification: '#A855F7',
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '800' },
          },
        }}
      >
        <Stack.Navigator
          initialRouteName="Landing"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0B0D1B' },
            gestureEnabled: true,
            animationEnabled: true,
            presentation: 'card',
          }}
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen
            name="CreateRoom"
            component={CreateRoomScreen}
            options={{
              presentation: 'modal',
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen
            name="JoinRoom"
            component={JoinRoomScreen}
            options={{
              presentation: 'modal',
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen
            name="Meeting"
            component={MeetingScreen}
            options={{
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
