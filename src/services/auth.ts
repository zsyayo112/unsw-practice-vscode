/**
 * Auth service — no VSCode UI dependencies.
 * VSCode APIs (SecretStorage, Memento) are injected as parameters
 * so this module can be tested and reused independently.
 *
 * Phase 1: token storage is wired up but login is a no-op stub.
 * Phase 2: implement OAuth flow against Supabase Auth.
 */

import type * as vscode from 'vscode';
import type { User } from '../types/index';

const TOKEN_KEY = 'unsw-practice.auth-token';
const USER_KEY = 'unsw-practice.user';

/**
 * Persist an auth token in VSCode SecretStorage (encrypted on disk).
 */
export async function storeToken(
  secrets: vscode.SecretStorage,
  token: string,
): Promise<void> {
  await secrets.store(TOKEN_KEY, token);
}

/**
 * Retrieve the stored auth token.
 * Returns null if the user is not authenticated.
 */
export async function getToken(secrets: vscode.SecretStorage): Promise<string | null> {
  const token = await secrets.get(TOKEN_KEY);
  return token ?? null;
}

/**
 * Delete the stored auth token from SecretStorage.
 */
export async function clearToken(secrets: vscode.SecretStorage): Promise<void> {
  await secrets.delete(TOKEN_KEY);
}

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
