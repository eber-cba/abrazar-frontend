import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCurrentUser, useLogout } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
// Temporarily disabled until backend endpoint is confirmed
// import { useStatisticsOverview } from '../hooks/useStatistics';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

interface NavigationCard {
  title: string;
  icon: string;
  screen: keyof RootStackParamList;
  color: string;
  enabled: boolean;
  count?: number;
}

export default function DashboardScreen({ navigation }: Props) {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  
  // Disable statistics temporarily if endpoint is not available
  // const { data: stats, isLoading: statsLoading } = useStatisticsOverview();
  const stats = null; // Placeholder until backend endpoint is confirmed
  
  const { 
    role, 
    roleBadge, 
    roleDisplayName,
    canViewHomeless,
    canViewCases,
    canViewServicePoints,
    canViewStats,
  } = usePermissions();

  const navigationCards: NavigationCard[] = [
    {
      title: 'Personas',
      icon: '👥',
      screen: 'HomelessList',
      color: '#3498db',
      enabled: canViewHomeless,
    },
    {
      title: 'Casos',
      icon: '📁',
      screen: 'CasesList',
      color: '#9b59b6',
      enabled: canViewCases,
    },
    {
      title: 'Estadísticas',
      icon: '📊',
      screen: 'Statistics',
      color: '#e74c3c',
      enabled: canViewStats,
    },
    {
      title: 'Puntos de Servicio',
      icon: '📍',
      screen: 'ServicePoints',
      color: '#27ae60',
      enabled: canViewServicePoints,
    },
  ];

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
              navigation.replace('Login');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏠 Dashboard</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name || 'Usuario'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleBadge.color }]}>
              <Text style={styles.roleBadgeText}>
                {roleBadge.icon} {roleBadge.label}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Quick Stats - Disabled until backend endpoint is available */}
      {/* {canViewStats && stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Resumen Rápido</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statValue}>{stats.totalHomeless || 0}</Text>
              <Text style={styles.statLabel}>Personas</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
              <Text style={styles.statIcon}>📁</Text>
              <Text style={styles.statValue}>{stats.openCases || 0}</Text>
              <Text style={styles.statLabel}>Casos Abiertos</Text>
            </View>
          </View>
        </View>
      )} */}

      {/* Navigation Cards */}
      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>Acceso Rápido</Text>
        <View style={styles.cardsGrid}>
          {navigationCards
            .filter(card => card.enabled)
            .map((card) => (
              <TouchableOpacity
                key={card.screen}
                style={[styles.navCard, { borderLeftColor: card.color }]}
                onPress={() => navigation.navigate(card.screen as any)}
              >
                <View style={styles.navCardHeader}>
                  <Text style={styles.navCardIcon}>{card.icon}</Text>
                  {card.count !== undefined && (
                    <View style={[styles.countBadge, { backgroundColor: card.color }]}>
                      <Text style={styles.countText}>{card.count}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.navCardTitle}>{card.title}</Text>
                <Text style={styles.navCardArrow}>→</Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, logout.isPending && styles.logoutButtonDisabled]}
        onPress={handleLogout}
        disabled={logout.isPending}
      >
        <Text style={styles.logoutButtonText}>
          {logout.isPending ? 'Cerrando sesión...' : '🚪 Cerrar Sesión'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    color: '#34495e',
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsContainer: {
    marginBottom: 25,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  navigationSection: {
    marginBottom: 25,
  },
  cardsGrid: {
    gap: 12,
  },
  navCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navCardIcon: {
    fontSize: 32,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navCardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 15,
  },
  navCardArrow: {
    fontSize: 24,
    color: '#bdc3c7',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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
  footer: {
    height: 20,
  },
});
