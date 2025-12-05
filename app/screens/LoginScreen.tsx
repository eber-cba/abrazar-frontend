import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { saveToken, saveRefreshToken, saveUserData } from '../utils/storage';
import { sessionLogger } from '../utils/session-logger';
import { queryKeys } from '../config/react-query';
import axios from 'axios';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      console.log('🚀 Sending login request...');
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: async (responseData) => {
      try {
        // Backend response: { status, data: { token, refreshToken, user } }
        const data = responseData.data;
        
        console.log('📦 Login response:', {
          hasToken: !!data?.token,
          hasRefreshToken: !!data?.refreshToken,
          hasUser: !!data?.user,
          userRole: data?.user?.role
        });
        
        // Save access token
        if (data?.token) {
          await saveToken(data.token);
          console.log('✅ Access token saved');
        }
        
        // Save refresh token (IMPORTANT for auto-refresh)
        if (data?.refreshToken) {
          await saveRefreshToken(data.refreshToken);
          console.log('✅ Refresh token saved');
        }
        
        // Save user data
        if (data?.user) {
          await saveUserData(data.user);
          console.log('✅ User data saved:', data.user.email);
          
          // Update React Query cache
          queryClient.setQueryData(queryKeys.auth.me, data.user);
        }
        
        // Log successful login
        sessionLogger.logLogin(data?.user?.email);
        
        navigation.replace('Dashboard');
        Alert.alert('¡Éxito!', `Bienvenido ${data?.user?.name || 'a Abrazar'}`);
        
      } catch (error) {
        console.error('❌ Error saving login data:', error);
        Alert.alert('Error', 'Login exitoso pero hubo un problema guardando datos');
      }
    },
    onError: (error: any) => {
      console.error('❌ Login Error:', {
        message: error.message,
        status: error.response?.status,
      });
      
      // Log failed login
      sessionLogger.logAuthError(error.message);
      
      let message = 'Error al iniciar sesión';
      
      if (axios.isAxiosError(error)) {
        // Use userMessage from our error handler if available
        if (error.userMessage) {
          message = error.userMessage;
        } else if (error.response?.status === 401) {
          message = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (error.response?.status === 429) {
          message = 'Demasiados intentos. Por favor espera un momento.';
        } else if (error.response?.data?.message) {
          message = error.response.data.message;
        }
      }
      
      Alert.alert('Error de Login', message);
    },
  });

  const handleLogin = () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    console.log('🔐 Attempting login:', { email: trimmedEmail });
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
        editable={!loginMutation.isPending}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loginMutation.isPending}
      />

      <TouchableOpacity
        style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {loginMutation.isPending ? 'Iniciando sesión...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={loginMutation.isPending}
      >
        <Text style={styles.backButtonText}>← Volver al inicio</Text>
      </TouchableOpacity>

      {__DEV__ && (
        <View style={styles.devInfo}>
          <Text style={styles.devInfoText}>
            🔗 {api.defaults.baseURL}
          </Text>
        </View>
      )}
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
  devInfo: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 6,
  },
  devInfoText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});
