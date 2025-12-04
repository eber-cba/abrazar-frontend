import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      // Llamada al backend
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        // Guardar token en storage
        const { saveToken, saveUserData } = await import('../utils/storage');
        
        if (data.accessToken || data.token) {
          await saveToken(data.accessToken || data.token);
        }
        
        // Guardar datos del usuario si vienen en la respuesta
        if (data.user) {
          await saveUserData(data.user);
        }
        
        // Navegar directamente al Dashboard después del login exitoso
        navigation.replace('Dashboard');
        
        Alert.alert('¡Éxito!', 'Bienvenido a Abrazar');
        
        console.log('Login exitoso - Usuario:', data.user?.name || 'N/A');
      } catch (error) {
        console.error('Error saving login data:', error);
        Alert.alert('Error', 'Login exitoso pero hubo un problema guardando datos');
      }
    },
    onError: (error: any) => {
      console.error('Login Error Details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      Alert.alert('Error de Login', `Status: ${error.response?.status || 'N/A'}\n${errorMessage}`);
    },
  });

  const handleLogin = () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    console.log('Attempting login with:', { email: trimmedEmail });
    loginMutation.mutate({ email: trimmedEmail, password: trimmedPassword });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {loginMutation.isPending ? 'Cargando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Volver al inicio</Text>
      </TouchableOpacity>

      <View style={styles.apiInfo}>
        <Text style={styles.apiInfoText}>
          🔗 Conectado al backend: {api.defaults.baseURL}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    maxWidth: 350,
    height: 50,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
  apiInfo: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 6,
  },
  apiInfoText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});
