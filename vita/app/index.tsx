import { Redirect } from 'expo-router';
import { useUserStore } from '../lib/store/useUser';

export default function Index() {
  const user = useUserStore((s) => s.user);
  if (user?.onboardingComplete) {
    return <Redirect href="/(tabs)/" />;
  }
  return <Redirect href="/(auth)/splash" />;
}
