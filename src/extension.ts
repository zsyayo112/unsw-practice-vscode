import * as vscode from 'vscode';
import { ProblemTreeProvider } from './providers/ProblemTreeProvider';
import { ProblemWebviewProvider } from './providers/ProblemWebviewProvider';
import { registerOpenProblem } from './commands/openProblem';
import { registerSubmitCode } from './commands/submitCode';
import { registerLogin } from './commands/login';

/**
 * Extension entry point.
 * Assembles providers and registers commands — no business logic lives here.
 * All disposables are pushed to context.subscriptions for automatic cleanup.
 */
export function activate(context: vscode.ExtensionContext): void {
  // ── Providers ─────────────────────────────────────────────────────────────
  const treeProvider = new ProblemTreeProvider();
  const webviewProvider = new ProblemWebviewProvider(context.extensionUri);

  // ── Tree view ──────────────────────────────────────────────────────────────
  const treeView = vscode.window.createTreeView('unsw-practice.problemList', {
    treeDataProvider: treeProvider,
    showCollapseAll: false,
  });

  // ── Commands ───────────────────────────────────────────────────────────────
  const refreshDisposable = vscode.commands.registerCommand(
    'unsw-practice.refresh',
    () => void treeProvider.refresh(),
  );

  // ── Register everything ────────────────────────────────────────────────────
  context.subscriptions.push(
    treeView,
    refreshDisposable,
    registerOpenProblem(context, webviewProvider),
    registerSubmitCode(),
    registerLogin(context),
  );
}

/**
 * Called when the extension is deactivated.
 * Subscriptions are disposed automatically by VSCode.
 */
export function deactivate(): void {
  // Nothing to clean up.
}
