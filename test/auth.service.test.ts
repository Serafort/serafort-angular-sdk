import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SerafortAuthService } from '../src/services/serafort-auth.service.js';
import { SerafortClient, type UserContext } from '@serafort/core';
import { serafortPermissionGuard, serafortRoleGuard, serafortTenantGuard } from '../src/guards/auth.guard.js';

describe('@serafort/angular AuthService & Signals', () => {
  const mockUser: UserContext = {
    userId: 'usr_ng_123',
    tenantId: 'tenant_acme',
    roles: ['admin', 'developer'],
    permissions: ['org:*', 'billing:read'],
  };

  let mockClient: SerafortClient;

  beforeEach(() => {
    mockClient = new SerafortClient({ endpoint: 'https://api.test.serafort.com' });
    vi.spyOn(mockClient.b2b, 'validateToken').mockImplementation(async (token: string) => {
      if (token === 'valid_jwt_token') {
        return mockUser;
      }
      throw new Error('Invalid token');
    });
  });

  it('initializes with default unauthenticated state', () => {
    const service = new SerafortAuthService(
      { endpoint: 'https://api.test.serafort.com', storageType: 'memory', autoInitialize: false },
      mockClient
    );

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.roles()).toEqual([]);
    expect(service.permissions()).toEqual([]);
  });

  it('updates signals reactively on setToken', async () => {
    const service = new SerafortAuthService(
      { endpoint: 'https://api.test.serafort.com', storageType: 'memory', autoInitialize: false },
      mockClient
    );

    const user = await service.setToken('valid_jwt_token');

    expect(user.userId).toBe('usr_ng_123');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.userId).toBe('usr_ng_123');
    expect(service.token()).toBe('valid_jwt_token');
    expect(service.tenantId()).toBe('tenant_acme');
    expect(service.roles()).toContain('admin');
    expect(service.permissions()).toContain('org:*');
  });

  it('supports wildcard permission checking through hasPermission', async () => {
    const service = new SerafortAuthService(
      { endpoint: 'https://api.test.serafort.com', storageType: 'memory', autoInitialize: false },
      mockClient
    );

    await service.setToken('valid_jwt_token');

    expect(service.hasPermission('org:users:create')).toBe(true);
    expect(service.hasPermission('billing:read')).toBe(true);
    expect(service.hasPermission('billing:write')).toBe(false);
    expect(service.hasPermission('system:admin')).toBe(false);
  });

  it('checks roles and tenant correctly', async () => {
    const service = new SerafortAuthService(
      { endpoint: 'https://api.test.serafort.com', storageType: 'memory', autoInitialize: false },
      mockClient
    );

    await service.setToken('valid_jwt_token');

    expect(service.hasRole('admin')).toBe(true);
    expect(service.hasRole('developer')).toBe(true);
    expect(service.hasRole('superadmin')).toBe(false);

    expect(service.hasTenant('tenant_acme')).toBe(true);
    expect(service.hasTenant('tenant_other')).toBe(false);
  });

  it('resets signals on logout', async () => {
    const service = new SerafortAuthService(
      { endpoint: 'https://api.test.serafort.com', storageType: 'memory', autoInitialize: false },
      mockClient
    );

    await service.setToken('valid_jwt_token');
    expect(service.isAuthenticated()).toBe(true);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.tenantId()).toBeNull();
  });
});
