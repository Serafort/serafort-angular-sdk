import { InjectionToken } from '@angular/core';
import type { SerafortClient } from '@serafort/core';
import type { SerafortAngularConfig } from './types.js';

export const SERAFORT_CONFIG = new InjectionToken<SerafortAngularConfig>('SERAFORT_CONFIG');
export const SERAFORT_CLIENT = new InjectionToken<SerafortClient>('SERAFORT_CLIENT');
