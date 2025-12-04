/**
 * usePermissions Hook
 * React hook for accessing permission checks based on current user role
 */

import { useCurrentUser } from './useAuth';
import {
  UserRole,
  canViewHomeless,
  canEditHomeless,
  canDeleteHomeless,
  canCreateHomeless,
  canViewServicePoints,
  canCreateServicePoint,
  canEditServicePoint,
  canDeleteServicePoint,
  canManageUsers,
  canViewStats,
  hasPermission,
  Permission,
} from '../utils/permissions';

export function usePermissions() {
  const { data: user } = useCurrentUser();
  const role = user?.role as UserRole | undefined;

  return {
    role,
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    canViewHomeless: canViewHomeless(role),
    canEditHomeless: canEditHomeless(role),
    canDeleteHomeless: canDeleteHomeless(role),
    canCreateHomeless: canCreateHomeless(role),
    canViewServicePoints: canViewServicePoints(role),
    canCreateServicePoint: canCreateServicePoint(role),
    canEditServicePoint: canEditServicePoint(role),
    canDeleteServicePoint: canDeleteServicePoint(role),
    canManageUsers: canManageUsers(role),
    canViewStats: canViewStats(role),
  };
}
