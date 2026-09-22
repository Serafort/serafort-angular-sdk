import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { SERAFORT_CONFIG } from './tokens.js';
import { SerafortAuthService } from './services/serafort-auth.service.js';
import type { SerafortAngularConfig } from './types.js';

/**
 * Configures and provides Serafort Authentication in standalone Angular applications.
 *
 * Usage in `app.config.ts`:
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideRouter(routes),
 *     provideHttpClient(withInterceptors([serafortHttpInterceptor])),
 *     provideSerafortAuth({ endpoint: 'https://api.serafort.com' }),
 *   ],
 * };
 * ```
 */
export function provideSerafortAuth(config: SerafortAngularConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SERAFORT_CONFIG, useValue: config },
    SerafortAuthService,
  ]);
}
