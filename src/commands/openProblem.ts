import * as vscode from 'vscode';
import type { ProblemWebviewProvider } from '../providers/ProblemWebviewProvider';
import { fetchProblem } from '../services/api';

/**
 * Register the `unsw-practice.openProblem` command.
 * Accepts a problem ID as its first argument (passed by ProblemItem.command).
 * Fetches the full problem data and hands it to the WebView provider.
 */
export function registerOpenProblem(
  _context: vscode.ExtensionContext,
  webviewProvider: ProblemWebviewProvider,
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'unsw-practice.openProblem',
    async (slug: string) => {
      try {
        const problem = await fetchProblem(slug);
        webviewProvider.openProblem(problem);
      } catch (error) {
        vscode.window.showErrorMessage(
          `UNSW Practice: Failed to open problem — ${String(error)}`,
        );
      }
    },
  );
}
