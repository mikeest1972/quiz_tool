import { isMultiSelect, type Question } from './types';

type Props = {
  question: Question;
  selected: string[];
  reviewing: boolean;
  onToggle: (choiceId: string) => void;
};

export default function ChoiceList({ question, selected, reviewing, onToggle }: Props) {
  const multi = isMultiSelect(question);
  return (
    <fieldset className="choices" disabled={reviewing}>
      <legend className="sr-only">{question.question}</legend>
      {question.choices.map((c) => {
        const isSelected = selected.includes(c.id);
        const isCorrect = question.correct.includes(c.id);
        let state = '';
        if (reviewing) {
          if (isCorrect) state = isSelected ? 'right' : 'missed';
          else if (isSelected) state = 'wrong';
        }
        return (
          <label key={c.id} className={`choice ${isSelected ? 'selected' : ''} ${state}`}>
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={question.id}
              checked={isSelected}
              onChange={() => onToggle(c.id)}
            />
            <span>{c.text}</span>
            {state === 'right' && <em className="tag">Correct</em>}
            {state === 'missed' && <em className="tag">Correct answer</em>}
            {state === 'wrong' && <em className="tag">Incorrect</em>}
          </label>
        );
      })}
    </fieldset>
  );
}
