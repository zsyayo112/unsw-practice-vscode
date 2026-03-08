import * as vscode from 'vscode';
import type { ExtensionMessage, Problem, WebviewMessage } from '../types/index';
import { runCode, submitCode } from '../services/api';

/**
 * Manages the WebView panel used to display and solve problems.
 * One panel instance is reused across problems — calling openProblem()
 * when a panel already exists reveals it and loads the new problem.
 */
export class ProblemWebviewProvider {
  private panel: vscode.WebviewPanel | undefined;
  private currentProblem: Problem | undefined;

  constructor(private readonly extensionUri: vscode.Uri) {}

  /**
   * Open (or reveal) the problem panel and load the given problem.
   */
  openProblem(problem: Problem): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'unsw-practice.problem',
        problem.title,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(this.extensionUri, 'media'),
            vscode.Uri.joinPath(this.extensionUri, 'out'),
          ],
          retainContextWhenHidden: true,
        },
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
        this.currentProblem = undefined;
      });

      this.panel.webview.onDidReceiveMessage((message: WebviewMessage) => {
        void this.handleWebviewMessage(message);
      });
    }

    this.currentProblem = problem;
    this.panel.title = problem.title;
    this.panel.webview.html = this.buildHtml(this.panel.webview);
    void this.postMessage({ type: 'load-problem', problem });
  }

  /**
   * Handle typed messages arriving from the WebView.
   */
  private async handleWebviewMessage(message: WebviewMessage): Promise<void> {
    if (!this.currentProblem) {
      return;
    }

    if (message.type === 'run-code') {
      await this.postMessage({ type: 'loading', isLoading: true });
      try {
        const result = await runCode(message.code, message.input, message.expectedOutput);
        await this.postMessage({ type: 'run-result', result });
      } catch (error) {
        vscode.window.showErrorMessage(
          `UNSW Practice: Failed to run code — ${String(error)}`,
        );
      } finally {
        await this.postMessage({ type: 'loading', isLoading: false });
      }
    } else if (message.type === 'submit-code') {
      await this.postMessage({ type: 'loading', isLoading: true });
      try {
        const result = await submitCode(message.code, this.currentProblem.testCases);
        await this.postMessage({ type: 'submit-result', result });
      } catch (error) {
        vscode.window.showErrorMessage(
          `UNSW Practice: Failed to submit code — ${String(error)}`,
        );
      } finally {
        await this.postMessage({ type: 'loading', isLoading: false });
      }
    }
    // 'ready' message requires no action — problem is pushed after html is set
  }

  /**
   * Send a typed message to the WebView.
   */
  private async postMessage(message: ExtensionMessage): Promise<void> {
    if (this.panel) {
      await this.panel.webview.postMessage(message);
    }
  }

  /**
   * Build the WebView HTML with a per-request nonce and strict CSP.
   */
  private buildHtml(webview: vscode.Webview): string {
    const nonce = getNonce();

    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'main.css'),
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'out', 'webview', 'main.js'),
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta
    http-equiv="Content-Security-Policy"
    content="
      default-src 'none';
      style-src ${webview.cspSource} 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
      script-src 'nonce-${nonce}' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
      font-src ${webview.cspSource} https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
      connect-src ${webview.cspSource} https://emkc.org https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
    "
  />
  <link rel="stylesheet" href="${cssUri}" />
  <title>UNSW Practice</title>
</head>
<body>
  <div id="app">
    <div class="loading-screen"><p>Loading problem…</p></div>
  </div>
  <script nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/marked@4/marked.min.js"></script>
  <script
    nonce="${nonce}"
    src="https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs/loader.js"
  ></script>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

/** Generate a cryptographically random 32-char alphanumeric nonce for CSP. */
function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    '',
  );
}
