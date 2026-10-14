import type { MatchQuestion } from './types';
import { Figure } from './Figure';

type Props = {
  question: MatchQuestion;
  responses: Record<string, string>;
  reviewing: boolean;
  onRespond: (itemId: string, value: string) => void;
};

export default function MatchList({ question, responses, reviewing, onRespond }: Props) {
  const optionText = (id: string) => question.options.find((o) => o.id === id)?.text ?? '';
  return (
    <fieldset className="items" disabled={reviewing}>
      <legend className="sr-only">{question.question}</legend>
      {question.items.map((it) => {
        const value = responses[it.id] ?? '';
        const right = reviewing && value === question.answers[it.id];
        const wrong = reviewing && !right;
        return (
          <div key={it.id} className={`item ${right ? 'right' : ''} ${wrong ? 'wrong' : ''}`}>
            {it.image && <Figure src={it.image} alt={`Figure for ${it.prompt}`} />}
            <label htmlFor={`${question.id}-${it.id}`}>{it.prompt}</label>
            <select id={`${question.id}-${it.id}`} value={value} onChange={(e) => onRespond(it.id, e.target.value)}>
              <option value="">Choose…</option>
              {question.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.text}
                </option>
              ))}
            </select>
            {right && <em className="tag">Correct</em>}
            {wrong && <em className="tag">Correct answer: {optionText(question.answers[it.id])}</em>}
          </div>
        );
      })}
    </fieldset>
  );
}
