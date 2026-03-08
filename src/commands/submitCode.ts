import * as vscode from 'vscode';

/**
 * Register the `unsw-practice.submitCode` command.
 * Submission is driven from within the WebView UI.
 * This command exists so users can trigger it via the command palette
 * or a future keybinding.
 */
export function registerSubmitCode(): vscode.Disposable {
  return vscode.commands.registerCommand('unsw-practice.submitCode', () => {
    vscode.window.showInformationMessage(
      'UNSW Practice: Open a problem and use the Submit button in the panel.',
    );
  });
}
