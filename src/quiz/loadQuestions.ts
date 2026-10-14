import type { QuestionBank } from './types';

/** Validate untrusted JSON into a QuestionBank, throwing a descriptive Error. */
export function validateBank(data: unknown): QuestionBank {
  const fail = (msg: string): never => {
    throw new Error(`Invalid question bank: ${msg}`);
  };
  if (typeof data !== 'object' || data === null) return fail('root must be an object');
  const { title, questions } = data as Record<string, unknown>;
  if (!Array.isArray(questions) || questions.length === 0) {
    return fail('"questions" must be a non-empty array');
  }
  const seen = new Set<string>();
  questions.forEach((raw, i) => {
    const where = `question #${i + 1}`;
    if (typeof raw !== 'object' || raw === null) return fail(`${where} must be an object`);
    const q = raw as Record<string, unknown>;
    if (typeof q.id !== 'string' || !q.id) return fail(`${where} needs a string "id"`);
    if (seen.has(q.id)) return fail(`duplicate question id "${q.id}"`);
    seen.add(q.id);
    if (typeof q.question !== 'string' || !q.question) return fail(`${where} needs "question" text`);
    if (typeof q.rationale !== 'string' || !q.rationale) return fail(`${where} needs "rationale"`);
    if (q.image !== undefined && typeof q.image !== 'string') return fail(`${where} "image" must be a string`);
    const type = q.type ?? 'choice';
    if (type === 'match' || type === 'text') {
      if (!Array.isArray(q.items) || q.items.length === 0) return fail(`${where} needs a non-empty "items" array`);
      const itemIds = new Set<string>();
      for (const it of q.items) {
        if (typeof it?.id !== 'string' || typeof it?.prompt !== 'string') {
          return fail(`${where} has an item without string "id" and "prompt"`);
        }
        if (itemIds.has(it.id)) return fail(`${where} has duplicate item id "${it.id}"`);
        itemIds.add(it.id);
        if (type === 'text' && (!Array.isArray(it.accepted) || it.accepted.length === 0)) {
          return fail(`${where} item "${it.id}" needs a non-empty "accepted" array`);
        }
      }
      if (type === 'match') {
        if (!Array.isArray(q.options) || q.options.length < 2) return fail(`${where} needs at least 2 options`);
        const optIds = new Set<string>();
        for (const o of q.options) {
          if (typeof o?.id !== 'string' || typeof o?.text !== 'string') {
            return fail(`${where} has an option without string "id" and "text"`);
          }
          if (optIds.has(o.id)) return fail(`${where} has duplicate option id "${o.id}"`);
          optIds.add(o.id);
        }
        const answers = (q.answers ?? {}) as Record<string, string>;
        for (const id of itemIds) {
          if (!optIds.has(answers[id])) return fail(`${where} has no valid answer for item "${id}"`);
        }
      }
      return;
    }
    if (type !== 'choice') return fail(`${where} has unknown type "${String(type)}"`);
    if (!Array.isArray(q.choices) || q.choices.length < 2) return fail(`${where} needs at least 2 choices`);
    const ids = new Set<string>();
    for (const c of q.choices) {
      if (typeof c?.id !== 'string' || typeof c?.text !== 'string') {
        return fail(`${where} has a choice without string "id" and "text"`);
      }
      if (ids.has(c.id)) return fail(`${where} has duplicate choice id "${c.id}"`);
      ids.add(c.id);
    }
    if (!Array.isArray(q.correct) || q.correct.length === 0) return fail(`${where} needs a non-empty "correct" array`);
    for (const id of q.correct) {
      if (!ids.has(id)) return fail(`${where} lists correct id "${id}" that is not a choice`);
    }
    if (new Set(q.correct).size !== q.correct.length) return fail(`${where} has duplicate ids in "correct"`);
  });
  return {
    title: typeof title === 'string' && title ? title : 'Quiz',
    questions: questions as QuestionBank['questions'],
  };
}

export async function loadQuestions(
  url: string = `${import.meta.env.BASE_URL}questions.json`,
): Promise<QuestionBank> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load questions (HTTP ${res.status})`);
  return validateBank(await res.json());
}
