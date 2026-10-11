import { FLOOR_AT_ZERO } from './config';
import type { Question } from './types';

/**
 * Weighted scoring: a question is worth one point per correct answer.
 * +1 for each correct choice selected, -1 for each incorrect choice selected.
 */
export function scoreQuestion(
  question: Question,
  selected: readonly string[],
  floorAtZero: boolean = FLOOR_AT_ZERO,
): { score: number; max: number } {
  const correct = new Set(question.correct);
  const unique = new Set(selected);
  let score = 0;
  for (const id of unique) score += correct.has(id) ? 1 : -1;
  return { score: floorAtZero ? Math.max(0, score) : score, max: correct.size };
}
