import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';
import { LoadingState } from '../src/components/States';
import { colors } from '../src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (status === 'restoring') {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LoadingState label="Loading your session…" />
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={colors.emeraldDark} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.emeraldDark },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.cream },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="produce/index" options={{ title: 'My Produce' }} />
          <Stack.Screen name="produce/new" options={{ title: 'New Produce', presentation: 'modal' }} />
          <Stack.Screen name="orders/index" options={{ title: 'Orders' }} />
          <Stack.Screen name="orders/[id]" options={{ title: 'Order Details' }} />
          <Stack.Screen name="services/[id]" options={{ title: 'Service Details' }} />
          <Stack.Screen name="services/request" options={{ title: 'Request Service', presentation: 'modal' }} />
          <Stack.Screen name="marketplace/[id]" options={{ title: 'Produce Details' }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
