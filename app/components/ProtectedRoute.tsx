import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCurrentUser } from '../hooks/useAuth';
import { getToken } from '../utils/storage';
import { UserRole, hasRole, Permission, hasPermission } from '../utils/permissions';
import { AccessDenied } from './AccessDenied';

type Props = NativeStackScreenProps<RootStackParamList, any>;

interface ProtectedRouteProps {
  children: React.ReactNode;
  navigation: Props['navigation'];
  /**
   * List of roles that can access this route.
   * User must have at least one of these roles.
   */
  allowedRoles?: UserRole[];
  /**
   * Minimum role level required (uses hierarchy).
   * Example: 'COORDINATOR' means COORDINATOR, ORG_ADMIN, and ADMIN can access.
   */
  minimumRole?: UserRole;
  /**
   * Specific permission required to access this route.
   */
  requiredPermission?: Permission;
  /**
   * Custom fallback component instead of AccessDenied
   */
  fallback?: React.ReactNode;
  /**
   * Whether to redirect to login if not authenticated (default: true)
   */
  redirectToLogin?: boolean;
}

/**
 * ProtectedRoute Component
 * Protects routes that require authentication and/or specific roles/permissions
 */
export function ProtectedRoute({ 
  children, 
  navigation,
  allowedRoles,
  minimumRole,
  requiredPermission,
  fallback,
  redirectToLogin = true,
}: ProtectedRouteProps) {
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

  // Redirect to login if no token and redirectToLogin is true
  useEffect(() => {
    if (hasToken === false && !isLoading && !user && redirectToLogin) {
      navigation.replace('Login');
    }
  }, [user, isLoading, hasToken, navigation, redirectToLogin]);

  // Show loading while checking auth
  if (isLoading || hasToken === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Verificando autenticación...</Text>
      </View>
    );
  }

  // Handle error with token present
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

  // No token and not loading - will redirect
  if (!hasToken && !user) {
    return null;
  }

  const userRole = user?.role as UserRole | undefined;

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => 
      userRole === role || hasRole(userRole, role)
    );
    
    if (!hasAllowedRole) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <AccessDenied
          userRole={userRole}
          requiredRoles={allowedRoles}
          onGoBack={() => navigation.goBack()}
          onGoHome={() => navigation.navigate('Home')}
        />
      );
    }
  }

  // Check minimum role level (hierarchy-based)
  if (minimumRole) {
    if (!hasRole(userRole, minimumRole)) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <AccessDenied
          userRole={userRole}
          requiredRoles={[minimumRole]}
          onGoBack={() => navigation.goBack()}
          onGoHome={() => navigation.navigate('Home')}
        />
      );
    }
  }

  // Check specific permission
  if (requiredPermission) {
    if (!hasPermission(userRole, requiredPermission)) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <AccessDenied
          userRole={userRole}
          onGoBack={() => navigation.goBack()}
          onGoHome={() => navigation.navigate('Home')}
        />
      );
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}

/**
 * Higher-order component version for wrapping screens
 */
export function withProtectedRoute<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children' | 'navigation'>
) {
  return function ProtectedScreen(props: P & { navigation: Props['navigation'] }) {
    return (
      <ProtectedRoute navigation={props.navigation} {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
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
