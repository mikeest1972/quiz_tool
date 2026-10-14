import { gradeText } from './scoring';
import { isChoice, type Answer, type Question } from './types';

/** Human-readable "your answer" / "correct answer" lines for the results review. */
export function describeAnswer(q: Question, a: Answer): { yours: string; correct: string } {
  if (isChoice(q)) {
    const text = (id: string) => q.choices.find((c) => c.id === id)?.text ?? id;
    return {
      yours: a.selected.length ? a.selected.map(text).join(', ') : '',
      correct: q.correct.map(text).join(', '),
    };
  }
  if (q.type === 'match') {
    const opt = (id: string | undefined) => q.options.find((o) => o.id === id)?.text ?? '';
    const line = (pick: (id: string) => string | undefined) =>
      q.items.map((it) => `${it.prompt} → ${opt(pick(it.id)) || '(blank)'}`).join('; ');
    return {
      yours: Object.keys(a.responses).length ? line((id) => a.responses[id]) : '',
      correct: line((id) => q.answers[id]),
    };
  }
  const graded = gradeText(q, a.responses);
  return {
    yours: q.items.some((it) => a.responses[it.id])
      ? q.items.map((it) => `${it.prompt}: ${a.responses[it.id] || '(blank)'}${graded[it.id] ? '' : ' ✗'}`).join('; ')
      : '',
    correct: q.items.map((it) => `${it.prompt}: ${it.accepted[0]}`).join('; '),
  };
}
