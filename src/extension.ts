import * as vscode from 'vscode';
import { ProblemTreeProvider } from './providers/ProblemTreeProvider';
import { ProblemWebviewProvider } from './providers/ProblemWebviewProvider';
import { registerOpenProblem } from './commands/openProblem';
import { registerSubmitCode } from './commands/submitCode';
import { registerLogin } from './commands/login';
import { createAuthService } from './services/auth';
import { fetchProblems, fetchUserProgress } from './services/api';

/**
 * Extension entry point.
 * Assembles providers and registers commands — no business logic lives here.
 * All disposables are pushed to context.subscriptions for automatic cleanup.
 */
export function activate(context: vscode.ExtensionContext): void {
  // ── Services ───────────────────────────────────────────────────────────────
  const authService = createAuthService(context.secrets);

  // ── Providers ─────────────────────────────────────────────────────────────
  const treeProvider = new ProblemTreeProvider();
  const webviewProvider = new ProblemWebviewProvider(context.extensionUri);

  // ── Tree view ──────────────────────────────────────────────────────────────
  const treeView = vscode.window.createTreeView('unsw-practice.problemList', {
    treeDataProvider: treeProvider,
    showCollapseAll: false,
  });

  let statusBar: vscode.StatusBarItem | undefined;

  // ── Data loading ───────────────────────────────────────────────────────────
  async function loadProblems(): Promise<void> {
    try {
      const token = await authService.getToken();
      const [problems, progress] = await Promise.all([
        fetchProblems(token),
        token ? fetchUserProgress(token) : Promise.resolve([]),
      ]);
      treeProvider.setProblems(problems, progress);
      const { solved, total } = treeProvider.getSolvedCount();
      if (statusBar) {
        statusBar.text = `$(book) UNSW: ${solved}/${total} solved`;
      }
    } catch (error) {
      treeProvider.setError();
      vscode.window.showErrorMessage(
        `UNSW Practice: Failed to load problems — ${String(error)}`,
      );
    }
  }

  void loadProblems();

  // ── Commands ───────────────────────────────────────────────────────────────
  const refreshDisposable = vscode.commands.registerCommand(
    'unsw-practice.refresh',
    () => void loadProblems(),
  );

  // ── Register everything ────────────────────────────────────────────────────
  context.subscriptions.push(
    treeView,
    refreshDisposable,
    registerOpenProblem(context, webviewProvider),
    registerSubmitCode(),
    registerLogin(context, authService, () => void loadProblems()),
  );

  // ── Status bar ─────────────────────────────────────────────────────────────
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = 'unsw-practice.refresh';
  statusBar.text = '$(book) UNSW: 0/0 solved';
  statusBar.tooltip = 'Click to refresh UNSW Practice problems';
  statusBar.show();
  context.subscriptions.push(statusBar);
}

/**
 * Called when the extension is deactivated.
 * Subscriptions are disposed automatically by VSCode.
 */
export function deactivate(): void {
  // Nothing to clean up.
}
