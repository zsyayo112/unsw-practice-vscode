/**
 * API service — no VSCode dependencies.
 * All network calls live here so the web app (Phase 2) can reuse this module.
 *
 * MOCK_MODE=true bypasses the real backend and returns local fixture data.
 * Flip to false once the Next.js + Supabase backend is live.
 */

import type { Problem, TestCase, TestResult, SubmissionResult, UserProgress } from '../types/index';
import { Difficulty, SubmissionStatus } from '../types/index';

export const MOCK_MODE = true;

const API_BASE = 'https://api.unsw-practice.com/api/v1';
const JUDGE0_API = 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';
const JUDGE0_PYTHON_ID = 71; // Python 3.8
const PISTON_TIMEOUT_MS = 3000;
const API_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

// ── ApiError ──────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_PROBLEMS: Problem[] = [
  {
    id: '001',
    slug: 'fibonacci',
    title: 'Fibonacci',
    difficulty: Difficulty.Easy,
    topics: ['recursion'],
    description: [
      'Write a recursive function `fib(n)` that returns the n-th Fibonacci number.',
      '',
      'The sequence starts: 0, 1, 1, 2, 3, 5, 8, …',
      '',
      '**Example:**',
      '```',
      'fib(0) → 0',
      'fib(1) → 1',
      'fib(10) → 55',
      '```',
    ].join('\n'),
    starterCode: 'def fib(n: int) -> int:\n    # Your code here\n    pass\n',
    hints: [
      'Base cases: fib(0) = 0, fib(1) = 1.',
      'Recursive case: fib(n) = fib(n-1) + fib(n-2).',
    ],
    acceptanceRate: 75,
    orderIndex: 1,
    isPublished: true,
    testCases: [
      { input: 'print(fib(0))', expectedOutput: '0' },
      { input: 'print(fib(1))', expectedOutput: '1' },
      { input: 'print(fib(10))', expectedOutput: '55' },
    ],
  },
  {
    id: '002',
    slug: 'stack-implementation',
    title: 'Stack Implementation',
    difficulty: Difficulty.Medium,
    topics: ['data-structures', 'list'],
    description: [
      'Implement a `Stack` class backed by a Python list with the following methods:',
      '',
      '- `push(item)` — push an item onto the top of the stack',
      '- `pop()` — remove and return the top item (raise `IndexError` if empty)',
      '- `peek()` — return the top item without removing it (raise `IndexError` if empty)',
      '- `is_empty()` — return `True` if the stack is empty',
      '- `size()` — return the number of items',
      '',
      '**Example:**',
      '```',
      's = Stack()',
      's.push(1)',
      's.push(2)',
      's.pop()   → 2',
      's.peek()  → 1',
      's.size()  → 1',
      '```',
    ].join('\n'),
    starterCode: [
      'class Stack:',
      '    def __init__(self) -> None:',
      '        # Your code here',
      '        pass',
      '',
      '    def push(self, item: object) -> None:',
      '        pass',
      '',
      '    def pop(self) -> object:',
      '        pass',
      '',
      '    def peek(self) -> object:',
      '        pass',
      '',
      '    def is_empty(self) -> bool:',
      '        pass',
      '',
      '    def size(self) -> int:',
      '        pass',
    ].join('\n') + '\n',
    hints: [
      'Store items in a list: self._data = [].',
      'push → list.append(); pop and peek → list[-1] / list.pop().',
    ],
    acceptanceRate: 68,
    orderIndex: 2,
    isPublished: true,
    testCases: [
      { input: 's = Stack()\ns.push(1)\ns.push(2)\nprint(s.pop())', expectedOutput: '2' },
      { input: 's = Stack()\nprint(s.is_empty())', expectedOutput: 'True' },
      {
        input: 's = Stack()\ns.push(1)\ns.push(2)\ns.push(3)\nprint(s.peek())',
        expectedOutput: '3',
      },
      { input: 's = Stack()\ns.push(1)\ns.push(2)\nprint(s.size())', expectedOutput: '2' },
    ],
  },
  {
    id: '003',
    slug: 'bank-account',
    title: 'Bank Account',
    difficulty: Difficulty.Medium,
    topics: ['oop', 'class'],
    description: [
      'Implement a `BankAccount` class with:',
      '',
      '- `__init__(owner: str, balance: float = 0)` — create the account',
      '- `deposit(amount: float)` — add funds',
      '- `withdraw(amount: float) → bool` — deduct funds; return `False` if insufficient, `True` otherwise',
      '- `get_balance() → float` — return the current balance',
      '',
      '**Example:**',
      '```',
      'acc = BankAccount("Alice", 100)',
      'acc.deposit(50)       → balance 150',
      'acc.withdraw(30)      → True, balance 120',
      'acc.withdraw(200)     → False, balance unchanged',
      '```',
    ].join('\n'),
    starterCode: [
      'class BankAccount:',
      '    def __init__(self, owner: str, balance: float = 0) -> None:',
      '        # Your code here',
      '        pass',
      '',
      '    def deposit(self, amount: float) -> None:',
      '        pass',
      '',
      '    def withdraw(self, amount: float) -> bool:',
      '        pass',
      '',
      '    def get_balance(self) -> float:',
      '        pass',
    ].join('\n') + '\n',
    hints: [
      'Store owner and balance as instance attributes in __init__.',
      'withdraw should check balance >= amount before deducting.',
    ],
    acceptanceRate: 71,
    orderIndex: 3,
    isPublished: true,
    testCases: [
      {
        input: 'acc = BankAccount("Alice", 100)\nprint(acc.get_balance())',
        expectedOutput: '100',
      },
      {
        input: 'acc = BankAccount("Bob")\nacc.deposit(50)\nprint(acc.get_balance())',
        expectedOutput: '50',
      },
      {
        input: 'acc = BankAccount("Charlie", 100)\nprint(acc.withdraw(30))',
        expectedOutput: 'True',
      },
      {
        input: 'acc = BankAccount("Dave", 100)\nacc.withdraw(30)\nprint(acc.get_balance())',
        expectedOutput: '70',
      },
      {
        input: 'acc = BankAccount("Eve", 50)\nprint(acc.withdraw(100))',
        expectedOutput: 'False',
      },
    ],
  },
];

// ── Internal helpers ──────────────────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retriesLeft: number = MAX_RETRIES,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      // 4xx / 5xx — surface immediately, no retry
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
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
    throw new ApiError('Network error after max retries', undefined, err);
  } finally {
    clearTimeout(timeoutId);
  }
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch the full problem list.
 * In MOCK_MODE returns local fixtures; otherwise calls GET /api/v1/problems.
 */
export async function fetchProblems(token?: string): Promise<Problem[]> {
  if (MOCK_MODE) {
    return Promise.resolve(MOCK_PROBLEMS);
  }
  const response = await fetchWithRetry(`${API_BASE}/problems`, {
    headers: authHeaders(token),
  });
  const json = (await response.json()) as { data: Problem[] };
  return json.data;
}

/**
 * Fetch a single problem by slug.
 * In MOCK_MODE returns local fixture; otherwise calls GET /api/v1/problems/:slug.
 */
export async function fetchProblem(slug: string, token?: string): Promise<Problem> {
  if (MOCK_MODE) {
    const problem = MOCK_PROBLEMS.find((p) => p.slug === slug);
    if (!problem) {
      throw new ApiError(`Problem "${slug}" not found`);
    }
    return Promise.resolve(problem);
  }
  const response = await fetchWithRetry(`${API_BASE}/problems/${slug}`, {
    headers: authHeaders(token),
  });
  const json = (await response.json()) as { data: Problem };
  return json.data;
}

/**
 * Submit student code for a problem.
 * In MOCK_MODE runs against the Piston sandbox; otherwise calls POST /api/v1/submit.
 */
export async function submitSolution(params: {
  problemId: string;
  code: string;
  token: string;
}): Promise<SubmissionResult> {
  if (MOCK_MODE) {
    const problem = MOCK_PROBLEMS.find((p) => p.id === params.problemId);
    if (!problem) {
      throw new ApiError(`Problem "${params.problemId}" not found`);
    }
    return submitCode(params.code, problem.testCases);
  }
  const response = await fetchWithRetry(`${API_BASE}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(params.token) },
    body: JSON.stringify({ problemId: params.problemId, code: params.code }),
  });
  const json = (await response.json()) as { data: SubmissionResult };
  return json.data;
}

/**
 * Fetch per-problem progress for the authenticated user.
 * In MOCK_MODE returns an empty array (no local progress tracking in Phase 1).
 * Otherwise calls GET /api/v1/progress.
 */
export async function fetchUserProgress(token: string): Promise<UserProgress[]> {
  if (MOCK_MODE) {
    return Promise.resolve([]);
  }
  const response = await fetchWithRetry(`${API_BASE}/progress`, {
    headers: authHeaders(token),
  });
  const json = (await response.json()) as { data: UserProgress[] };
  return json.data;
}

// ── Piston (local code execution) ─────────────────────────────────────────────

/**
 * Run student code against a single test case via the Piston sandbox API.
 * Enforces a 3-second hard timeout.
 */
export async function runCode(
  code: string,
  input: string,
  expectedOutput: string,
): Promise<TestResult> {
  const fullCode = `${code}\n${input}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PISTON_TIMEOUT_MS);

  try {
    const response = await fetch(JUDGE0_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        source_code: fullCode,
        language_id: JUDGE0_PYTHON_ID,
        stdin: '',
      }),
    });

    if (!response.ok) {
      throw new ApiError(`Judge0 API error: ${response.statusText}`, response.status);
    }

    const result = (await response.json()) as {
      stdout: string | null;
      stderr: string | null;
      compile_output: string | null;
      status: { id: number; description: string };
    };

    const expected = expectedOutput.trim();
    const stdout = (result.stdout ?? '').trim();
    const stderr = (result.stderr ?? result.compile_output ?? '').trim();

    // status.id 5 = Time Limit Exceeded, 6 = Compilation Error, 7-12 = Runtime Error
    if (result.status.id === 5) {
      return { passed: false, input, expectedOutput: expected, actualOutput: '', error: 'Time limit exceeded (3s)' };
    }

    return {
      passed: stdout === expected && result.status.id === 3,
      input,
      expectedOutput: expected,
      actualOutput: stdout,
      ...(stderr ? { error: stderr } : {}),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Run student code against all test cases of a problem.
 * Used by the WebView "Submit" flow in MOCK_MODE (no auth token required).
 * Runs cases in parallel and aggregates the results.
 */
export async function submitCode(
  code: string,
  testCases: TestCase[],
): Promise<SubmissionResult> {
  // Run at most 3 test cases concurrently to avoid overwhelming Piston
  const CONCURRENCY = 3;
  const testResults: TestResult[] = [];
  for (let i = 0; i < testCases.length; i += CONCURRENCY) {
    const batch = testCases.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((tc) => runCode(code, tc.input, tc.expectedOutput)),
    );
    for (let j = 0; j < settled.length; j++) {
      const outcome = settled[j];
      if (outcome.status === 'fulfilled') {
        testResults.push(outcome.value);
      } else {
        const tc = batch[j];
        testResults.push({
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          error: outcome.reason instanceof Error ? outcome.reason.message : 'Unknown error',
        });
      }
    }
  }

  const allPassed = testResults.every((r) => r.passed);

  let status: SubmissionResult['status'];
  if (allPassed) {
    status = SubmissionStatus.Accepted;
  } else if (testResults.some((r) => r.error)) {
    status = SubmissionStatus.RuntimeError;
  } else {
    status = SubmissionStatus.WrongAnswer;
  }

  return { status, testResults, runtimeMs: 0 };
}
