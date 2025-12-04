/**
 * Role-Based Access Control (RBAC)
 * Permission utilities for controlling access based on user roles
 */

export type UserRole = 'ADMIN' | 'MUNICIPALITY' | 'NGO' | 'VOLUNTEER';

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
 * Permission matrix defining what each role can do
 */
const PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'view_homeless',
    'edit_homeless',
    'delete_homeless',
    'create_homeless',
    'view_service_points',
    'create_service_point',
    'edit_service_point',
    'delete_service_point',
    'manage_users',
    'view_stats',
  ],
  MUNICIPALITY: [
    'view_homeless',
    'edit_homeless',
    'create_homeless',
    'view_service_points',
    'create_service_point',
    'edit_service_point',
    'delete_service_point',
    'view_stats',
  ],
  NGO: [
    'view_homeless',
    'edit_homeless',
    'create_homeless',
    'view_service_points',
    'create_service_point',
    'view_stats',
  ],
  VOLUNTEER: [
    'view_homeless',
    'view_service_points',
    'view_stats',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if user can view homeless persons list
 */
export function canViewHomeless(role: UserRole | undefined): boolean {
  return hasPermission(role, 'view_homeless');
}

/**
 * Check if user can edit homeless person data
 */
export function canEditHomeless(role: UserRole | undefined): boolean {
  return hasPermission(role, 'edit_homeless');
}

/**
 * Check if user can delete homeless person
 */
export function canDeleteHomeless(role: UserRole | undefined): boolean {
  return hasPermission(role, 'delete_homeless');
}

/**
 * Check if user can create homeless person
 */
export function canCreateHomeless(role: UserRole | undefined): boolean {
  return hasPermission(role, 'create_homeless');
}

/**
 * Check if user can view service points
 */
export function canViewServicePoints(role: UserRole | undefined): boolean {
  return hasPermission(role, 'view_service_points');
}

/**
 * Check if user can create service point
 */
export function canCreateServicePoint(role: UserRole | undefined): boolean {
  return hasPermission(role, 'create_service_point');
}

/**
 * Check if user can edit service point
 */
export function canEditServicePoint(role: UserRole | undefined): boolean {
  return hasPermission(role, 'edit_service_point');
}

/**
 * Check if user can delete service point
 */
export function canDeleteServicePoint(role: UserRole | undefined): boolean {
  return hasPermission(role, 'delete_service_point');
}

/**
 * Check if user can manage other users (admin only)
 */
export function canManageUsers(role: UserRole | undefined): boolean {
  return hasPermission(role, 'manage_users');
}

/**
 * Check if user can view statistics
 */
export function canViewStats(role: UserRole | undefined): boolean {
  return hasPermission(role, 'view_stats');
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole | undefined): Permission[] {
  if (!role) return [];
  return PERMISSIONS[role] || [];
}
