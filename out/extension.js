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

// src/services/api.ts
var MOCK_MODE = true;
var API_BASE = "https://api.unsw-practice.com/api/v1";
var PISTON_API = "https://emkc.org/api/v2/piston/execute";
var PISTON_TIMEOUT_MS = 3e3;
var MOCK_PROBLEMS = [
  {
    id: "001",
    slug: "list-comprehension-basics",
    title: "List Comprehension Basics",
    difficulty: "easy" /* Easy */,
    topics: ["list", "comprehension"],
    description: [
      "Write a function `squares(n)` that returns a list of squares of numbers",
      "from 1 to n (inclusive).",
      "",
      "**Example:**",
      "```",
      "squares(5) \u2192 [1, 4, 9, 16, 25]",
      "squares(0) \u2192 []",
      "```"
    ].join("\n"),
    starterCode: "def squares(n: int) -> list[int]:\n    # Your code here\n    pass\n",
    hints: ["Try using a list comprehension with range()."],
    acceptanceRate: 82,
    orderIndex: 1,
    isPublished: true,
    testCases: [
      { input: "print(squares(5))", expectedOutput: "[1, 4, 9, 16, 25]" },
      { input: "print(squares(1))", expectedOutput: "[1]" },
      { input: "print(squares(0))", expectedOutput: "[]" }
    ]
  },
  {
    id: "002",
    slug: "dictionary-inversion",
    title: "Dictionary Inversion",
    difficulty: "easy" /* Easy */,
    topics: ["dictionary"],
    description: [
      "Write a function `invert_dict(d)` that returns a new dictionary with",
      "keys and values swapped.",
      "",
      "**Example:**",
      "```",
      "invert_dict({'a': 1, 'b': 2}) \u2192 {1: 'a', 2: 'b'}",
      "```"
    ].join("\n"),
    starterCode: "def invert_dict(d: dict) -> dict:\n    # Your code here\n    pass\n",
    hints: ["Try a dict comprehension swapping k and v."],
    acceptanceRate: 78,
    orderIndex: 2,
    isPublished: true,
    testCases: [
      {
        input: "print(invert_dict({'a': 1, 'b': 2}))",
        expectedOutput: "{1: 'a', 2: 'b'}"
      },
      { input: "print(invert_dict({}))", expectedOutput: "{}" }
    ]
  },
  {
    id: "003",
    slug: "fibonacci-generator",
    title: "Fibonacci Generator",
    difficulty: "medium" /* Medium */,
    topics: ["generator", "fibonacci"],
    description: [
      "Write a generator function `fib()` that yields Fibonacci numbers indefinitely.",
      "",
      "**Example:**",
      "```",
      "gen = fib()",
      "[next(gen) for _ in range(6)] \u2192 [0, 1, 1, 2, 3, 5]",
      "```"
    ].join("\n"),
    starterCode: "from typing import Generator\n\ndef fib() -> Generator[int, None, None]:\n    # Your code here\n    pass\n",
    hints: ["Keep track of the previous two values using local variables."],
    acceptanceRate: 65,
    orderIndex: 3,
    isPublished: true,
    testCases: [
      {
        input: "gen = fib()\nprint([next(gen) for _ in range(6)])",
        expectedOutput: "[0, 1, 1, 2, 3, 5]"
      },
      { input: "gen = fib()\nprint(next(gen))", expectedOutput: "0" }
    ]
  },
  {
    id: "004",
    slug: "flatten-nested-list",
    title: "Flatten Nested List",
    difficulty: "medium" /* Medium */,
    topics: ["recursion", "list"],
    description: [
      "Write a function `flatten(lst)` that recursively flattens a nested list.",
      "",
      "**Example:**",
      "```",
      "flatten([1, [2, [3, 4]], 5]) \u2192 [1, 2, 3, 4, 5]",
      "```"
    ].join("\n"),
    starterCode: "def flatten(lst: list) -> list:\n    # Your code here\n    pass\n",
    hints: ["Use isinstance(x, list) to check if an element is a sublist."],
    acceptanceRate: 60,
    orderIndex: 4,
    isPublished: true,
    testCases: [
      {
        input: "print(flatten([1, [2, [3, 4]], 5]))",
        expectedOutput: "[1, 2, 3, 4, 5]"
      },
      { input: "print(flatten([]))", expectedOutput: "[]" },
      { input: "print(flatten([1, 2, 3]))", expectedOutput: "[1, 2, 3]" }
    ]
  },
  {
    id: "005",
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "hard" /* Hard */,
    topics: ["binary-search", "algorithm"],
    description: [
      "Implement `binary_search(lst, target)` that returns the index of target",
      "in a sorted list, or -1 if not found. Do not use the `bisect` module.",
      "",
      "**Example:**",
      "```",
      "binary_search([1, 3, 5, 7, 9], 5) \u2192 2",
      "binary_search([1, 3, 5, 7, 9], 4) \u2192 -1",
      "```"
    ].join("\n"),
    starterCode: "def binary_search(lst: list[int], target: int) -> int:\n    # Your code here\n    pass\n",
    hints: ["Maintain lo and hi pointers and compare the midpoint each iteration."],
    acceptanceRate: 48,
    orderIndex: 5,
    isPublished: true,
    testCases: [
      {
        input: "print(binary_search([1, 3, 5, 7, 9], 5))",
        expectedOutput: "2"
      },
      {
        input: "print(binary_search([1, 3, 5, 7, 9], 4))",
        expectedOutput: "-1"
      },
      { input: "print(binary_search([], 1))", expectedOutput: "-1" }
    ]
  }
];
async function fetchProblems() {
  if (MOCK_MODE) {
    return Promise.resolve(MOCK_PROBLEMS);
  }
  const response = await fetch(`${API_BASE}/problems`);
  if (!response.ok) {
    throw new Error(`Failed to fetch problems: ${response.statusText}`);
  }
  const json = await response.json();
  return json.data;
}
async function fetchProblem(id) {
  if (MOCK_MODE) {
    const problem = MOCK_PROBLEMS.find((p) => p.id === id);
    if (!problem) {
      throw new Error(`Problem "${id}" not found`);
    }
    return Promise.resolve(problem);
  }
  const response = await fetch(`${API_BASE}/problems/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch problem ${id}: ${response.statusText}`);
  }
  const json = await response.json();
  return json.data;
}
async function runCode(code, input, expectedOutput) {
  const fullCode = `${code}
${input}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PISTON_TIMEOUT_MS);
  try {
    const response = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        language: "python",
        version: "3.10.0",
        files: [{ content: fullCode }]
      })
    });
    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }
    const result = await response.json();
    const actualOutput = result.run.stdout.trim();
    const expected = expectedOutput.trim();
    const stderr = result.run.stderr.trim();
    return {
      passed: actualOutput === expected && result.run.code === 0,
      input,
      expectedOutput: expected,
      actualOutput,
      ...stderr ? { error: stderr } : {}
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
async function submitCode(code, testCases) {
  const testResults = await Promise.all(
    testCases.map((tc) => runCode(code, tc.input, tc.expectedOutput))
  );
  const passedCount = testResults.filter((r) => r.passed).length;
  const allPassed = passedCount === testResults.length;
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

// src/providers/ProblemTreeProvider.ts
var ProblemItem = class extends vscode.TreeItem {
  constructor(problem) {
    super(problem.title, vscode.TreeItemCollapsibleState.None);
    this.problem = problem;
    this.description = problem.difficulty;
    this.tooltip = `${problem.title} \u2014 ${problem.difficulty}`;
    this.contextValue = "problem";
    this.command = {
      command: "unsw-practice.openProblem",
      title: "Open Problem",
      arguments: [problem.id]
    };
    const iconMap = {
      ["easy" /* Easy */]: new vscode.ThemeIcon(
        "circle-filled",
        new vscode.ThemeColor("charts.green")
      ),
      ["medium" /* Medium */]: new vscode.ThemeIcon(
        "circle-filled",
        new vscode.ThemeColor("charts.yellow")
      ),
      ["hard" /* Hard */]: new vscode.ThemeIcon(
        "circle-filled",
        new vscode.ThemeColor("charts.red")
      )
    };
    this.iconPath = iconMap[problem.difficulty];
  }
};
var ProblemTreeProvider = class {
  _onDidChangeTreeData = new vscode.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  problems = [];
  loaded = false;
  /**
   * Reload the problem list from the API and redraw the tree.
   */
  async refresh() {
    try {
      this.problems = await fetchProblems();
      this.loaded = true;
      this._onDidChangeTreeData.fire();
    } catch (error) {
      vscode.window.showErrorMessage(
        `UNSW Practice: Failed to load problems \u2014 ${String(error)}`
      );
    }
  }
  /** Required by TreeDataProvider — returns the item itself. */
  getTreeItem(element) {
    return element;
  }
  /** Returns root-level children (problems). Lazy-loads on first call. */
  async getChildren() {
    if (!this.loaded) {
      await this.refresh();
    }
    return this.problems.map((p) => new ProblemItem(p));
  }
};

// src/providers/ProblemWebviewProvider.ts
var vscode2 = __toESM(require("vscode"));
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
      style-src ${webview.cspSource} 'unsafe-inline';
      script-src 'nonce-${nonce}' https://cdn.jsdelivr.net;
      font-src ${webview.cspSource};
      connect-src https://emkc.org;
    "
  />
  <link rel="stylesheet" href="${cssUri}" />
  <title>UNSW Practice</title>
</head>
<body>
  <div id="app">
    <div class="loading-screen"><p>Loading problem\u2026</p></div>
  </div>
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
    async (problemId) => {
      try {
        const problem = await fetchProblem(problemId);
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
var TOKEN_KEY = "unsw-practice.auth-token";
var USER_KEY = "unsw-practice.user";
async function clearToken(secrets) {
  await secrets.delete(TOKEN_KEY);
}
async function clearUser(globalState) {
  await globalState.update(USER_KEY, void 0);
}

// src/commands/login.ts
function registerLogin(context) {
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
      await clearToken(context.secrets);
      await clearUser(context.globalState);
      vscode5.window.showInformationMessage("UNSW Practice: Logged out successfully.");
    }
  );
  return vscode5.Disposable.from(loginDisposable, logoutDisposable);
}

// src/extension.ts
function activate(context) {
  const treeProvider = new ProblemTreeProvider();
  const webviewProvider = new ProblemWebviewProvider(context.extensionUri);
  const treeView = vscode6.window.createTreeView("unsw-practice.problemList", {
    treeDataProvider: treeProvider,
    showCollapseAll: false
  });
  const refreshDisposable = vscode6.commands.registerCommand(
    "unsw-practice.refresh",
    () => void treeProvider.refresh()
  );
  context.subscriptions.push(
    treeView,
    refreshDisposable,
    registerOpenProblem(context, webviewProvider),
    registerSubmitCode(),
    registerLogin(context)
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
