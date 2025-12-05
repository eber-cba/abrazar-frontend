/**
 * usePermissions Hook
 * Easy access to permission checks based on current user's role
 */

import { useCurrentUser } from './useAuth';
import {
  UserRole,
  hasRole,
  canEdit,
  canDelete,
  canManageTeams,
  canViewHomeless,
  canCreateHomeless,
  canEditHomeless,
  canDeleteHomeless,
  canViewServicePoints,
  canCreateServicePoint,
  canEditServicePoint,
  canDeleteServicePoint,
  canManageUsers,
  canViewStats,
  canAssignCases,
  getRoleDisplayName,
  getRoleBadge,
  hasPermission,
  Permission,
} from '../utils/permissions';

export function usePermissions() {
  const { data: user } = useCurrentUser();
  const role = user?.role as UserRole | undefined;

  return {
    // User info
    role,
    roleDisplayName: getRoleDisplayName(role),
    roleBadge: getRoleBadge(role),
    
    // Role checks
    hasRole: (requiredRole: UserRole) => hasRole(role, requiredRole),
    
    // Generic permissions
    canEdit: canEdit(role),
    canDelete: canDelete(role),
    canManageTeams: canManageTeams(role),
    
    // Homeless/Persons permissions
    canViewHomeless: canViewHomeless(role),
    canCreateHomeless: canCreateHomeless(role),
    canEditHomeless: canEditHomeless(role),
    canDeleteHomeless: canDeleteHomeless(role),
    
    // Service Points permissions
    canViewServicePoints: canViewServicePoints(role),
    canCreateServicePoint: canCreateServicePoint(role),
    canEditServicePoint: canEditServicePoint(role),
    canDeleteServicePoint: canDeleteServicePoint(role),
    
    // Cases permissions
    canAssignCases: canAssignCases(role),
    
    // Stats & Users
    canViewStats: canViewStats(role),
    canManageUsers: canManageUsers(role),
    
    // Legacy hasPermission for backward compatibility
    hasPermission: (permission: Permission) => hasPermission(role, permission),
  };
}
