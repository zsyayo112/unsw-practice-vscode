"use strict";
(() => {
  // src/webview/main.ts
  var monacoRequire = globalThis["require"];
  var vscode = acquireVsCodeApi();
  var currentProblem = null;
  var editor = null;
  var isRunning = false;
  function postMessage(message) {
    vscode.postMessage(message);
  }
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function renderMarkdown(md) {
    const markedLib = globalThis["marked"];
    if (markedLib) {
      return markedLib.parse(md);
    }
    return md.replace(/```[\s\S]*?```/g, (m) => {
      const code = m.slice(3, -3).replace(/^\w+\n/, "");
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    }).replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />");
  }
  function getCode() {
    return editor?.getValue() ?? "";
  }
  function buildLayout() {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `
    <div class="split-pane">
      <div class="pane-left">
        <div id="problem-header"></div>
        <div class="tab-bar">
          <button class="tab active" data-tab="description">Description</button>
          <button class="tab" data-tab="hints">Hints</button>
          <button class="tab" data-tab="solution">Solution &#x1F512;</button>
        </div>
        <div id="tab-description" class="tab-content active"></div>
        <div id="tab-hints" class="tab-content"></div>
        <div id="tab-solution" class="tab-content">
          <p class="locked-msg">Solutions will be available after the course session.</p>
        </div>
      </div>
      <div class="pane-right">
        <div class="toolbar">
          <span class="lang-badge">Python 3</span>
          <button id="btn-run" class="btn btn-secondary">&#x25B6; Run</button>
          <button id="btn-submit" class="btn btn-primary">&#x2191; Submit</button>
          <button id="btn-reset" class="btn btn-ghost">&#x21BA; Reset</button>
        </div>
        <div id="editor" class="editor-container"></div>
        <div id="result" class="result-panel"></div>
      </div>
    </div>
  `;
  }
  function setupTabs() {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset["tab"];
        if (!target) return;
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(`tab-${target}`)?.classList.add("active");
      });
    });
  }
  function renderProblem(problem) {
    const header = document.getElementById("problem-header");
    if (header) {
      const topicPills = problem.topics.map((t) => `<span class="topic-pill">${escapeHtml(t)}</span>`).join("");
      header.innerHTML = `
      <h2>${escapeHtml(problem.title)}</h2>
      <div class="header-meta">
        <span class="badge badge-${problem.difficulty.toLowerCase()}">${escapeHtml(problem.difficulty)}</span>
        <div class="topic-pills">${topicPills}</div>
      </div>
    `;
    }
    const descTab = document.getElementById("tab-description");
    if (descTab) {
      const sampleCases = problem.testCases.slice(0, 2);
      const casesHtml = sampleCases.map(
        (tc, i) => `
        <div class="sample-case">
          <strong>Example ${String(i + 1)}</strong>
          <div class="sample-label">Input:</div>
          <pre>${escapeHtml(tc.input)}</pre>
          <div class="sample-label">Expected Output:</div>
          <pre>${escapeHtml(tc.expectedOutput)}</pre>
        </div>
      `
      ).join("");
      descTab.innerHTML = `
      <div class="description-body">${renderMarkdown(problem.description)}</div>
      ${sampleCases.length > 0 ? `<div class="sample-cases"><h3>Examples</h3>${casesHtml}</div>` : ""}
    `;
    }
    const hintsTab = document.getElementById("tab-hints");
    if (hintsTab) {
      if (problem.hints.length === 0) {
        hintsTab.innerHTML = '<p class="placeholder">No hints available.</p>';
      } else {
        const hintsHtml = problem.hints.map(
          (hint, i) => `
          <details class="hint-item">
            <summary>Hint ${String(i + 1)}</summary>
            <p>${escapeHtml(hint)}</p>
          </details>
        `
        ).join("");
        hintsTab.innerHTML = `<div class="hints-list">${hintsHtml}</div>`;
      }
    }
  }
  function initMonaco(slug, starterCode) {
    const savedCode = localStorage.getItem(`unsw-code-${slug}`) ?? starterCode;
    monacoRequire.config({
      paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs" }
    });
    monacoRequire(["vs/editor/editor.main"], (monaco) => {
      const editorEl = document.getElementById("editor");
      if (!editorEl) return;
      editor = monaco.editor.create(editorEl, {
        value: savedCode,
        language: "python",
        theme: "vs-dark",
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false
      });
      editor.onDidChangeModelContent(() => {
        localStorage.setItem(`unsw-code-${slug}`, editor?.getValue() ?? "");
      });
    });
  }
  function renderRunResult(result) {
    const el = document.getElementById("result");
    if (!el) return;
    el.classList.add("visible");
    el.innerHTML = `
    <div class="result-inner ${result.passed ? "pass" : "fail"}">
      <div class="result-header">
        <span class="result-icon">${result.passed ? "&#x2713;" : "&#x2717;"}</span>
        <span>${result.passed ? "Passed" : "Failed"}</span>
      </div>
      <div class="result-details">
        <div class="result-row">
          <span class="result-label">Input:</span>
          <pre>${escapeHtml(result.input)}</pre>
        </div>
        <div class="result-row">
          <span class="result-label">Expected:</span>
          <pre>${escapeHtml(result.expectedOutput)}</pre>
        </div>
        <div class="result-row">
          <span class="result-label">Got:</span>
          <pre>${escapeHtml(result.actualOutput || "(no output)")}</pre>
        </div>
        ${result.error ? `<div class="error-block"><pre>${escapeHtml(result.error)}</pre></div>` : ""}
      </div>
    </div>
  `;
  }
  function renderSubmitResult(result) {
    const el = document.getElementById("result");
    if (!el) return;
    el.classList.add("visible");
    const total = result.testResults.length;
    const passedCount = result.testResults.filter((r) => r.passed).length;
    const allPassed = result.status === "accepted" /* Accepted */;
    const rowsHtml = result.testResults.map(
      (r, i) => `
      <div class="tc-row ${r.passed ? "pass" : "fail"}">
        <span class="tc-icon">${r.passed ? "&#x2713;" : "&#x2717;"}</span>
        <span class="tc-label">Case ${String(i + 1)}</span>
        <span class="tc-preview">${escapeHtml(r.input.split("\n")[0] ?? "")}</span>
        ${!r.passed ? `<div class="tc-detail">
                <span class="result-label">Expected:</span>
                <code>${escapeHtml(r.expectedOutput)}</code>
                &nbsp;
                <span class="result-label">Got:</span>
                <code>${escapeHtml(r.actualOutput || r.error || "(error)")}</code>
               </div>` : ""}
      </div>
    `
    ).join("");
    el.innerHTML = `
    <div class="result-inner ${allPassed ? "pass" : "fail"}">
      ${allPassed ? '<div class="accepted-banner">&#x1F389; Accepted!</div>' : ""}
      <div class="submit-summary">
        <strong>${String(passedCount)} / ${String(total)} Tests Passed</strong>
        ${result.runtimeMs > 0 ? `<span class="runtime">\xB7 ${String(result.runtimeMs)}ms</span>` : ""}
      </div>
      <div class="tc-list">${rowsHtml}</div>
    </div>
  `;
  }
  function setLoading(loading) {
    isRunning = loading;
    const runBtn = document.getElementById("btn-run");
    const submitBtn = document.getElementById("btn-submit");
    if (runBtn) runBtn.disabled = loading;
    if (submitBtn) submitBtn.disabled = loading;
  }
  function setupButtons() {
    document.getElementById("btn-run")?.addEventListener("click", () => {
      if (!currentProblem || isRunning) return;
      const tc = currentProblem.testCases[0];
      if (!tc) return;
      postMessage({
        type: "run-code",
        code: getCode(),
        input: tc.input,
        expectedOutput: tc.expectedOutput
      });
    });
    document.getElementById("btn-submit")?.addEventListener("click", () => {
      if (!currentProblem || isRunning) return;
      postMessage({ type: "submit-code", code: getCode() });
    });
    document.getElementById("btn-reset")?.addEventListener("click", () => {
      if (!currentProblem) return;
      editor?.setValue(currentProblem.starterCode);
      localStorage.removeItem(`unsw-code-${currentProblem.slug}`);
    });
  }
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.type === "load-problem") {
      currentProblem = message.problem;
      renderProblem(message.problem);
      initMonaco(message.problem.slug, message.problem.starterCode);
    } else if (message.type === "run-result") {
      renderRunResult(message.result);
    } else if (message.type === "submit-result") {
      renderSubmitResult(message.result);
    } else if (message.type === "loading") {
      setLoading(message.isLoading);
    }
  });
  buildLayout();
  setupTabs();
  setupButtons();
  postMessage({ type: "ready" });
})();
//# sourceMappingURL=main.js.map
