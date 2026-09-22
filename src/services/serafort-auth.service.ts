import { Injectable, Inject, Optional, signal, computed } from '@angular/core';
import { SerafortClient, type UserContext } from '@serafort/core';
import { SERAFORT_CONFIG, SERAFORT_CLIENT } from '../tokens.js';
import type { SerafortAngularConfig, AuthState, TokenStorageType } from '../types.js';

@Injectable({
  providedIn: 'root',
})
export class SerafortAuthService {
  private readonly config: SerafortAngularConfig;
  readonly client: SerafortClient;

  private memoryToken: string | null = null;

  // Signal State
  private readonly _state = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // Public readonly computed signals
  readonly state = this._state.asReadonly();
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly user = computed(() => this._state().user);
  readonly token = computed(() => this._state().token);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);
  readonly tenantId = computed(() => this._state().user?.tenantId ?? null);
  readonly roles = computed(() => this._state().user?.roles ?? []);
  readonly permissions = computed(() => this._state().user?.permissions ?? []);

  constructor(
    @Inject(SERAFORT_CONFIG) config: SerafortAngularConfig,
    @Optional() @Inject(SERAFORT_CLIENT) client?: SerafortClient
  ) {
    this.config = {
      tokenStorageKey: '__serafort_token',
      storageType: 'localStorage',
      loginUrl: '/login',
      autoInitialize: true,
      ...config,
    };

    this.client =
      client ||
      this.config.client ||
      new SerafortClient({
        endpoint: this.config.endpoint,
      });

    if (this.config.autoInitialize) {
      void this.initialize();
    }
  }

  /**
   * Initializes the auth state from persistent storage and validates the token.
   */
  async initialize(): Promise<void> {
    this._state.update((s) => ({ ...s, isLoading: true, error: null }));
    const token = this.readStoredToken();

    if (!token) {
      this._state.set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      const user = await this.client.b2b.validateToken(token);
      this._state.set({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      this.clearStoredToken();
      this._state.set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: err?.message || 'Failed to authenticate stored token',
      });
    }
  }

  /**
   * Sets and persists a new access token, then validates the user context.
   */
  async setToken(token: string): Promise<UserContext> {
    this._state.update((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const user = await this.client.b2b.validateToken(token);
      this.writeStoredToken(token);
      this._state.set({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (err: any) {
      this._state.update((s) => ({
        ...s,
        isLoading: false,
        error: err?.message || 'Invalid token',
      }));
      throw err;
    }
  }

  /**
   * Clears the active authentication session and token from storage.
   */
  logout(): void {
    this.clearStoredToken();
    this._state.set({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }

  /**
   * Checks if the currently authenticated user possesses a given role.
   */
  hasRole(role: string): boolean {
    const roles = this.roles();
    return roles.includes(role);
  }

  /**
   * Checks if the currently authenticated user has the requested permission (supports wildcards e.g. 'org:*').
   */
  hasPermission(permission: string): boolean {
    const user = this.user();
    if (!user) return false;
    return this.client.b2b.hasPermission(user, permission);
  }

  /**
   * Checks if the current user belongs to the specified tenant ID.
   */
  hasTenant(tenantId: string): boolean {
    const user = this.user();
    return user?.tenantId === tenantId;
  }

  getLoginUrl(): string {
    return this.config.loginUrl || '/login';
  }

  // --- Storage Internals ---

  private readStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    const key = this.config.tokenStorageKey!;
    const type = this.config.storageType!;

    if (type === 'localStorage') {
      return window.localStorage.getItem(key);
    } else if (type === 'sessionStorage') {
      return window.sessionStorage.getItem(key);
    } else {
      return this.memoryToken;
    }
  }

  private writeStoredToken(token: string): void {
    const key = this.config.tokenStorageKey!;
    const type = this.config.storageType!;

    if (typeof window !== 'undefined') {
      if (type === 'localStorage') {
        window.localStorage.setItem(key, token);
      } else if (type === 'sessionStorage') {
        window.sessionStorage.setItem(key, token);
      }
    }
    this.memoryToken = token;
  }

  private clearStoredToken(): void {
    const key = this.config.tokenStorageKey!;
    const type = this.config.storageType!;

    if (typeof window !== 'undefined') {
      if (type === 'localStorage') {
        window.localStorage.removeItem(key);
      } else if (type === 'sessionStorage') {
        window.sessionStorage.removeItem(key);
      }
    }
    this.memoryToken = null;
  }
}
