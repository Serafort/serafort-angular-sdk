import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { SerafortAuthService } from '../services/serafort-auth.service.js';
import type { GuardRedirectOptions } from '../types.js';

/**
 * Functional Route Guard that prevents activation unless the user is authenticated.
 */
export const serafortAuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(SerafortAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  const loginUrl = authService.getLoginUrl();
  return router.createUrlTree([loginUrl], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Factory creating a CanActivateFn that validates required RBAC permissions with wildcard support.
 */
export function serafortPermissionGuard(
  requiredPermissions: string | string[],
  options: GuardRedirectOptions = {}
): CanActivateFn {
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(SerafortAuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      const loginUrl = options.redirectTo || authService.getLoginUrl();
      return router.createUrlTree([loginUrl], {
        queryParams: options.preserveReturnUrl !== false ? { returnUrl: state.url } : {},
      });
    }

    const hasAllPermissions = permissions.every((p) => authService.hasPermission(p));
    if (hasAllPermissions) {
      return true;
    }

    if (options.redirectTo) {
      return router.createUrlTree([options.redirectTo]);
    }

    return false;
  };
}

/**
 * Factory creating a CanActivateFn that validates required roles.
 */
export function serafortRoleGuard(
  requiredRoles: string | string[],
  options: GuardRedirectOptions = {}
): CanActivateFn {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(SerafortAuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      const loginUrl = options.redirectTo || authService.getLoginUrl();
      return router.createUrlTree([loginUrl], {
        queryParams: options.preserveReturnUrl !== false ? { returnUrl: state.url } : {},
      });
    }

    const hasAnyRole = roles.some((r) => authService.hasRole(r));
    if (hasAnyRole) {
      return true;
    }

    if (options.redirectTo) {
      return router.createUrlTree([options.redirectTo]);
    }

    return false;
  };
}

/**
 * Factory creating a CanActivateFn that validates tenant isolation.
 */
export function serafortTenantGuard(
  tenantId: string,
  options: GuardRedirectOptions = {}
): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(SerafortAuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      const loginUrl = options.redirectTo || authService.getLoginUrl();
      return router.createUrlTree([loginUrl], {
        queryParams: options.preserveReturnUrl !== false ? { returnUrl: state.url } : {},
      });
    }

    if (authService.hasTenant(tenantId)) {
      return true;
    }

    if (options.redirectTo) {
      return router.createUrlTree([options.redirectTo]);
    }

    return false;
  };
}
