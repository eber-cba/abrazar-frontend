import {
  hasPermission,
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
  getRolePermissions,
  UserRole,
} from '../permissions';

describe('Permissions Utility', () => {
  describe('ADMIN role', () => {
    const role: UserRole = 'ADMIN';

    it('should have all permissions', () => {
      expect(canViewHomeless(role)).toBe(true);
      expect(canEditHomeless(role)).toBe(true);
      expect(canDeleteHomeless(role)).toBe(true);
      expect(canCreateHomeless(role)).toBe(true);
      expect(canViewServicePoints(role)).toBe(true);
      expect(canCreateServicePoint(role)).toBe(true);
      expect(canEditServicePoint(role)).toBe(true);
      expect(canDeleteServicePoint(role)).toBe(true);
      expect(canManageUsers(role)).toBe(true);
      expect(canViewStats(role)).toBe(true);
    });

    it('should return all permissions', () => {
      const permissions = getRolePermissions(role);
      expect(permissions).toHaveLength(10);
      expect(permissions).toContain('manage_users');
    });
  });

  describe('MUNICIPALITY role', () => {
    const role: UserRole = 'MUNICIPALITY';

    it('should have service point management permissions', () => {
      expect(canViewServicePoints(role)).toBe(true);
      expect(canCreateServicePoint(role)).toBe(true);
      expect(canEditServicePoint(role)).toBe(true);
      expect(canDeleteServicePoint(role)).toBe(true);
    });

    it('should have homeless view and edit permissions', () => {
      expect(canViewHomeless(role)).toBe(true);
      expect(canEditHomeless(role)).toBe(true);
      expect(canCreateHomeless(role)).toBe(true);
    });

    it('should NOT have delete homeless permission', () => {
      expect(canDeleteHomeless(role)).toBe(false);
    });

    it('should NOT have user management permission', () => {
      expect(canManageUsers(role)).toBe(false);
    });
  });

  describe('NGO role', () => {
    const role: UserRole = 'NGO';

    it('should have homeless management permissions', () => {
      expect(canViewHomeless(role)).toBe(true);
      expect(canEditHomeless(role)).toBe(true);
      expect(canCreateHomeless(role)).toBe(true);
    });

    it('should have service point view and create permissions', () => {
      expect(canViewServicePoints(role)).toBe(true);
      expect(canCreateServicePoint(role)).toBe(true);
    });

    it('should NOT have delete permissions', () => {
      expect(canDeleteHomeless(role)).toBe(false);
      expect(canEditServicePoint(role)).toBe(false);
      expect(canDeleteServicePoint(role)).toBe(false);
    });

    it('should NOT have user management permission', () => {
      expect(canManageUsers(role)).toBe(false);
    });
  });

  describe('VOLUNTEER role', () => {
    const role: UserRole = 'VOLUNTEER';

    it('should have read-only permissions', () => {
      expect(canViewHomeless(role)).toBe(true);
      expect(canViewServicePoints(role)).toBe(true);
      expect(canViewStats(role)).toBe(true);
    });

    it('should NOT have any edit or delete permissions', () => {
      expect(canEditHomeless(role)).toBe(false);
      expect(canDeleteHomeless(role)).toBe(false);
      expect(canCreateHomeless(role)).toBe(false);
      expect(canCreateServicePoint(role)).toBe(false);
      expect(canEditServicePoint(role)).toBe(false);
      expect(canDeleteServicePoint(role)).toBe(false);
      expect(canManageUsers(role)).toBe(false);
    });
  });

  describe('undefined role', () => {
    it('should have no permissions', () => {
      expect(canViewHomeless(undefined)).toBe(false);
      expect(canEditHomeless(undefined)).toBe(false);
      expect(canManageUsers(undefined)).toBe(false);
    });

    it('should return empty permissions array', () => {
      const permissions = getRolePermissions(undefined);
      expect(permissions).toEqual([]);
    });
  });

  describe('hasPermission generic function', () => {
    it('should correctly check specific permissions', () => {
      expect(hasPermission('ADMIN', 'manage_users')).toBe(true);
      expect(hasPermission('VOLUNTEER', 'manage_users')).toBe(false);
      expect(hasPermission('NGO', 'edit_homeless')).toBe(true);
      expect(hasPermission('VOLUNTEER', 'edit_homeless')).toBe(false);
    });
  });
});
