import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../utils/permissions';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions
 * 
 * @example
 * <PermissionGate permission="edit_homeless">
 *   <EditButton />
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
