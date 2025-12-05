/**
 * Role-Based Access Control (RBAC)
 * Permission utilities for controlling access based on user roles
 * 
 * Role Hierarchy (lowest to highest):
 * VOLUNTEER < SOCIAL_WORKER < COORDINATOR < ORGANIZATION_ADMIN < ADMIN
 */

export type UserRole = 'ADMIN' | 'ORGANIZATION_ADMIN' | 'COORDINATOR' | 'SOCIAL_WORKER' | 'VOLUNTEER';

// Role hierarchy from lowest to highest
const ROLE_HIERARCHY: UserRole[] = [
  'VOLUNTEER',
  'SOCIAL_WORKER',
  'COORDINATOR',
  'ORGANIZATION_ADMIN',
  'ADMIN',
];

/**
 * Check if user has at least the required role level
 */
export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  
  return userIndex >= requiredIndex;
}

/**
 * Permission checks based on role hierarchy
 */
export const canEdit = (role: UserRole | undefined) => hasRole(role, 'SOCIAL_WORKER');
export const canDelete = (role: UserRole | undefined) => hasRole(role, 'ORGANIZATION_ADMIN');
export const canManageTeams = (role: UserRole | undefined) => hasRole(role, 'COORDINATOR');
export const canManageZones = (role: UserRole | undefined) => hasRole(role, 'ORGANIZATION_ADMIN');
export const canManageServicePoints = (role: UserRole | undefined) => hasRole(role, 'ORGANIZATION_ADMIN');
export const isAdmin = (role: UserRole | undefined) => role === 'ADMIN';

/**
 * Specific permission checks for UI
 */

// Homeless/Persons permissions
export const canViewHomeless = (role: UserRole | undefined) => hasRole(role, 'VOLUNTEER');
export const canCreateHomeless = (role: UserRole | undefined) => hasRole(role, 'VOLUNTEER');
export const canEditHomeless = (role: UserRole | undefined) => hasRole(role, 'SOCIAL_WORKER');
export const canDeleteHomeless = (role: UserRole | undefined) => hasRole(role, 'ORGANIZATION_ADMIN');

// Cases permissions
export const canViewCases = (role: UserRole | undefined) => hasRole(role, 'VOLUNTEER');
export const canCreateCases = (role: UserRole | undefined) => hasRole(role, 'VOLUNTEER');
export const canEditCases = (role: UserRole | undefined) => hasRole(role, 'SOCIAL_WORKER');
export const canDeleteCases = (role: UserRole | undefined) => hasRole(role, 'ORGANIZATION_ADMIN');
export const canAssignCases = (role: UserRole | undefined) => hasRole(role, 'COORDINATOR');

// Service Points permissions
export const canViewServicePoints = (role: UserRole | undefined) => hasRole(role, 'VOLUNTEER');
export const canCreateServicePoint = (role: UserRole | undefined) => hasRole(role, 'ORGANIZATION_ADMIN');
export const canEditServicePoint = (role: UserRole | undefined) => hasRole(role, 'ORGANIZATION_ADMIN');
export const canDeleteServicePoint = (role: UserRole | undefined) => hasRole(role, 'ORGANIZATION_ADMIN');

// Statistics permissions
export const canViewStats = (role: UserRole | undefined) => hasRole(role, 'VOLUNTEER');

// User management (Admin only)
export const canManageUsers = (role: UserRole | undefined) => hasRole(role, 'ORGANIZATION_ADMIN');

// Legacy permission type for backward compatibility
export type Permission =
  | 'view_homeless'
  | 'edit_homeless'
  | 'delete_homeless'
  | 'create_homeless'
  | 'view_service_points'
  | 'create_service_point'
  | 'edit_service_point'
  | 'delete_service_point'
  | 'manage_users'
  | 'view_stats';

/**
 * Legacy hasPermission function for backward compatibility
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  
  switch (permission) {
    case 'view_homeless':
      return canViewHomeless(role);
    case 'create_homeless':
      return canCreateHomeless(role);
    case 'edit_homeless':
      return canEditHomeless(role);
    case 'delete_homeless':
      return canDeleteHomeless(role);
    case 'view_service_points':
      return canViewServicePoints(role);
    case 'create_service_point':
      return canCreateServicePoint(role);
    case 'edit_service_point':
      return canEditServicePoint(role);
    case 'delete_service_point':
      return canDeleteServicePoint(role);
    case 'manage_users':
      return canManageUsers(role);
    case 'view_stats':
      return canViewStats(role);
    default:
      return false;
  }
}

/**
 * Get role display name for UI
 */
export function getRoleDisplayName(role: UserRole | undefined): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'ORGANIZATION_ADMIN':
      return 'Admin de Organización';
    case 'COORDINATOR':
      return 'Coordinador';
    case 'SOCIAL_WORKER':
      return 'Trabajador Social';
    case 'VOLUNTEER':
      return 'Voluntario';
    default:
      return 'Usuario';
  }
}

/**
 * Get role badge info for UI
 */
export function getRoleBadge(role: UserRole | undefined): { icon: string; label: string; color: string } {
  switch (role) {
    case 'ADMIN':
      return { icon: '🔑', label: 'Admin', color: '#e74c3c' };
    case 'ORGANIZATION_ADMIN':
      return { icon: '🏢', label: 'Org Admin', color: '#9b59b6' };
    case 'COORDINATOR':
      return { icon: '📋', label: 'Coordinador', color: '#3498db' };
    case 'SOCIAL_WORKER':
      return { icon: '🤝', label: 'Trabajador Social', color: '#2ecc71' };
    case 'VOLUNTEER':
      return { icon: '👤', label: 'Voluntario', color: '#95a5a6' };
    default:
      return { icon: '👤', label: 'Usuario', color: '#7f8c8d' };
  }
}
