# @serafort/angular

Enterprise IAM & B2B Authentication adapter for Angular 17+ standalone applications.

## Features

- ⚡ **Angular 17+ Signals**: Fully reactive `isAuthenticated()`, `user()`, `roles()`, and `permissions()` signals.
- 🛡️ **Functional Route Guards**: `serafortAuthGuard`, `serafortPermissionGuard` (with wildcards), `serafortRoleGuard`, and `serafortTenantGuard`.
- 🔌 **Functional HTTP Interceptor**: `serafortHttpInterceptor` (`HttpInterceptorFn`) automatically injecting Bearer tokens into outgoing HTTP client requests.
- 🧩 **Structural Directive**: `*serafortHasPermission="'org:*'"` to conditionally render DOM elements based on reactive permissions.
- 📦 **Standalone Configuration**: `provideSerafortAuth()` provider for `appConfig`.

## Installation

```bash
npm install @serafort/angular @serafort/core
```

## Quick Start

### 1. Configure Providers

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideSerafortAuth, serafortHttpInterceptor } from '@serafort/angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([serafortHttpInterceptor])),
    provideSerafortAuth({
      endpoint: 'https://api.serafort.com',
      storageType: 'localStorage',
      loginUrl: '/login',
    }),
  ],
};
```

### 2. Protect Routes

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { serafortAuthGuard, serafortPermissionGuard } from '@serafort/angular';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    canActivate: [serafortAuthGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
    canActivate: [serafortPermissionGuard(['org:*'])],
  },
];
```

### 3. Consume in Components with Signals

```typescript
import { Component, inject } from '@angular/core';
import { SerafortAuthService, HasPermissionDirective } from '@serafort/angular';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [HasPermissionDirective],
  template: `
    @if (auth.isAuthenticated()) {
      <h2>Welcome, {{ auth.user()?.userId }}</h2>
      <p>Tenant: {{ auth.tenantId() }}</p>

      <button *serafortHasPermission="'billing:manage'">
        Manage Subscription
      </button>
    }
  `,
})
export class UserProfileComponent {
  readonly auth = inject(SerafortAuthService);
}
```

## Contributing

Before committing, changes are checked with `pnpm run type-check && pnpm run test`.
This is wired up two ways — pick whichever fits your setup:

- **Husky (npm-idiomatic, default for contributors who run `pnpm install`)**:
  the `prepare` script installs a Husky hook automatically, so once you've run
  `pnpm install` in a git checkout, `git commit` runs the checks for you.
- **`.githooks/` (portable, no Husky/Node required to install)**: run
  `git config core.hooksPath .githooks` once to point git directly at the
  checked-in `.githooks/pre-commit` script, which runs the same checks.

Both hooks run the same two commands, so pick one — you don't need both active
at once.

CI (`.github/workflows/ci.yml`) runs `type-check`, `test`, and `build` on
every push to `main` and on every pull request.

## License

MIT — see [LICENSE](LICENSE).
