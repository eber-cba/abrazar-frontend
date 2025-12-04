import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCurrentUser } from '../hooks/useAuth';
import { getToken } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, any>;

interface ProtectedRouteProps {
  children: React.ReactNode;
  navigation: Props['navigation'];
}

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to Login if user is not authenticated
 */
export function ProtectedRoute({ children, navigation }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = useCurrentUser();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // Check if token exists in storage
  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      setHasToken(!!token);
    };
    checkToken();
  }, []);

  useEffect(() => {
    // Only redirect if we've checked for token, there's no token, and we're not loading
    if (hasToken === false && !isLoading && !user) {
      navigation.replace('Login');
    }
  }, [user, isLoading, hasToken, navigation]);

  // Show loading while checking auth or token
  if (isLoading || hasToken === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.text}>Verificando autenticación...</Text>
      </View>
    );
  }

  // If there's an error but we have a token, show error but don't redirect
  // This handles cases where the /me endpoint fails but user might still be authenticated
  if (error && hasToken) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Error al verificar sesión</Text>
        <Text style={styles.errorDetail}>
          {error instanceof Error ? error.message : 'Error inesperado'}
        </Text>
      </View>
    );
  }

  // If no token and not loading, will redirect (handled by useEffect)
  if (!hasToken && !user) {
    return null;
  }

  // User is authenticated or has token, render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
