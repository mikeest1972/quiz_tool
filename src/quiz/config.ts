import type { QuizSettings } from './types';

export const DEFAULT_SETTINGS: QuizSettings = {
  questionCount: 10,
  timerMode: 'per-question',
  seconds: 60,
};

export const DEFAULT_SECONDS: Record<'per-question' | 'overall', number> = {
  'per-question': 60,
  overall: 600,
};

/** A question's score can't go below zero when true. */
export const FLOOR_AT_ZERO = true;
