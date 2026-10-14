import { FLOOR_AT_ZERO } from './config';
import { isChoice, type ChoiceQuestion, type Question, type TextItem, type TextQuestion } from './types';

/**
 * Weighted scoring: a question is worth one point per correct answer.
 * +1 for each correct choice selected, -1 for each incorrect choice selected.
 */
export function scoreQuestion(
  question: ChoiceQuestion,
  selected: readonly string[],
  floorAtZero: boolean = FLOOR_AT_ZERO,
): { score: number; max: number } {
  const correct = new Set(question.correct);
  const unique = new Set(selected);
  let score = 0;
  for (const id of unique) score += correct.has(id) ? 1 : -1;
  return { score: floorAtZero ? Math.max(0, score) : score, max: correct.size };
}

const normalize = (v: string) => v.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,;]+$/, '');

export function textItemCorrect(item: TextItem, response: string): boolean {
  if (item.numeric) {
    const n = parseFloat(response.replace(/,/g, '').match(/-?\d+(\.\d+)?/)?.[0] ?? '');
    const target = parseFloat(item.accepted[0]);
    return !Number.isNaN(n) && Math.abs(n - target) <= (item.tolerance ?? 0) + 1e-9;
  }
  const r = normalize(response);
  return r !== '' && item.accepted.some((a) => normalize(a) === r);
}

/** Per-item correctness for a text question, honoring `unordered`. */
export function gradeText(q: TextQuestion, responses: Record<string, string>): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  if (!q.unordered) {
    for (const it of q.items) result[it.id] = textItemCorrect(it, responses[it.id] ?? '');
    return result;
  }
  const used = new Set<string>();
  for (const it of q.items) {
    const r = responses[it.id] ?? '';
    const hit = q.items.find((other) => !used.has(other.id) && textItemCorrect(other, r));
    if (hit) used.add(hit.id);
    result[it.id] = !!hit;
  }
  return result;
}

export const maxScore = (q: Question): number => (isChoice(q) ? new Set(q.correct).size : q.items.length);

/** One point per correct item for match/text; weighted +1/-1 scoring for choice questions. */
export function gradeQuestion(
  q: Question,
  selected: readonly string[],
  responses: Record<string, string>,
): { score: number; max: number } {
  if (isChoice(q)) return scoreQuestion(q, selected);
  if (q.type === 'match') {
    const score = q.items.filter((it) => responses[it.id] === q.answers[it.id]).length;
    return { score, max: q.items.length };
  }
  const graded = gradeText(q, responses);
  return { score: Object.values(graded).filter(Boolean).length, max: q.items.length };
}
