export type Choice = { id: string; text: string };

export type Question = {
  id: string;
  question: string;
  choices: Choice[];
  correct: string[];
  rationale: string;
};

export type QuestionBank = { title: string; questions: Question[] };

export type TimerMode = 'per-question' | 'overall' | 'off';

export type QuizSettings = {
  questionCount: number;
  timerMode: TimerMode;
  /** Seconds per question (per-question mode) or for the whole quiz (overall mode). */
  seconds: number;
};

export type Answer = {
  questionId: string;
  selected: string[];
  score: number;
  max: number;
  timedOut: boolean;
};

export const isMultiSelect = (q: Question) => q.correct.length > 1;
