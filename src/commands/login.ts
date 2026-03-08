import * as vscode from 'vscode';
import { clearToken, clearUser } from '../services/auth';

/**
 * Register the `unsw-practice.login` and `unsw-practice.logout` commands.
 *
 * Phase 1: login shows an informational stub — no auth backend yet.
 * Phase 2: replace the login handler with a Supabase OAuth browser flow.
 */
export function registerLogin(context: vscode.ExtensionContext): vscode.Disposable {
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
      await clearToken(context.secrets);
      await clearUser(context.globalState);
      vscode.window.showInformationMessage('UNSW Practice: Logged out successfully.');
    },
  );

  return vscode.Disposable.from(loginDisposable, logoutDisposable);
}
