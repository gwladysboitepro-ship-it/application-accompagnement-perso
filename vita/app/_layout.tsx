import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts as useNunito,
} from '@expo-google-fonts/nunito';
import {
  Fraunces_900Black,
  Fraunces_700Bold,
  useFonts as useFraunces,
} from '@expo-google-fonts/fraunces';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [nunitoLoaded] = useNunito({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
    'Nunito-ExtraBold': Nunito_800ExtraBold,
  });

  const [frauncesLoaded] = useFraunces({
    'Fraunces-Black': Fraunces_900Black,
    'Fraunces-Bold': Fraunces_700Bold,
  });

  const fontsLoaded = nunitoLoaded && frauncesLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[type]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="celebration" options={{ presentation: 'modal', animation: 'fade' }} />
        <Stack.Screen name="legal" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
