import { isChoice, type Question } from './types';

export type Rng = () => number;

/** Fisher-Yates; returns a new array. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle question order and each question's choices, then take the first `count`. */
export function prepareQuestions(
  questions: readonly Question[],
  count: number,
  rng: Rng = Math.random,
): Question[] {
  return shuffle(questions, rng)
    .slice(0, count)
    .map((q) => (isChoice(q) ? { ...q, choices: shuffle(q.choices, rng) } : q));
}
