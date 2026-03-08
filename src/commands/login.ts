import * as vscode from 'vscode';
import type { AuthService } from '../services/auth';
import { clearUser } from '../services/auth';

/**
 * Register the `unsw-practice.login` and `unsw-practice.logout` commands.
 *
 * Phase 1: login shows an informational stub — no auth backend yet.
 * Phase 2: replace the login handler with a Supabase OAuth browser flow.
 */
export function registerLogin(
  context: vscode.ExtensionContext,
  authService: AuthService,
  onReload: () => void,
): vscode.Disposable {
  const loginDisposable = vscode.commands.registerCommand(
    'unsw-practice.login',
    () => {
      vscode.window.showInformationMessage(
        'UNSW Practice: Account login will be available in a future release.',
      );
    },
  );

  const logoutDisposable = vscode.commands.registerCommand(
    'unsw-practice.logout',
    async () => {
      await authService.clearToken();
      await clearUser(context.globalState);
      vscode.window.showInformationMessage('UNSW Practice: Logged out successfully.');
      onReload();
    },
  );

  return vscode.Disposable.from(loginDisposable, logoutDisposable);
}
