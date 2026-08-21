import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function AuthLayout() {
  const status = useAuthStore((s) => s.status);

  // If already signed in, don't show auth screens.
  if (status === 'authenticated') {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fdfbf7' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
