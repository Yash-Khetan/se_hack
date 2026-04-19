import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { AttendanceProvider } from '@/context/AttendanceContext';
import { FocusProvider } from '@/context/FocusContext';
import { StressProvider } from '@/context/StressContext';
import { ThemeProvider as LuminaThemeProvider } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { KanbanProvider } from '@/context/KanbanContext';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LuminaThemeProvider>
        <AttendanceProvider>
          <FocusProvider>
            <StressProvider>
              <UserProvider>
                <KanbanProvider>
                  <Stack>
                    <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="meeting" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="expenses" options={{ presentation: 'modal', headerShown: false }} />
                    <Stack.Screen name="kanban" options={{ presentation: 'modal', headerShown: false }} />
                    <Stack.Screen name="stress-heatmap" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                    <Stack.Screen name="emails" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                  </Stack>
                </KanbanProvider>
              </UserProvider>
            </StressProvider>
          </FocusProvider>
        </AttendanceProvider>
      </LuminaThemeProvider>
    </ThemeProvider>
  );
}

