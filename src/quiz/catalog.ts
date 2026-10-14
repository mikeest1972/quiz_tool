export type QuizEntry = {
  id: string;
  title: string;
  description: string;
  /** File under public/, fetched at runtime. */
  file: string;
};

export const QUIZZES: QuizEntry[] = [
  {
    id: 'test-bank',
    title: 'Test Bank',
    description: 'Med-Surg Cardiovascular: Ch 35, 37, 39, 40, 41 (the original question set).',
    file: 'questions.json',
  },
  {
    id: 'study-guide',
    title: 'Study Guide',
    description:
      'Med-Surg Cardiovascular Study Guide: Ch 35, 37, 39, 40, 41 (multiple choice and select-all questions with rationales).',
    file: 'questions-study-guide.json',
  },
];

export const findQuiz = (id: string | undefined) => QUIZZES.find((q) => q.id === id);
