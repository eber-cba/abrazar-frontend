import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  useStatisticsOverview,
  useCasesByStatus,
  useZoneStatistics,
} from '../hooks/useStatistics';
import { usePermissions } from '../hooks/usePermissions';

type Props = NativeStackScreenProps<RootStackParamList, 'Statistics'>;

export default function StatisticsScreen({ navigation }: Props) {
  const { canViewStats } = usePermissions();
  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useStatisticsOverview();
  const {
    data: casesByStatus,
    isLoading: casesLoading,
    refetch: refetchCases,
  } = useCasesByStatus();
  const {
    data: zones,
    isLoading: zonesLoading,
    refetch: refetchZones,
  } = useZoneStatistics();

  const isLoading = overviewLoading || casesLoading || zonesLoading;

  const handleRefresh = async () => {
    await Promise.all([refetchOverview(), refetchCases(), refetchZones()]);
  };

  if (!canViewStats) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorIcon}>🔒</Text>
        <Text style={styles.errorTitle}>Acceso Denegado</Text>
        <Text style={styles.errorMessage}>
          No tienes permisos para ver estadísticas
        </Text>
      </View>
    );
  }

  if (isLoading && !overview) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '#3498db';
      case 'IN_PROGRESS':
        return '#f39c12';
      case 'RESOLVED':
        return '#2ecc71';
      case 'CLOSED':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Abiertos';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'RESOLVED':
        return 'Resueltos';
      case 'CLOSED':
        return 'Cerrados';
      default:
        return status;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={['#3498db']}
          tintColor="#3498db"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Estadísticas</Text>
        <Text style={styles.headerSubtitle}>Vista general del sistema</Text>
      </View>

      {/* Overview Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.cardsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{overview?.totalHomeless || 0}</Text>
            <Text style={styles.statLabel}>Personas</Text>
            <Text style={styles.statSubtext}>
              {overview?.activeHomeless || 0} activas
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.statIcon}>📁</Text>
            <Text style={styles.statValue}>{overview?.totalCases || 0}</Text>
            <Text style={styles.statLabel}>Casos</Text>
            <Text style={styles.statSubtext}>
              {overview?.openCases || 0} abiertos
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.statIcon}>📍</Text>
            <Text style={styles.statValue}>
              {overview?.totalServicePoints || 0}
            </Text>
            <Text style={styles.statLabel}>Puntos de Servicio</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
            <Text style={styles.statIcon}>👤</Text>
            <Text style={styles.statValue}>{overview?.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
        </View>
      </View>

      {/* Cases by Status */}
      {casesByStatus && casesByStatus.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Casos por Estado</Text>
          {casesByStatus.map((item) => (
            <View key={item.status} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  {getStatusLabel(item.status)}
                </Text>
                <Text style={styles.progressValue}>{item.count}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: getStatusColor(item.status),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {item.percentage.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Zones Statistics */}
      {zones && zones.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas por Zona</Text>
          {zones.map((zone) => (
            <TouchableOpacity key={zone.zoneId} style={styles.zoneCard}>
              <Text style={styles.zoneName}>{zone.zoneName}</Text>
              <View style={styles.zoneStats}>
                <View style={styles.zoneStat}>
                  <Text style={styles.zoneStatValue}>{zone.homelessCount}</Text>
                  <Text style={styles.zoneStatLabel}>Personas</Text>
                </View>
                <View style={styles.zoneStat}>
                  <Text style={styles.zoneStatValue}>{zone.casesCount}</Text>
                  <Text style={styles.zoneStatLabel}>Casos</Text>
                </View>
                <View style={styles.zoneStat}>
                  <Text style={styles.zoneStatValue}>
                    {zone.servicePointsCount}
                  </Text>
                  <Text style={styles.zoneStatLabel}>Puntos</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
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
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 15,
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
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
    textAlign: 'right',
  },
  zoneCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  zoneStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  zoneStat: {
    alignItems: 'center',
  },
  zoneStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
  },
  zoneStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  footer: {
    height: 20,
  },
});
