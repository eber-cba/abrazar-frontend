import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './app/navigation/AppNavigator';
import { queryClient } from './app/config/react-query';

/**
 * Main App Component
 * 
 * React Query is configured with:
 * - Smart caching (5min stale time, 10min cache time)
 * - Intelligent retry logic (exponential backoff, network-aware)
 * - Offline-first support
 * - Auto refetch on reconnect and window focus
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
