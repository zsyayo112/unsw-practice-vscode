"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode6 = __toESM(require("vscode"));

// src/providers/ProblemTreeProvider.ts
var vscode = __toESM(require("vscode"));

// src/types/index.ts
var SECRET_KEY = "unsw-practice.authToken";

// src/providers/ProblemTreeProvider.ts
var DIFFICULTY_PREFIX = {
  ["easy" /* Easy */]: "[E]",
  ["medium" /* Medium */]: "[M]",
  ["hard" /* Hard */]: "[H]"
};
var DIFFICULTY_LABEL = {
  ["easy" /* Easy */]: "\u{1F7E2} Easy",
  ["medium" /* Medium */]: "\u{1F7E1} Medium",
  ["hard" /* Hard */]: "\u{1F534} Hard"
};
var ProblemTreeItem = class extends vscode.TreeItem {
  constructor(problem, status) {
    super(
      `${DIFFICULTY_PREFIX[problem.difficulty]} #${problem.orderIndex}  ${problem.title}`,
      vscode.TreeItemCollapsibleState.None
    );
    this.problem = problem;
    this.status = status;
    this.description = problem.topics.join(" \xB7 ");
    this.tooltip = problem.description.slice(0, 120);
    this.contextValue = "problem";
    this.command = {
      command: "unsw-practice.openProblem",
      title: "Open Problem",
      arguments: [problem.slug]
    };
    const iconMap = {
      solved: new vscode.ThemeIcon("pass-filled", new vscode.ThemeColor("testing.iconPassed")),
      attempted: new vscode.ThemeIcon(
        "circle-large-outline",
        new vscode.ThemeColor("charts.yellow")
      ),
      unsolved: new vscode.ThemeIcon("circle-outline")
    };
    this.iconPath = iconMap[status];
  }
  status;
};
var GroupItem = class extends vscode.TreeItem {
  children;
  constructor(difficulty, children) {
    const solvedCount = children.filter((c) => c.status === "solved").length;
    super(
      `${DIFFICULTY_LABEL[difficulty]} (${solvedCount} solved / ${children.length} total)`,
      vscode.TreeItemCollapsibleState.Expanded
    );
    this.children = children;
    this.contextValue = "group";
  }
};
var StatusItem = class extends vscode.TreeItem {
  constructor(kind) {
    if (kind === "loading") {
      super("Loading problems...", vscode.TreeItemCollapsibleState.None);
      this.iconPath = new vscode.ThemeIcon("loading~spin");
    } else {
      super("\u26A0 Failed to load \u2014 click Refresh", vscode.TreeItemCollapsibleState.None);
    }
  }
};
var ProblemTreeProvider = class {
  _onDidChangeTreeData = new vscode.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  problems = [];
  progressMap = /* @__PURE__ */ new Map();
  state = "loading";
  topicFilter = null;
  difficultyFilter = null;
  searchQuery = "";
  /** Fire a tree refresh without changing data (e.g. triggered by the Refresh button). */
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  /** Push new problem + progress data and redraw the tree. */
  setProblems(problems, progress) {
    this.problems = problems;
    this.progressMap = new Map(progress.map((p) => [p.problemId, p.status]));
    this.state = "loaded";
    this._onDidChangeTreeData.fire();
  }
  /** Return how many published problems exist and how many are solved. */
  getSolvedCount() {
    const published = this.problems.filter((p) => p.isPublished);
    const solved = published.filter((p) => this.progressMap.get(p.id) === "solved").length;
    return { solved, total: published.length };
  }
  /** Switch to error state and redraw. */
  setError() {
    this.state = "error";
    this._onDidChangeTreeData.fire();
  }
  filterByTopic(topic) {
    this.topicFilter = topic;
    this._onDidChangeTreeData.fire();
  }
  filterByDifficulty(d) {
    this.difficultyFilter = d;
    this._onDidChangeTreeData.fire();
  }
  search(query) {
    this.searchQuery = query;
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (element instanceof GroupItem) {
      return element.children;
    }
    if (element instanceof ProblemTreeItem || element instanceof StatusItem) {
      return [];
    }
    if (this.state === "loading") {
      return [new StatusItem("loading")];
    }
    if (this.state === "error") {
      return [new StatusItem("error")];
    }
    let filtered = this.problems.filter((p) => p.isPublished);
    const topic = this.topicFilter;
    if (topic !== null) {
      filtered = filtered.filter((p) => p.topics.includes(topic));
    }
    const q = this.searchQuery.toLowerCase();
    if (q) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(q));
    }
    const difficulties = this.difficultyFilter !== null ? [this.difficultyFilter] : ["easy" /* Easy */, "medium" /* Medium */, "hard" /* Hard */];
    return difficulties.map((diff) => {
      const items = filtered.filter((p) => p.difficulty === diff).sort((a, b) => a.orderIndex - b.orderIndex).map((p) => new ProblemTreeItem(p, this.progressMap.get(p.id) ?? "unsolved"));
      return new GroupItem(diff, items);
    });
  }
};

// src/providers/ProblemWebviewProvider.ts
var vscode2 = __toESM(require("vscode"));

// src/services/api.ts
var MOCK_MODE = true;
var API_BASE = "https://api.unsw-practice.com/api/v1";
var JUDGE0_API = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";
var JUDGE0_PYTHON_ID = 71;
var PISTON_TIMEOUT_MS = 3e3;
var API_TIMEOUT_MS = 1e4;
var MAX_RETRIES = 2;
var ApiError = class extends Error {
  constructor(message, statusCode, originalError) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.name = "ApiError";
  }
};
var MOCK_PROBLEMS = [
  {
    id: "001",
    slug: "fibonacci",
    title: "Fibonacci",
    difficulty: "easy" /* Easy */,
    topics: ["recursion"],
    description: [
      "Write a recursive function `fib(n)` that returns the n-th Fibonacci number.",
      "",
      "The sequence starts: 0, 1, 1, 2, 3, 5, 8, \u2026",
      "",
      "**Example:**",
      "```",
      "fib(0) \u2192 0",
      "fib(1) \u2192 1",
      "fib(10) \u2192 55",
      "```"
    ].join("\n"),
    starterCode: "def fib(n: int) -> int:\n    # Your code here\n    pass\n",
    hints: [
      "Base cases: fib(0) = 0, fib(1) = 1.",
      "Recursive case: fib(n) = fib(n-1) + fib(n-2)."
    ],
    acceptanceRate: 75,
    orderIndex: 1,
    isPublished: true,
    testCases: [
      { input: "print(fib(0))", expectedOutput: "0" },
      { input: "print(fib(1))", expectedOutput: "1" },
      { input: "print(fib(10))", expectedOutput: "55" }
    ]
  },
  {
    id: "002",
    slug: "stack-implementation",
    title: "Stack Implementation",
    difficulty: "medium" /* Medium */,
    topics: ["data-structures", "list"],
    description: [
      "Implement a `Stack` class backed by a Python list with the following methods:",
      "",
      "- `push(item)` \u2014 push an item onto the top of the stack",
      "- `pop()` \u2014 remove and return the top item (raise `IndexError` if empty)",
      "- `peek()` \u2014 return the top item without removing it (raise `IndexError` if empty)",
      "- `is_empty()` \u2014 return `True` if the stack is empty",
      "- `size()` \u2014 return the number of items",
      "",
      "**Example:**",
      "```",
      "s = Stack()",
      "s.push(1)",
      "s.push(2)",
      "s.pop()   \u2192 2",
      "s.peek()  \u2192 1",
      "s.size()  \u2192 1",
      "```"
    ].join("\n"),
    starterCode: [
      "class Stack:",
      "    def __init__(self) -> None:",
      "        # Your code here",
      "        pass",
      "",
      "    def push(self, item: object) -> None:",
      "        pass",
      "",
      "    def pop(self) -> object:",
      "        pass",
      "",
      "    def peek(self) -> object:",
      "        pass",
      "",
      "    def is_empty(self) -> bool:",
      "        pass",
      "",
      "    def size(self) -> int:",
      "        pass"
    ].join("\n") + "\n",
    hints: [
      "Store items in a list: self._data = [].",
      "push \u2192 list.append(); pop and peek \u2192 list[-1] / list.pop()."
    ],
    acceptanceRate: 68,
    orderIndex: 2,
    isPublished: true,
    testCases: [
      { input: "s = Stack()\ns.push(1)\ns.push(2)\nprint(s.pop())", expectedOutput: "2" },
      { input: "s = Stack()\nprint(s.is_empty())", expectedOutput: "True" },
      {
        input: "s = Stack()\ns.push(1)\ns.push(2)\ns.push(3)\nprint(s.peek())",
        expectedOutput: "3"
      },
      { input: "s = Stack()\ns.push(1)\ns.push(2)\nprint(s.size())", expectedOutput: "2" }
    ]
  },
  {
    id: "003",
    slug: "bank-account",
    title: "Bank Account",
    difficulty: "medium" /* Medium */,
    topics: ["oop", "class"],
    description: [
      "Implement a `BankAccount` class with:",
      "",
      "- `__init__(owner: str, balance: float = 0)` \u2014 create the account",
      "- `deposit(amount: float)` \u2014 add funds",
      "- `withdraw(amount: float) \u2192 bool` \u2014 deduct funds; return `False` if insufficient, `True` otherwise",
      "- `get_balance() \u2192 float` \u2014 return the current balance",
      "",
      "**Example:**",
      "```",
      'acc = BankAccount("Alice", 100)',
      "acc.deposit(50)       \u2192 balance 150",
      "acc.withdraw(30)      \u2192 True, balance 120",
      "acc.withdraw(200)     \u2192 False, balance unchanged",
      "```"
    ].join("\n"),
    starterCode: [
      "class BankAccount:",
      "    def __init__(self, owner: str, balance: float = 0) -> None:",
      "        # Your code here",
      "        pass",
      "",
      "    def deposit(self, amount: float) -> None:",
      "        pass",
      "",
      "    def withdraw(self, amount: float) -> bool:",
      "        pass",
      "",
      "    def get_balance(self) -> float:",
      "        pass"
    ].join("\n") + "\n",
    hints: [
      "Store owner and balance as instance attributes in __init__.",
      "withdraw should check balance >= amount before deducting."
    ],
    acceptanceRate: 71,
    orderIndex: 3,
    isPublished: true,
    testCases: [
      {
        input: 'acc = BankAccount("Alice", 100)\nprint(acc.get_balance())',
        expectedOutput: "100"
      },
      {
        input: 'acc = BankAccount("Bob")\nacc.deposit(50)\nprint(acc.get_balance())',
        expectedOutput: "50"
      },
      {
        input: 'acc = BankAccount("Charlie", 100)\nprint(acc.withdraw(30))',
        expectedOutput: "True"
      },
      {
        input: 'acc = BankAccount("Dave", 100)\nacc.withdraw(30)\nprint(acc.get_balance())',
        expectedOutput: "70"
      },
      {
        input: 'acc = BankAccount("Eve", 50)\nprint(acc.withdraw(100))',
        expectedOutput: "False"
      }
    ]
  }
];
async function fetchWithRetry(url, options, retriesLeft = MAX_RETRIES) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
    return response;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (retriesLeft > 0) {
      return fetchWithRetry(url, options, retriesLeft - 1);
    }
    throw new ApiError("Network error after max retries", void 0, err);
  } finally {
    clearTimeout(timeoutId);
  }
}
function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
async function fetchProblems(token) {
  if (MOCK_MODE) {
    return Promise.resolve(MOCK_PROBLEMS);
  }
  const response = await fetchWithRetry(`${API_BASE}/problems`, {
    headers: authHeaders(token)
  });
  const json = await response.json();
  return json.data;
}
async function fetchProblem(slug, token) {
  if (MOCK_MODE) {
    const problem = MOCK_PROBLEMS.find((p) => p.slug === slug);
    if (!problem) {
      throw new ApiError(`Problem "${slug}" not found`);
    }
    return Promise.resolve(problem);
  }
  const response = await fetchWithRetry(`${API_BASE}/problems/${slug}`, {
    headers: authHeaders(token)
  });
  const json = await response.json();
  return json.data;
}
async function fetchUserProgress(token) {
  if (MOCK_MODE) {
    return Promise.resolve([]);
  }
  const response = await fetchWithRetry(`${API_BASE}/progress`, {
    headers: authHeaders(token)
  });
  const json = await response.json();
  return json.data;
}
async function runCode(code, input, expectedOutput) {
  const fullCode = `${code}
${input}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PISTON_TIMEOUT_MS);
  try {
    const response = await fetch(JUDGE0_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        source_code: fullCode,
        language_id: JUDGE0_PYTHON_ID,
        stdin: ""
      })
    });
    if (!response.ok) {
      throw new ApiError(`Judge0 API error: ${response.statusText}`, response.status);
    }
    const result = await response.json();
    const expected = expectedOutput.trim();
    const stdout = (result.stdout ?? "").trim();
    const stderr = (result.stderr ?? result.compile_output ?? "").trim();
    if (result.status.id === 5) {
      return { passed: false, input, expectedOutput: expected, actualOutput: "", error: "Time limit exceeded (3s)" };
    }
    return {
      passed: stdout === expected && result.status.id === 3,
      input,
      expectedOutput: expected,
      actualOutput: stdout,
      ...stderr ? { error: stderr } : {}
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
async function submitCode(code, testCases) {
  const CONCURRENCY = 3;
  const testResults = [];
  for (let i = 0; i < testCases.length; i += CONCURRENCY) {
    const batch = testCases.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((tc) => runCode(code, tc.input, tc.expectedOutput))
    );
    for (let j = 0; j < settled.length; j++) {
      const outcome = settled[j];
      if (outcome.status === "fulfilled") {
        testResults.push(outcome.value);
      } else {
        const tc = batch[j];
        testResults.push({
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: "",
          error: outcome.reason instanceof Error ? outcome.reason.message : "Unknown error"
        });
      }
    }
  }
  const allPassed = testResults.every((r) => r.passed);
  let status;
  if (allPassed) {
    status = "accepted" /* Accepted */;
  } else if (testResults.some((r) => r.error)) {
    status = "runtime_error" /* RuntimeError */;
  } else {
    status = "wrong_answer" /* WrongAnswer */;
  }
  return { status, testResults, runtimeMs: 0 };
}

// src/providers/ProblemWebviewProvider.ts
var ProblemWebviewProvider = class {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
  }
  panel;
  currentProblem;
  /**
   * Open (or reveal) the problem panel and load the given problem.
   */
  openProblem(problem) {
    if (this.panel) {
      this.panel.reveal(vscode2.ViewColumn.One);
    } else {
      this.panel = vscode2.window.createWebviewPanel(
        "unsw-practice.problem",
        problem.title,
        vscode2.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode2.Uri.joinPath(this.extensionUri, "media"),
            vscode2.Uri.joinPath(this.extensionUri, "out")
          ],
          retainContextWhenHidden: true
        }
      );
      this.panel.onDidDispose(() => {
        this.panel = void 0;
        this.currentProblem = void 0;
      });
      this.panel.webview.onDidReceiveMessage((message) => {
        void this.handleWebviewMessage(message);
      });
    }
    this.currentProblem = problem;
    this.panel.title = problem.title;
    this.panel.webview.html = this.buildHtml(this.panel.webview);
    void this.postMessage({ type: "load-problem", problem });
  }
  /**
   * Handle typed messages arriving from the WebView.
   */
  async handleWebviewMessage(message) {
    if (!this.currentProblem) {
      return;
    }
    if (message.type === "run-code") {
      await this.postMessage({ type: "loading", isLoading: true });
      try {
        const result = await runCode(message.code, message.input, message.expectedOutput);
        await this.postMessage({ type: "run-result", result });
      } catch (error) {
        vscode2.window.showErrorMessage(
          `UNSW Practice: Failed to run code \u2014 ${String(error)}`
        );
      } finally {
        await this.postMessage({ type: "loading", isLoading: false });
      }
    } else if (message.type === "submit-code") {
      await this.postMessage({ type: "loading", isLoading: true });
      try {
        const result = await submitCode(message.code, this.currentProblem.testCases);
        await this.postMessage({ type: "submit-result", result });
      } catch (error) {
        vscode2.window.showErrorMessage(
          `UNSW Practice: Failed to submit code \u2014 ${String(error)}`
        );
      } finally {
        await this.postMessage({ type: "loading", isLoading: false });
      }
    }
  }
  /**
   * Send a typed message to the WebView.
   */
  async postMessage(message) {
    if (this.panel) {
      await this.panel.webview.postMessage(message);
    }
  }
  /**
   * Build the WebView HTML with a per-request nonce and strict CSP.
   */
  buildHtml(webview) {
    const nonce = getNonce();
    const cssUri = webview.asWebviewUri(
      vscode2.Uri.joinPath(this.extensionUri, "media", "main.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode2.Uri.joinPath(this.extensionUri, "out", "webview", "main.js")
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
      worker-src blob:;
    "
  />
  <link rel="stylesheet" href="${cssUri}" />
  <title>UNSW Practice</title>
</head>
<body>
  <div id="app">
    <div class="loading-screen"><p>Loading problem\u2026</p></div>
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
};
function getNonce() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    ""
  );
}

// src/commands/openProblem.ts
var vscode3 = __toESM(require("vscode"));
function registerOpenProblem(_context, webviewProvider) {
  return vscode3.commands.registerCommand(
    "unsw-practice.openProblem",
    async (slug) => {
      try {
        const problem = await fetchProblem(slug);
        webviewProvider.openProblem(problem);
      } catch (error) {
        vscode3.window.showErrorMessage(
          `UNSW Practice: Failed to open problem \u2014 ${String(error)}`
        );
      }
    }
  );
}

// src/commands/submitCode.ts
var vscode4 = __toESM(require("vscode"));
function registerSubmitCode() {
  return vscode4.commands.registerCommand("unsw-practice.submitCode", () => {
    vscode4.window.showInformationMessage(
      "UNSW Practice: Open a problem and use the Submit button in the panel."
    );
  });
}

// src/commands/login.ts
var vscode5 = __toESM(require("vscode"));

// src/services/auth.ts
var USER_KEY = "unsw-practice.user";
function createAuthService(secrets) {
  return {
    async getToken() {
      return secrets.get(SECRET_KEY);
    },
    async setToken(token) {
      await secrets.store(SECRET_KEY, token);
    },
    async clearToken() {
      await secrets.delete(SECRET_KEY);
    },
    async isAuthenticated() {
      return await secrets.get(SECRET_KEY) !== void 0;
    }
  };
}
async function clearUser(globalState) {
  await globalState.update(USER_KEY, void 0);
}

// src/commands/login.ts
function registerLogin(context, authService, onReload) {
  const loginDisposable = vscode5.commands.registerCommand(
    "unsw-practice.login",
    () => {
      vscode5.window.showInformationMessage(
        "UNSW Practice: Account login will be available in a future release."
      );
    }
  );
  const logoutDisposable = vscode5.commands.registerCommand(
    "unsw-practice.logout",
    async () => {
      await authService.clearToken();
      await clearUser(context.globalState);
      vscode5.window.showInformationMessage("UNSW Practice: Logged out successfully.");
      onReload();
    }
  );
  return vscode5.Disposable.from(loginDisposable, logoutDisposable);
}

// src/extension.ts
function activate(context) {
  const authService = createAuthService(context.secrets);
  const treeProvider = new ProblemTreeProvider();
  const webviewProvider = new ProblemWebviewProvider(context.extensionUri);
  const treeView = vscode6.window.createTreeView("unsw-practice.problemList", {
    treeDataProvider: treeProvider,
    showCollapseAll: false
  });
  let statusBar;
  async function loadProblems() {
    try {
      const token = await authService.getToken();
      const [problems, progress] = await Promise.all([
        fetchProblems(token),
        token ? fetchUserProgress(token) : Promise.resolve([])
      ]);
      treeProvider.setProblems(problems, progress);
      const { solved, total } = treeProvider.getSolvedCount();
      if (statusBar) {
        statusBar.text = `$(book) UNSW: ${solved}/${total} solved`;
      }
    } catch (error) {
      treeProvider.setError();
      vscode6.window.showErrorMessage(
        `UNSW Practice: Failed to load problems \u2014 ${String(error)}`
      );
    }
  }
  void loadProblems();
  const refreshDisposable = vscode6.commands.registerCommand(
    "unsw-practice.refresh",
    () => void loadProblems()
  );
  context.subscriptions.push(
    treeView,
    refreshDisposable,
    registerOpenProblem(context, webviewProvider),
    registerSubmitCode(),
    registerLogin(context, authService, () => void loadProblems())
  );
  statusBar = vscode6.window.createStatusBarItem(vscode6.StatusBarAlignment.Left, 100);
  statusBar.command = "unsw-practice.refresh";
  statusBar.text = "$(book) UNSW: 0/0 solved";
  statusBar.tooltip = "Click to refresh UNSW Practice problems";
  statusBar.show();
  context.subscriptions.push(statusBar);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
