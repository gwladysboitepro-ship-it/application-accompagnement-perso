import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
