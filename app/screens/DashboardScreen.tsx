import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCurrentUser, useLogout } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout.mutateAsync();
              navigation.replace('Login');
            } catch (error) {
              console.error('Error during logout:', error);
              // Still navigate even if logout fails
              navigation.replace('Login');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Dashboard</Text>
      
      {user && (
        <View style={styles.userCard}>
          <Text style={styles.welcomeText}>Bienvenido/a,</Text>
          <Text style={styles.userName}>{user.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userRole}>Rol: {user.role}</Text>
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>✅ Sistema conectado:</Text>
        <Text style={styles.infoItem}>• Backend: Railway</Text>
        <Text style={styles.infoItem}>• Autenticación: Activa</Text>
        <Text style={styles.infoItem}>• React Query: Configurado</Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, logout.isPending && styles.logoutButtonDisabled]}
        onPress={handleLogout}
        disabled={logout.isPending}
      >
        <Text style={styles.logoutButtonText}>
          {logout.isPending ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#ecf0f1',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    maxWidth: 350,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
