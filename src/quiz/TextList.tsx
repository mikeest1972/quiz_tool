import { Figure } from './Figure';
import { gradeText } from './scoring';
import type { TextQuestion } from './types';

type Props = {
  question: TextQuestion;
  responses: Record<string, string>;
  reviewing: boolean;
  onRespond: (itemId: string, value: string) => void;
};

export default function TextList({ question, responses, reviewing, onRespond }: Props) {
  const graded = reviewing ? gradeText(question, responses) : {};
  return (
    <fieldset className="items" disabled={reviewing}>
      <legend className="sr-only">{question.question}</legend>
      {question.items.map((it) => {
        const right = reviewing && graded[it.id];
        const wrong = reviewing && !graded[it.id];
        return (
          <div key={it.id} className={`item ${right ? 'right' : ''} ${wrong ? 'wrong' : ''}`}>
            {it.image && <Figure src={it.image} alt={`Figure for ${it.prompt}`} />}
            <label htmlFor={`${question.id}-${it.id}`}>{it.prompt}</label>
            <input
              id={`${question.id}-${it.id}`}
              type="text"
              inputMode={it.numeric ? 'decimal' : 'text'}
              autoComplete="off"
              value={responses[it.id] ?? ''}
              onChange={(e) => onRespond(it.id, e.target.value)}
            />
            {right && <em className="tag">Correct</em>}
            {wrong && !question.unordered && <em className="tag">Correct answer: {it.accepted[0]}</em>}
          </div>
        );
      })}
      {reviewing && question.unordered && (
        <p className="muted">Accepted answers: {question.items.map((it) => it.accepted[0]).join(', ')}</p>
      )}
    </fieldset>
  );
}
