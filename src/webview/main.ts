/**
 * WebView frontend — runs in a sandboxed browser context inside VSCode.
 * Communicates with the extension host via postMessage / onDidReceiveMessage.
 * Monaco Editor is loaded from CDN via the AMD require() injected by loader.js.
 */

import type { ExtensionMessage, Problem, TestCase, WebviewMessage } from '../types/index';

// ── Global declarations (injected by VSCode / Monaco CDN) ────────────────────

declare global {
  /** Injected by VSCode into every WebView. */
  function acquireVsCodeApi(): VsCodeApi;
}

interface VsCodeApi {
  postMessage(message: WebviewMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
}

interface MonacoEditor {
  getValue(): string;
  setValue(value: string): void;
}

interface MonacoInstance {
  editor: {
    create(el: HTMLElement, options: Record<string, unknown>): MonacoEditor;
  };
}

interface MonacoLoader {
  config(opts: { paths: Record<string, string> }): void;
  (modules: string[], callback: (monaco: MonacoInstance) => void): void;
}

// ── State ────────────────────────────────────────────────────────────────────

/**
 * Monaco's AMD loader is injected into globalThis by loader.js from CDN.
 * We cast through Record<string,unknown> to avoid using `any`.
 */
const monacoRequire = (globalThis as Record<string, unknown>)['require'] as MonacoLoader;

const vscode = acquireVsCodeApi();
let currentProblem: Problem | null = null;
let editor: MonacoEditor | null = null;

// ── Messaging ─────────────────────────────────────────────────────────────────

/** Send a typed message to the extension host. */
function postMessage(message: WebviewMessage): void {
  vscode.postMessage(message);
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

/** Escape a string for safe HTML insertion. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Minimal markdown → HTML conversion.
 * Handles fenced code blocks, inline code, and bold text.
 */
function markdownToHtml(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (m) => {
      const code = m.slice(3, -3).replace(/^\w+\n/, '');
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, (_, c: string) => `<code>${escapeHtml(c)}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

// ── Rendering ─────────────────────────────────────────────────────────────────

/** Render the problem description panel. */
function renderDescription(problem: Problem): void {
  const el = document.getElementById('description');
  if (!el) return;

  const sampleCases = problem.test_cases.slice(0, 2);
  el.innerHTML = `
    <h2>${escapeHtml(problem.title)}</h2>
    <span class="badge badge-${problem.difficulty.toLowerCase()}">${escapeHtml(problem.difficulty)}</span>
    <div class="description-body">${markdownToHtml(problem.description)}</div>
    <div class="test-cases">
      <h3>Sample Test Cases</h3>
      ${sampleCases
        .map(
          (tc, i) => `
        <div class="test-case">
          <strong>Case ${String(i + 1)}</strong>
          <pre>${escapeHtml(tc.input)}</pre>
          <strong>Expected output:</strong>
          <pre>${escapeHtml(tc.expected_output)}</pre>
        </div>
      `,
        )
        .join('')}
    </div>
  `;
}

/** Initialise Monaco Editor with the problem's starter code. */
function initMonaco(starterCode: string): void {
  monacoRequire.config({
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' },
  });

  monacoRequire(['vs/editor/editor.main'], (monaco) => {
    const editorEl = document.getElementById('editor');
    if (!editorEl) return;

    editor = monaco.editor.create(editorEl, {
      value: starterCode,
      language: 'python',
      theme: 'vs-dark',
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
    });
  });
}

/** Return the current editor contents, or empty string if not ready. */
function getCode(): string {
  return editor?.getValue() ?? '';
}

/** Render the result panel after a run or submit. */
function renderRunResult(passed: boolean, stdout: string, stderr: string): void {
  const el = document.getElementById('result');
  if (!el) return;
  const output = escapeHtml(stdout || stderr || '(no output)');
  el.innerHTML = `
    <div class="result ${passed ? 'pass' : 'fail'}">
      <strong>${passed ? '✓ Passed' : '✗ Failed'}</strong>
      <pre>${output}</pre>
    </div>
  `;
}

/** Render the aggregate submit result. */
function renderSubmitResult(passedCount: number, total: number): void {
  const el = document.getElementById('result');
  if (!el) return;
  const allPassed = passedCount === total;
  el.innerHTML = `
    <div class="result ${allPassed ? 'pass' : 'fail'}">
      <strong>${allPassed ? '✓ All Passed' : '✗ Some Failed'}</strong>
      <p>${String(passedCount)} / ${String(total)} test cases passed</p>
    </div>
  `;
}

/** Toggle loading state on the action buttons. */
function setLoading(isLoading: boolean): void {
  const runBtn = document.getElementById('btn-run') as HTMLButtonElement | null;
  const submitBtn = document.getElementById('btn-submit') as HTMLButtonElement | null;
  if (runBtn) runBtn.disabled = isLoading;
  if (submitBtn) submitBtn.disabled = isLoading;
}

// ── Extension message handler ─────────────────────────────────────────────────

window.addEventListener('message', (event: MessageEvent<ExtensionMessage>) => {
  const message = event.data;

  if (message.type === 'load-problem') {
    currentProblem = message.problem;
    renderDescription(message.problem);
    initMonaco(message.problem.starter_code);
  } else if (message.type === 'run-result') {
    renderRunResult(message.result.passed, message.result.stdout, message.result.stderr);
  } else if (message.type === 'submit-result') {
    renderSubmitResult(message.result.passed, message.result.total);
  } else if (message.type === 'loading') {
    setLoading(message.isLoading);
  }
});

// ── Layout & event wiring ─────────────────────────────────────────────────────

/** Inject the two-pane layout skeleton into #app. */
function buildLayout(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="split-pane">
      <div class="pane-left">
        <div id="description">
          <p class="placeholder">Loading problem…</p>
        </div>
      </div>
      <div class="pane-right">
        <div id="editor" class="editor-container"></div>
        <div class="toolbar">
          <button id="btn-run" class="btn btn-secondary">▶ Run Sample</button>
          <button id="btn-submit" class="btn btn-primary">Submit All</button>
        </div>
        <div id="result"></div>
      </div>
    </div>
  `;
}

/** Attach click handlers to Run / Submit buttons. */
function setupButtons(): void {
  document.getElementById('btn-run')?.addEventListener('click', () => {
    if (!currentProblem) return;
    const testCase: TestCase = currentProblem.test_cases[0];
    postMessage({ type: 'run-code', code: getCode(), testCase });
  });

  document.getElementById('btn-submit')?.addEventListener('click', () => {
    if (!currentProblem) return;
    postMessage({ type: 'submit-code', code: getCode() });
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

buildLayout();
setupButtons();
postMessage({ type: 'ready' });
