export type Choice = { id: string; text: string };

type QuestionBase = {
  id: string;
  question: string;
  rationale: string;
  /** Optional figure shown above the question, path relative to public/. */
  image?: string;
};

/** Multiple choice (one correct) or select all that apply (several correct). */
export type ChoiceQuestion = QuestionBase & {
  type?: 'choice';
  choices: Choice[];
  correct: string[];
};

export type Item = { id: string; prompt: string; image?: string };

/** Each item is matched to one option from a shared pool (options can be reused). Also used for ordering. */
export type MatchQuestion = QuestionBase & {
  type: 'match';
  items: Item[];
  options: Choice[];
  /** item id -> option id */
  answers: Record<string, string>;
};

export type TextItem = Item & {
  /** Accepted answers. For numeric items the first entry is the expected number. */
  accepted: string[];
  numeric?: boolean;
  /** Absolute tolerance for numeric items (default 0). */
  tolerance?: number;
};

/** Fill-in-the-blank or calculation; one point per item. */
export type TextQuestion = QuestionBase & {
  type: 'text';
  items: TextItem[];
  /** Answers can be given in any order (items share one answer pool). */
  unordered?: boolean;
};

export type Question = ChoiceQuestion | MatchQuestion | TextQuestion;

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
  /** item id -> option id (match) or typed text (text). */
  responses: Record<string, string>;
  score: number;
  max: number;
  timedOut: boolean;
};

export const isChoice = (q: Question): q is ChoiceQuestion => q.type === undefined || q.type === 'choice';
export const isMultiSelect = (q: Question) => isChoice(q) && q.correct.length > 1;
