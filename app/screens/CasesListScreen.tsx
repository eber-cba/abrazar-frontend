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
import { useCasesList, CaseData } from '../hooks/useCases';
import { usePermissions } from '../hooks/usePermissions';

type Props = NativeStackScreenProps<RootStackParamList, 'CasesList'>;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return { bg: '#e3f2fd', text: '#1565c0' };
    case 'IN_PROGRESS':
      return { bg: '#fff3e0', text: '#e65100' };
    case 'RESOLVED':
      return { bg: '#e8f5e9', text: '#2e7d32' };
    case 'CLOSED':
      return { bg: '#eceff1', text: '#546e7a' };
    default:
      return { bg: '#f5f5f5', text: '#757575' };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'Abierto';
    case 'IN_PROGRESS':
      return 'En Progreso';
    case 'RESOLVED':
      return 'Resuelto';
    case 'CLOSED':
      return 'Cerrado';
    default:
      return status;
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return '🔴';
    case 'HIGH':
      return '🟠';
    case 'MEDIUM':
      return '🟡';
    case 'LOW':
      return '🟢';
    default:
      return '⚪';
  }
};

export default function CasesListScreen({ navigation }: Props) {
  const { data: cases, isLoading, error, refetch, isRefetching } = useCasesList();
  const { canEditCases, canDeleteCases, canAssignCases } = usePermissions();

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📁</Text>
      <Text style={styles.emptyTitle}>No hay casos registrados</Text>
      <Text style={styles.emptySubtitle}>
        Los casos aparecerán aquí cuando se creen en el sistema
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Error al cargar casos</Text>
      <Text style={styles.errorMessage}>
        {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCaseCard = ({ item }: { item: CaseData }) => {
    const statusColors = getStatusColor(item.status);
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          // TODO: Navigate to case detail
          console.log('Case selected:', item.id);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.priorityIcon}>{getPriorityIcon(item.priority)}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.homeless?.firstName} {item.homeless?.lastName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {item.assignedTo && (
          <View style={styles.assignedRow}>
            <Text style={styles.assignedLabel}>Asignado a:</Text>
            <Text style={styles.assignedName}>{item.assignedTo.name}</Text>
          </View>
        )}

        <Text style={styles.dateText}>
          Creado: {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        {/* Actions based on permissions */}
        {(canEditCases || canDeleteCases || canAssignCases) && (
          <View style={styles.cardActions}>
            {canAssignCases && !item.assignedToId && (
              <TouchableOpacity
                style={styles.assignButton}
                onPress={() => console.log('Assign:', item.id)}
              >
                <Text style={styles.assignButtonText}>👤 Asignar</Text>
              </TouchableOpacity>
            )}
            {canEditCases && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => console.log('Edit:', item.id)}
              >
                <Text style={styles.editButtonText}>✏️ Editar</Text>
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
        <Text style={styles.loadingText}>Cargando casos...</Text>
      </View>
    );
  }

  if (error && !cases) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Casos</Text>
        <Text style={styles.headerSubtitle}>
          {cases?.length || 0} {cases?.length === 1 ? 'caso' : 'casos'}
        </Text>
      </View>

      {/* Status filter tabs */}
      <View style={styles.filterTabs}>
        {['Todos', 'Abiertos', 'En Progreso', 'Resueltos'].map((filter) => (
          <TouchableOpacity key={filter} style={styles.filterTab}>
            <Text style={styles.filterTabText}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={cases || []}
        renderItem={renderCaseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          !cases || cases.length === 0 ? styles.emptyListContainer : styles.listContainer
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
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#ecf0f1',
  },
  filterTabText: {
    fontSize: 13,
    color: '#7f8c8d',
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 10,
    lineHeight: 20,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignedLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginRight: 5,
  },
  assignedName: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#95a5a6',
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
  assignButton: {
    flex: 1,
    backgroundColor: '#9b59b6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
});
