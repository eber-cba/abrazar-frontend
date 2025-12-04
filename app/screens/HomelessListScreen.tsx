import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useHomelessList } from '../hooks/useHomeless';
import { usePermissions } from '../hooks/usePermissions';

type Props = NativeStackScreenProps<RootStackParamList, 'HomelessList'>;

export default function HomelessListScreen({ navigation }: Props) {
  const { data: persons, isLoading, error, refetch, isRefetching } = useHomelessList();
  const { canEditHomeless, canDeleteHomeless, role } = usePermissions();

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No hay personas registradas</Text>
      <Text style={styles.emptySubtitle}>
        Los registros aparecerán aquí cuando se agreguen al sistema
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

  const renderPersonCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // TODO: Navigate to detail screen
        console.log('Person selected:', item.id);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>
          {item.firstName} {item.lastName}
        </Text>
        <View style={[styles.badge, item.isActive ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{item.isActive ? 'Activo' : 'Inactivo'}</Text>
        </View>
      </View>
      
      {item.document && (
        <Text style={styles.cardDetail}>📄 {item.document}</Text>
      )}
      
      {item.age && (
        <Text style={styles.cardDetail}>🎂 {item.age} años</Text>
      )}
      
      {item.lastInteraction && (
        <Text style={styles.cardDate}>
          Última interacción: {new Date(item.lastInteraction).toLocaleDateString()}
        </Text>
      )}

      {/* Action buttons based on permissions */}
      {(canEditHomeless || canDeleteHomeless) && (
        <View style={styles.cardActions}>
          {canEditHomeless && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => console.log('Edit:', item.id)}
            >
              <Text style={styles.editButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
          )}
          {canDeleteHomeless && (
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

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando personas...</Text>
      </View>
    );
  }

  if (error && !persons) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Personas Registradas</Text>
        <Text style={styles.headerSubtitle}>
          {persons?.length || 0} {persons?.length === 1 ? 'persona' : 'personas'}
        </Text>
      </View>

      <FlatList
        data={persons || []}
        renderItem={renderPersonCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          !persons || persons.length === 0 ? styles.emptyListContainer : styles.listContainer
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
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#d4edda',
  },
  badgeInactive: {
    backgroundColor: '#f8d7da',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cardDetail: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 8,
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
  editButton:{
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
});
