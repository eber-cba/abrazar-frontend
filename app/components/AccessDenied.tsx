import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserRole, getRoleDisplayName, getRoleBadge } from '../utils/permissions';

interface AccessDeniedProps {
  userRole?: UserRole;
  requiredRoles?: UserRole[];
  onGoBack?: () => void;
  onGoHome?: () => void;
}

/**
 * AccessDenied Component
 * Shown when user doesn't have permission to access a screen
 */
export function AccessDenied({ 
  userRole, 
  requiredRoles, 
  onGoBack, 
  onGoHome 
}: AccessDeniedProps) {
  const currentRoleBadge = getRoleBadge(userRole);
  
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🚫</Text>
      <Text style={styles.title}>Acceso Denegado</Text>
      
      <Text style={styles.message}>
        No tienes permisos para acceder a esta sección.
      </Text>

      {userRole && (
        <View style={styles.roleInfo}>
          <Text style={styles.roleLabel}>Tu rol actual:</Text>
          <View style={[styles.badge, { backgroundColor: currentRoleBadge.color }]}>
            <Text style={styles.badgeText}>
              {currentRoleBadge.icon} {getRoleDisplayName(userRole)}
            </Text>
          </View>
        </View>
      )}

      {requiredRoles && requiredRoles.length > 0 && (
        <View style={styles.requiredSection}>
          <Text style={styles.requiredLabel}>Roles requeridos:</Text>
          <View style={styles.requiredList}>
            {requiredRoles.map((role) => {
              const badge = getRoleBadge(role);
              return (
                <View 
                  key={role} 
                  style={[styles.requiredBadge, { borderColor: badge.color }]}
                >
                  <Text style={[styles.requiredBadgeText, { color: badge.color }]}>
                    {badge.icon} {getRoleDisplayName(role)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {onGoBack && (
          <TouchableOpacity style={styles.button} onPress={onGoBack}>
            <Text style={styles.buttonText}>← Volver</Text>
          </TouchableOpacity>
        )}
        {onGoHome && (
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={onGoHome}
          >
            <Text style={styles.primaryButtonText}>🏠 Ir al Inicio</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  icon: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  roleInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  requiredSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  requiredLabel: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 12,
  },
  requiredList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  requiredBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  requiredBadgeText: {
    fontWeight: '500',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
  },
  buttonText: {
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
