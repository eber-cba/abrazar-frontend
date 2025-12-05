import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useServicePoints } from '../hooks/useServicePoints';
import { usePermissions } from '../hooks/usePermissions';

type Props = NativeStackScreenProps<RootStackParamList, 'ServicePoints'>;

const SERVICE_POINT_TYPES = {
  FOOD: { label: 'Comedor', icon: '🍽️', color: '#e74c3c' },
  SHELTER: { label: 'Refugio', icon: '🏠', color: '#3498db' },
  HEALTH: { label: 'Salud', icon: '🏥', color: '#2ecc71' },
  EDUCATION: { label: 'Educación', icon: '📚', color: '#9b59b6' },
  EMPLOYMENT: { label: 'Empleo', icon: '💼', color: '#f39c12' },
  LEGAL: { label: 'Legal', icon: '⚖️', color: '#34495e' },
  OTHER: { label: 'Otro', icon: '📍', color: '#95a5a6' },
};

export default function ServicePointsScreen({ navigation }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { data: servicePoints, isLoading, error, refetch, isRefetching } = useServicePoints();
  const { canCreateServicePoint, canEditServicePoint, canDeleteServicePoint } = usePermissions();

  const filteredPoints = selectedType
    ? servicePoints?.filter((point: any) => point.type === selectedType)
    : servicePoints;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📍</Text>
      <Text style={styles.emptyTitle}>No hay puntos de servicio</Text>
      <Text style={styles.emptySubtitle}>
        Los puntos de servicio disponibles aparecerán aquí
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Error al cargar datos</Text>
      <Text style={styles.errorMessage}>
        {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderServicePointCard = ({ item }: { item: any }) => {
    const typeInfo = SERVICE_POINT_TYPES[item.type as keyof typeof SERVICE_POINT_TYPES] || SERVICE_POINT_TYPES.OTHER;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          console.log('Service point selected:', item.id);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
            <View style={[styles.typeBadge, { backgroundColor: typeInfo.color }]}>
              <Text style={styles.typeText}>{typeInfo.label}</Text>
            </View>
          </View>
          {item.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>Activo</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardName}>{item.name}</Text>

        {item.address && (
          <Text style={styles.cardDetail}>📍 {item.address}</Text>
        )}

        {item.phone && (
          <Text style={styles.cardDetail}>📞 {item.phone}</Text>
        )}

        {item.schedule && (
          <Text style={styles.cardDetail}>🕐 {item.schedule}</Text>
        )}

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Action buttons based on permissions */}
        {(canEditServicePoint || canDeleteServicePoint) && (
          <View style={styles.cardActions}>
            {canEditServicePoint && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => console.log('Edit:', item.id)}
              >
                <Text style={styles.editButtonText}>✏️ Editar</Text>
              </TouchableOpacity>
            )}
            {canDeleteServicePoint && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => console.log('Delete:', item.id)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando puntos de servicio...</Text>
      </View>
    );
  }

  if (error && !servicePoints) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Puntos de Servicio</Text>
        <Text style={styles.headerSubtitle}>
          {filteredPoints?.length || 0} {filteredPoints?.length === 1 ? 'punto' : 'puntos'}
        </Text>
      </View>

      {/* Type Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedType && styles.filterChipActive]}
            onPress={() => setSelectedType(null)}
          >
            <Text style={[styles.filterChipText, !selectedType && styles.filterChipTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          {Object.entries(SERVICE_POINT_TYPES).map(([type, info]) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={styles.filterChipIcon}>{info.icon}</Text>
              <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
                {info.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPoints || []}
        renderItem={renderServicePointCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          !filteredPoints || filteredPoints.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      />

      {canCreateServicePoint && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => console.log('Create new service point')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
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
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  filterChipActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  listContainer: {
    padding: 15,
  },
  emptyListContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  activeBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  cardDetail: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});
