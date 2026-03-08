/**
 * API service — no VSCode dependencies.
 * All network calls live here so the web app (Phase 2) can reuse this module.
 *
 * MOCK_MODE=true bypasses the real backend and returns local fixture data.
 * Flip to false once the Next.js + Supabase backend is live.
 */

import type { Problem, RunResult, SubmitResult, TestCase } from '../types/index';

const MOCK_MODE = true;

const API_BASE = 'https://api.unsw-practice.com/api/v1';
const PISTON_API = 'https://emkc.org/api/v2/piston/execute';
const PISTON_TIMEOUT_MS = 3000;

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROBLEMS: Problem[] = [
  {
    id: '001',
    title: 'List Comprehension Basics',
    difficulty: 'Easy',
    course_id: 'comp9021',
    description: [
      'Write a function `squares(n)` that returns a list of squares of numbers',
      'from 1 to n (inclusive).',
      '',
      '**Example:**',
      '```',
      'squares(5) → [1, 4, 9, 16, 25]',
      'squares(0) → []',
      '```',
    ].join('\n'),
    starter_code: 'def squares(n: int) -> list[int]:\n    # Your code here\n    pass\n',
    test_cases: [
      { input: 'print(squares(5))', expected_output: '[1, 4, 9, 16, 25]' },
      { input: 'print(squares(1))', expected_output: '[1]' },
      { input: 'print(squares(0))', expected_output: '[]' },
    ],
    tags: ['list', 'comprehension'],
  },
  {
    id: '002',
    title: 'Dictionary Inversion',
    difficulty: 'Easy',
    course_id: 'comp9021',
    description: [
      'Write a function `invert_dict(d)` that returns a new dictionary with',
      'keys and values swapped.',
      '',
      '**Example:**',
      '```',
      "invert_dict({'a': 1, 'b': 2}) → {1: 'a', 2: 'b'}",
      '```',
    ].join('\n'),
    starter_code: 'def invert_dict(d: dict) -> dict:\n    # Your code here\n    pass\n',
    test_cases: [
      {
        input: "print(invert_dict({'a': 1, 'b': 2}))",
        expected_output: "{1: 'a', 2: 'b'}",
      },
      { input: 'print(invert_dict({}))', expected_output: '{}' },
    ],
    tags: ['dictionary'],
  },
  {
    id: '003',
    title: 'Fibonacci Generator',
    difficulty: 'Medium',
    course_id: 'comp9021',
    description: [
      'Write a generator function `fib()` that yields Fibonacci numbers indefinitely.',
      '',
      '**Example:**',
      '```',
      'gen = fib()',
      '[next(gen) for _ in range(6)] → [0, 1, 1, 2, 3, 5]',
      '```',
    ].join('\n'),
    starter_code:
      'from typing import Generator\n\ndef fib() -> Generator[int, None, None]:\n    # Your code here\n    pass\n',
    test_cases: [
      {
        input: 'gen = fib()\nprint([next(gen) for _ in range(6)])',
        expected_output: '[0, 1, 1, 2, 3, 5]',
      },
      { input: 'gen = fib()\nprint(next(gen))', expected_output: '0' },
    ],
    tags: ['generator', 'fibonacci'],
  },
  {
    id: '004',
    title: 'Flatten Nested List',
    difficulty: 'Medium',
    course_id: 'comp9021',
    description: [
      'Write a function `flatten(lst)` that recursively flattens a nested list.',
      '',
      '**Example:**',
      '```',
      'flatten([1, [2, [3, 4]], 5]) → [1, 2, 3, 4, 5]',
      '```',
    ].join('\n'),
    starter_code: 'def flatten(lst: list) -> list:\n    # Your code here\n    pass\n',
    test_cases: [
      {
        input: 'print(flatten([1, [2, [3, 4]], 5]))',
        expected_output: '[1, 2, 3, 4, 5]',
      },
      { input: 'print(flatten([]))', expected_output: '[]' },
      { input: 'print(flatten([1, 2, 3]))', expected_output: '[1, 2, 3]' },
    ],
    tags: ['recursion', 'list'],
  },
  {
    id: '005',
    title: 'Binary Search',
    difficulty: 'Hard',
    course_id: 'comp9021',
    description: [
      'Implement `binary_search(lst, target)` that returns the index of target',
      'in a sorted list, or -1 if not found. Do not use the `bisect` module.',
      '',
      '**Example:**',
      '```',
      'binary_search([1, 3, 5, 7, 9], 5) → 2',
      'binary_search([1, 3, 5, 7, 9], 4) → -1',
      '```',
    ].join('\n'),
    starter_code:
      'def binary_search(lst: list[int], target: int) -> int:\n    # Your code here\n    pass\n',
    test_cases: [
      {
        input: 'print(binary_search([1, 3, 5, 7, 9], 5))',
        expected_output: '2',
      },
      {
        input: 'print(binary_search([1, 3, 5, 7, 9], 4))',
        expected_output: '-1',
      },
      { input: 'print(binary_search([], 1))', expected_output: '-1' },
    ],
    tags: ['binary-search', 'algorithm'],
  },
];

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch the full problem list.
 * In MOCK_MODE returns local fixtures; otherwise calls /api/v1/problems.
 */
export async function fetchProblems(): Promise<Problem[]> {
  if (MOCK_MODE) {
    return Promise.resolve(MOCK_PROBLEMS);
  }
  const response = await fetch(`${API_BASE}/problems`);
  if (!response.ok) {
    throw new Error(`Failed to fetch problems: ${response.statusText}`);
  }
  const json = (await response.json()) as { data: Problem[] };
  return json.data;
}

/**
 * Fetch a single problem by ID.
 * In MOCK_MODE returns local fixture; otherwise calls /api/v1/problems/:id.
 */
export async function fetchProblem(id: string): Promise<Problem> {
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
  const json = (await response.json()) as { data: Problem };
  return json.data;
}

/**
 * Run student code against a single test case via the Piston sandbox API.
 * Enforces a 3-second hard timeout.
 */
export async function runCode(code: string, testCase: TestCase): Promise<RunResult> {
  const fullCode = `${code}\n${testCase.input}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PISTON_TIMEOUT_MS);

  try {
    const response = await fetch(PISTON_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: 'python',
        version: '3.10.0',
        files: [{ content: fullCode }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }

    const result = (await response.json()) as {
      run: { stdout: string; stderr: string; code: number };
    };

    const stdout = result.run.stdout.trim();
    const expected = testCase.expected_output.trim();

    return {
      stdout,
      stderr: result.run.stderr,
      exit_code: result.run.code,
      passed: stdout === expected,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Submit student code against all test cases of a problem.
 * Runs cases in parallel and aggregates the results.
 */
export async function submitCode(code: string, testCases: TestCase[]): Promise<SubmitResult> {
  const results = await Promise.all(testCases.map((tc) => runCode(code, tc)));
  const passed = results.filter((r) => r.passed).length;
  return { passed, total: results.length, results };
}
