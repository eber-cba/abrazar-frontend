import { hasPermission, hasRole, UserRole, canEditHomeless, canDeleteHomeless, canManageUsers, canViewHomeless, getRoleDisplayName, getRoleBadge } from '../../utils/permissions';

describe('Permissions Utility', () => {
  describe('Role Hierarchy', () => {
    it('ADMIN should have highest permissions', () => {
      expect(hasRole('ADMIN', 'ADMIN')).toBe(true);
      expect(hasRole('ADMIN', 'ORGANIZATION_ADMIN')).toBe(true);
      expect(hasRole('ADMIN', 'COORDINATOR')).toBe(true);
      expect(hasRole('ADMIN', 'SOCIAL_WORKER')).toBe(true);
      expect(hasRole('ADMIN', 'VOLUNTEER')).toBe(true);
    });

    it('ORGANIZATION_ADMIN should have mid-high permissions', () => {
      expect(hasRole('ORGANIZATION_ADMIN', 'ADMIN')).toBe(false);
      expect(hasRole('ORGANIZATION_ADMIN', 'ORGANIZATION_ADMIN')).toBe(true);
      expect(hasRole('ORGANIZATION_ADMIN', 'COORDINATOR')).toBe(true);
      expect(hasRole('ORGANIZATION_ADMIN', 'SOCIAL_WORKER')).toBe(true);
      expect(hasRole('ORGANIZATION_ADMIN', 'VOLUNTEER')).toBe(true);
    });

    it('COORDINATOR should have mid permissions', () => {
      expect(hasRole('COORDINATOR', 'ADMIN')).toBe(false);
      expect(hasRole('COORDINATOR', 'ORGANIZATION_ADMIN')).toBe(false);
      expect(hasRole('COORDINATOR', 'COORDINATOR')).toBe(true);
      expect(hasRole('COORDINATOR', 'SOCIAL_WORKER')).toBe(true);
      expect(hasRole('COORDINATOR', 'VOLUNTEER')).toBe(true);
    });

    it('SOCIAL_WORKER should have limited permissions', () => {
      expect(hasRole('SOCIAL_WORKER', 'ADMIN')).toBe(false);
      expect(hasRole('SOCIAL_WORKER', 'ORGANIZATION_ADMIN')).toBe(false);
      expect(hasRole('SOCIAL_WORKER', 'COORDINATOR')).toBe(false);
      expect(hasRole('SOCIAL_WORKER', 'SOCIAL_WORKER')).toBe(true);
      expect(hasRole('SOCIAL_WORKER', 'VOLUNTEER')).toBe(true);
    });

    it('VOLUNTEER should have lowest permissions', () => {
      expect(hasRole('VOLUNTEER', 'ADMIN')).toBe(false);
      expect(hasRole('VOLUNTEER', 'ORGANIZATION_ADMIN')).toBe(false);
      expect(hasRole('VOLUNTEER', 'COORDINATOR')).toBe(false);
      expect(hasRole('VOLUNTEER', 'SOCIAL_WORKER')).toBe(false);
      expect(hasRole('VOLUNTEER', 'VOLUNTEER')).toBe(true);
    });
  });

  describe('Specific Permission Functions', () => {
    it('canViewHomeless - all roles can view', () => {
      expect(canViewHomeless('ADMIN')).toBe(true);
      expect(canViewHomeless('ORGANIZATION_ADMIN')).toBe(true);
      expect(canViewHomeless('COORDINATOR')).toBe(true);
      expect(canViewHomeless('SOCIAL_WORKER')).toBe(true);
      expect(canViewHomeless('VOLUNTEER')).toBe(true);
    });

    it('canEditHomeless - SOCIAL_WORKER and above', () => {
      expect(canEditHomeless('ADMIN')).toBe(true);
      expect(canEditHomeless('ORGANIZATION_ADMIN')).toBe(true);
      expect(canEditHomeless('COORDINATOR')).toBe(true);
      expect(canEditHomeless('SOCIAL_WORKER')).toBe(true);
      expect(canEditHomeless('VOLUNTEER')).toBe(false);
    });

    it('canDeleteHomeless - ORGANIZATION_ADMIN and above', () => {
      expect(canDeleteHomeless('ADMIN')).toBe(true);
      expect(canDeleteHomeless('ORGANIZATION_ADMIN')).toBe(true);
      expect(canDeleteHomeless('COORDINATOR')).toBe(false);
      expect(canDeleteHomeless('SOCIAL_WORKER')).toBe(false);
      expect(canDeleteHomeless('VOLUNTEER')).toBe(false);
    });

    it('canManageUsers - ORGANIZATION_ADMIN and above', () => {
      expect(canManageUsers('ADMIN')).toBe(true);
      expect(canManageUsers('ORGANIZATION_ADMIN')).toBe(true);
      expect(canManageUsers('COORDINATOR')).toBe(false);
      expect(canManageUsers('SOCIAL_WORKER')).toBe(false);
      expect(canManageUsers('VOLUNTEER')).toBe(false);
    });
  });

  describe('Legacy hasPermission function', () => {
    it('should work with permission strings', () => {
      expect(hasPermission('ADMIN', 'view_homeless')).toBe(true);
      expect(hasPermission('ADMIN', 'edit_homeless')).toBe(true);
      expect(hasPermission('ADMIN', 'delete_homeless')).toBe(true);
      expect(hasPermission('ADMIN', 'manage_users')).toBe(true);
      
      expect(hasPermission('VOLUNTEER', 'view_homeless')).toBe(true);
      expect(hasPermission('VOLUNTEER', 'edit_homeless')).toBe(false);
      expect(hasPermission('VOLUNTEER', 'delete_homeless')).toBe(false);
    });
  });

  describe('undefined role', () => {
    it('should have no permissions', () => {
      expect(hasRole(undefined, 'VOLUNTEER')).toBe(false);
      expect(canViewHomeless(undefined)).toBe(false);
      expect(canEditHomeless(undefined)).toBe(false);
      expect(hasPermission(undefined, 'view_homeless')).toBe(false);
    });
  });

  describe('Role Display Names', () => {
    it('should return correct display names', () => {
      expect(getRoleDisplayName('ADMIN')).toBe('Administrador');
      expect(getRoleDisplayName('ORGANIZATION_ADMIN')).toBe('Admin de Organización');
      expect(getRoleDisplayName('COORDINATOR')).toBe('Coordinador');
      expect(getRoleDisplayName('SOCIAL_WORKER')).toBe('Trabajador Social');
      expect(getRoleDisplayName('VOLUNTEER')).toBe('Voluntario');
      expect(getRoleDisplayName(undefined)).toBe('Usuario');
    });
  });

  describe('Role Badges', () => {
    it('should return badge info', () => {
      const adminBadge = getRoleBadge('ADMIN');
      expect(adminBadge.icon).toBe('🔑');
      expect(adminBadge.label).toBe('Admin');
      expect(adminBadge.color).toBe('#e74c3c');
    });
  });
});
