import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
} from '@angular/core';
import { SerafortAuthService } from '../services/serafort-auth.service.js';

/**
 * Structural directive that displays an element only if the user has the required permission.
 *
 * Usage:
 * ```html
 * <button *serafortHasPermission="'org:delete'">Delete Organization</button>
 * ```
 */
@Directive({
  selector: '[serafortHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(SerafortAuthService);

  private requiredPermission: string = '';
  private isRendered = false;

  @Input()
  set serafortHasPermission(permission: string) {
    this.requiredPermission = permission;
    this.updateView();
  }

  constructor() {
    // React to signal updates automatically
    effect(() => {
      // Access signal to trigger reactivity
      this.authService.permissions();
      this.updateView();
    });
  }

  private updateView(): void {
    if (!this.requiredPermission) return;

    const hasAccess = this.authService.hasPermission(this.requiredPermission);

    if (hasAccess && !this.isRendered) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isRendered = true;
    } else if (!hasAccess && this.isRendered) {
      this.viewContainer.clear();
      this.isRendered = false;
    }
  }
}
