import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getToken, getUserData } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = await getToken();
    const userData = await getUserData();
    setIsAuthenticated(!!token);
    setUserName(userData?.name || '');
  };

  if (isAuthenticated === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Bienvenido a Abrazar</Text>
      <Text style={styles.subtitle}>
        Plataforma de asistencia a personas en situación de calle
      </Text>
      
      {isAuthenticated && userName && (
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>👋 Hola, {userName}</Text>
          <Text style={styles.welcomeSubtext}>Sesión activa</Text>
        </View>
      )}
      
      {!isAuthenticated && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Ir a Login</Text>
        </TouchableOpacity>
      )}

      {isAuthenticated && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Ir al Panel</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('HomelessList')}
      >
        <Text style={styles.buttonText}>📋 Ver Lista de Personas</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>✅ Configuración lista:</Text>
        <Text style={styles.infoItem}>• React Navigation</Text>
        <Text style={styles.infoItem}>• React Query</Text>
        <Text style={styles.infoItem}>• TypeScript</Text>
        <Text style={styles.infoItem}>• Expo Web + Mobile</Text>
      </View>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#2ecc71',
  },
  welcomeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#2ecc71',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#ecf0f1',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
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
});
