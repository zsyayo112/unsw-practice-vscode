/**
 * API service — no VSCode dependencies.
 * All network calls live here so the web app (Phase 2) can reuse this module.
 *
 * MOCK_MODE=true bypasses the real backend and returns local fixture data.
 * Flip to false once the Next.js + Supabase backend is live.
 */

import type { Problem, TestCase, TestResult, SubmissionResult } from '../types/index';
import { Difficulty, SubmissionStatus } from '../types/index';

const MOCK_MODE = true;

const API_BASE = 'https://api.unsw-practice.com/api/v1';
const PISTON_API = 'https://emkc.org/api/v2/piston/execute';
const PISTON_TIMEOUT_MS = 3000;

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROBLEMS: Problem[] = [
  {
    id: '001',
    slug: 'list-comprehension-basics',
    title: 'List Comprehension Basics',
    difficulty: Difficulty.Easy,
    topics: ['list', 'comprehension'],
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
    starterCode: 'def squares(n: int) -> list[int]:\n    # Your code here\n    pass\n',
    hints: ['Try using a list comprehension with range().'],
    acceptanceRate: 82,
    orderIndex: 1,
    isPublished: true,
    testCases: [
      { input: 'print(squares(5))', expectedOutput: '[1, 4, 9, 16, 25]' },
      { input: 'print(squares(1))', expectedOutput: '[1]' },
      { input: 'print(squares(0))', expectedOutput: '[]' },
    ],
  },
  {
    id: '002',
    slug: 'dictionary-inversion',
    title: 'Dictionary Inversion',
    difficulty: Difficulty.Easy,
    topics: ['dictionary'],
    description: [
      'Write a function `invert_dict(d)` that returns a new dictionary with',
      'keys and values swapped.',
      '',
      '**Example:**',
      '```',
      "invert_dict({'a': 1, 'b': 2}) → {1: 'a', 2: 'b'}",
      '```',
    ].join('\n'),
    starterCode: 'def invert_dict(d: dict) -> dict:\n    # Your code here\n    pass\n',
    hints: ['Try a dict comprehension swapping k and v.'],
    acceptanceRate: 78,
    orderIndex: 2,
    isPublished: true,
    testCases: [
      {
        input: "print(invert_dict({'a': 1, 'b': 2}))",
        expectedOutput: "{1: 'a', 2: 'b'}",
      },
      { input: 'print(invert_dict({}))', expectedOutput: '{}' },
    ],
  },
  {
    id: '003',
    slug: 'fibonacci-generator',
    title: 'Fibonacci Generator',
    difficulty: Difficulty.Medium,
    topics: ['generator', 'fibonacci'],
    description: [
      'Write a generator function `fib()` that yields Fibonacci numbers indefinitely.',
      '',
      '**Example:**',
      '```',
      'gen = fib()',
      '[next(gen) for _ in range(6)] → [0, 1, 1, 2, 3, 5]',
      '```',
    ].join('\n'),
    starterCode:
      'from typing import Generator\n\ndef fib() -> Generator[int, None, None]:\n    # Your code here\n    pass\n',
    hints: ['Keep track of the previous two values using local variables.'],
    acceptanceRate: 65,
    orderIndex: 3,
    isPublished: true,
    testCases: [
      {
        input: 'gen = fib()\nprint([next(gen) for _ in range(6)])',
        expectedOutput: '[0, 1, 1, 2, 3, 5]',
      },
      { input: 'gen = fib()\nprint(next(gen))', expectedOutput: '0' },
    ],
  },
  {
    id: '004',
    slug: 'flatten-nested-list',
    title: 'Flatten Nested List',
    difficulty: Difficulty.Medium,
    topics: ['recursion', 'list'],
    description: [
      'Write a function `flatten(lst)` that recursively flattens a nested list.',
      '',
      '**Example:**',
      '```',
      'flatten([1, [2, [3, 4]], 5]) → [1, 2, 3, 4, 5]',
      '```',
    ].join('\n'),
    starterCode: 'def flatten(lst: list) -> list:\n    # Your code here\n    pass\n',
    hints: ['Use isinstance(x, list) to check if an element is a sublist.'],
    acceptanceRate: 60,
    orderIndex: 4,
    isPublished: true,
    testCases: [
      {
        input: 'print(flatten([1, [2, [3, 4]], 5]))',
        expectedOutput: '[1, 2, 3, 4, 5]',
      },
      { input: 'print(flatten([]))', expectedOutput: '[]' },
      { input: 'print(flatten([1, 2, 3]))', expectedOutput: '[1, 2, 3]' },
    ],
  },
  {
    id: '005',
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: Difficulty.Hard,
    topics: ['binary-search', 'algorithm'],
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
    starterCode:
      'def binary_search(lst: list[int], target: int) -> int:\n    # Your code here\n    pass\n',
    hints: ['Maintain lo and hi pointers and compare the midpoint each iteration.'],
    acceptanceRate: 48,
    orderIndex: 5,
    isPublished: true,
    testCases: [
      {
        input: 'print(binary_search([1, 3, 5, 7, 9], 5))',
        expectedOutput: '2',
      },
      {
        input: 'print(binary_search([1, 3, 5, 7, 9], 4))',
        expectedOutput: '-1',
      },
      { input: 'print(binary_search([], 1))', expectedOutput: '-1' },
    ],
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
export async function runCode(
  code: string,
  input: string,
  expectedOutput: string,
): Promise<TestResult> {
  const fullCode = `${code}\n${input}`;
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

    const actualOutput = result.run.stdout.trim();
    const expected = expectedOutput.trim();
    const stderr = result.run.stderr.trim();

    return {
      passed: actualOutput === expected && result.run.code === 0,
      input,
      expectedOutput: expected,
      actualOutput,
      ...(stderr ? { error: stderr } : {}),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Submit student code against all test cases of a problem.
 * Runs cases in parallel and aggregates the results.
 */
export async function submitCode(
  code: string,
  testCases: TestCase[],
): Promise<SubmissionResult> {
  const testResults = await Promise.all(
    testCases.map((tc) => runCode(code, tc.input, tc.expectedOutput)),
  );
  const passedCount = testResults.filter((r) => r.passed).length;
  const allPassed = passedCount === testResults.length;

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
