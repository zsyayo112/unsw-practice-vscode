/**
 * Auth service — no VSCode UI dependencies.
 * VSCode SecretStorage is injected once via createAuthService() so this
 * module can be tested and reused independently.
 *
 * Phase 1: token storage is wired up but login is a no-op stub.
 * Phase 2: implement OAuth flow against Supabase Auth.
 */

import type * as vscode from 'vscode';
import type { AuthState } from '../types/index';
import { SECRET_KEY } from '../types/index';

type User = NonNullable<AuthState['user']>;

const USER_KEY = 'unsw-practice.user';

// ── Auth service factory ──────────────────────────────────────────────────────

export interface AuthService {
  /** Retrieve the stored auth token. Returns undefined if not authenticated. */
  getToken(): Promise<string | undefined>;
  /** Persist an auth token in VSCode SecretStorage (encrypted on disk). */
  setToken(token: string): Promise<void>;
  /** Delete the stored auth token from SecretStorage. */
  clearToken(): Promise<void>;
  /** Returns true when a token is present. */
  isAuthenticated(): Promise<boolean>;
}

/**
 * Create an AuthService bound to the given SecretStorage instance.
 * Call once in extension.ts activate() and share the result.
 */
export function createAuthService(secrets: vscode.SecretStorage): AuthService {
  return {
    async getToken(): Promise<string | undefined> {
      return secrets.get(SECRET_KEY);
    },

    async setToken(token: string): Promise<void> {
      await secrets.store(SECRET_KEY, token);
    },

    async clearToken(): Promise<void> {
      await secrets.delete(SECRET_KEY);
    },

    async isAuthenticated(): Promise<boolean> {
      return (await secrets.get(SECRET_KEY)) !== undefined;
    },
  };
}

// ── User helpers (global state) ───────────────────────────────────────────────

/**
 * Persist basic user info in VSCode global state.
 * user_id is preserved here for Phase 2 cloud-sync migration.
 */
export async function storeUser(globalState: vscode.Memento, user: User): Promise<void> {
  await globalState.update(USER_KEY, user);
}

/**
 * Retrieve stored user from global state.
 * Returns null if the user is not logged in.
 */
export function getUser(globalState: vscode.Memento): User | null {
  return globalState.get<User>(USER_KEY) ?? null;
}

/**
 * Remove user info from global state (on logout).
 */
export async function clearUser(globalState: vscode.Memento): Promise<void> {
  await globalState.update(USER_KEY, undefined);
}
