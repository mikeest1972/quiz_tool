export type TestEntry = { id: string; title: string };

export const TESTS: TestEntry[] = [
  { id: 'test3', title: 'Test 3' },
  { id: 'test4', title: 'Test 4' },
  { id: 'test5', title: 'Test 5' },
];

export type QuizEntry = {
  id: string;
  /** Which test (TESTS id) this quiz belongs to. */
  test: string;
  title: string;
  description: string;
  /** File under public/, fetched at runtime. */
  file: string;
};

export const QUIZZES: QuizEntry[] = [
  {
    id: 'test-bank',
    test: 'test3',
    title: 'Test Bank',
    description: 'Med-Surg Cardiovascular: Ch 35, 37, 39, 40, 41 (the original question set).',
    file: 'questions.json',
  },
  {
    id: 'study-guide',
    test: 'test3',
    title: 'Study Guide',
    description:
      'Med-Surg Cardiovascular Study Guide: Ch 35, 37, 39, 40, 41 (multiple choice and select-all questions with rationales).',
    file: 'questions-study-guide.json',
  },
  {
    id: 'test4-bank',
    test: 'test4',
    title: 'Test Bank',
    description: 'Med-Surg: Ch 26 (Burns), Ch 42 (Shock, Sepsis, and MODS), Ch 51 (AKI and CKD).',
    file: 'questions-test4.json',
  },
  {
    id: 'test5-bank',
    test: 'test5',
    title: 'Test Bank',
    description: 'Med-Surg: Ch 61 (Acute Intracranial Problems), Ch 62 (Stroke), Ch 65 (Spinal Cord and Peripheral Nerve Problems).',
    file: 'questions-test5.json',
  },
];

export const findQuiz = (id: string | undefined) => QUIZZES.find((q) => q.id === id);
