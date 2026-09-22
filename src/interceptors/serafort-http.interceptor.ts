import { inject } from '@angular/core';
import type { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { SerafortAuthService } from '../services/serafort-auth.service.js';

/**
 * Functional HTTP Interceptor that automatically injects the active Serafort
 * Bearer token into outgoing requests.
 */
export const serafortHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(SerafortAuthService);
  const token = authService.token();

  // If already has an Authorization header or no token is available, pass through
  if (!token || req.headers.has('Authorization')) {
    return next(req);
  }

  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  return next(authReq);
};
