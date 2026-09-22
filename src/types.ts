import type { UserContext, SerafortClient } from '@serafort/core';

export type TokenStorageType = 'localStorage' | 'sessionStorage' | 'memory';

export interface SerafortAngularConfig {
  /** Serafort IAM backend endpoint */
  endpoint: string;
  /** Client ID for M2M or B2B client applications */
  clientId?: string;
  /** Storage key for the access token. Default: '__serafort_token' */
  tokenStorageKey?: string;
  /** Storage mechanism. Default: 'localStorage' */
  storageType?: TokenStorageType;
  /** Default redirect URL when unauthenticated. Default: '/login' */
  loginUrl?: string;
  /** Optional pre-configured SerafortClient instance */
  client?: SerafortClient;
  /** Automatically validate token on application startup. Default: true */
  autoInitialize?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserContext | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface GuardRedirectOptions {
  redirectTo?: string;
  preserveReturnUrl?: boolean;
}
