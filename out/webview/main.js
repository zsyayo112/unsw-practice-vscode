"use strict";
(() => {
  // src/webview/main.ts
  var monacoRequire = globalThis["require"];
  var vscode = acquireVsCodeApi();
  var currentProblem = null;
  var editor = null;
  function postMessage(message) {
    vscode.postMessage(message);
  }
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function markdownToHtml(md) {
    return md.replace(/```[\s\S]*?```/g, (m) => {
      const code = m.slice(3, -3).replace(/^\w+\n/, "");
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    }).replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />");
  }
  function renderDescription(problem) {
    const el = document.getElementById("description");
    if (!el) return;
    const sampleCases = problem.test_cases.slice(0, 2);
    el.innerHTML = `
    <h2>${escapeHtml(problem.title)}</h2>
    <span class="badge badge-${problem.difficulty.toLowerCase()}">${escapeHtml(problem.difficulty)}</span>
    <div class="description-body">${markdownToHtml(problem.description)}</div>
    <div class="test-cases">
      <h3>Sample Test Cases</h3>
      ${sampleCases.map(
      (tc, i) => `
        <div class="test-case">
          <strong>Case ${String(i + 1)}</strong>
          <pre>${escapeHtml(tc.input)}</pre>
          <strong>Expected output:</strong>
          <pre>${escapeHtml(tc.expected_output)}</pre>
        </div>
      `
    ).join("")}
    </div>
  `;
  }
  function initMonaco(starterCode) {
    monacoRequire.config({
      paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs" }
    });
    monacoRequire(["vs/editor/editor.main"], (monaco) => {
      const editorEl = document.getElementById("editor");
      if (!editorEl) return;
      editor = monaco.editor.create(editorEl, {
        value: starterCode,
        language: "python",
        theme: "vs-dark",
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false
      });
    });
  }
  function getCode() {
    return editor?.getValue() ?? "";
  }
  function renderRunResult(passed, stdout, stderr) {
    const el = document.getElementById("result");
    if (!el) return;
    const output = escapeHtml(stdout || stderr || "(no output)");
    el.innerHTML = `
    <div class="result ${passed ? "pass" : "fail"}">
      <strong>${passed ? "\u2713 Passed" : "\u2717 Failed"}</strong>
      <pre>${output}</pre>
    </div>
  `;
  }
  function renderSubmitResult(passedCount, total) {
    const el = document.getElementById("result");
    if (!el) return;
    const allPassed = passedCount === total;
    el.innerHTML = `
    <div class="result ${allPassed ? "pass" : "fail"}">
      <strong>${allPassed ? "\u2713 All Passed" : "\u2717 Some Failed"}</strong>
      <p>${String(passedCount)} / ${String(total)} test cases passed</p>
    </div>
  `;
  }
  function setLoading(isLoading) {
    const runBtn = document.getElementById("btn-run");
    const submitBtn = document.getElementById("btn-submit");
    if (runBtn) runBtn.disabled = isLoading;
    if (submitBtn) submitBtn.disabled = isLoading;
  }
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.type === "load-problem") {
      currentProblem = message.problem;
      renderDescription(message.problem);
      initMonaco(message.problem.starter_code);
    } else if (message.type === "run-result") {
      renderRunResult(message.result.passed, message.result.stdout, message.result.stderr);
    } else if (message.type === "submit-result") {
      renderSubmitResult(message.result.passed, message.result.total);
    } else if (message.type === "loading") {
      setLoading(message.isLoading);
    }
  });
  function buildLayout() {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `
    <div class="split-pane">
      <div class="pane-left">
        <div id="description">
          <p class="placeholder">Loading problem\u2026</p>
        </div>
      </div>
      <div class="pane-right">
        <div id="editor" class="editor-container"></div>
        <div class="toolbar">
          <button id="btn-run" class="btn btn-secondary">\u25B6 Run Sample</button>
          <button id="btn-submit" class="btn btn-primary">Submit All</button>
        </div>
        <div id="result"></div>
      </div>
    </div>
  `;
  }
  function setupButtons() {
    document.getElementById("btn-run")?.addEventListener("click", () => {
      if (!currentProblem) return;
      const testCase = currentProblem.test_cases[0];
      postMessage({ type: "run-code", code: getCode(), testCase });
    });
    document.getElementById("btn-submit")?.addEventListener("click", () => {
      if (!currentProblem) return;
      postMessage({ type: "submit-code", code: getCode() });
    });
  }
  buildLayout();
  setupButtons();
  postMessage({ type: "ready" });
})();
//# sourceMappingURL=main.js.map
