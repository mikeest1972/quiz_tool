import type { Answer, Question } from './types';

type Props = { question: Question; answer: Answer; isLast: boolean; onNext: () => void };

export default function RationalePanel({ question, answer, isLast, onNext }: Props) {
  const full = answer.score === answer.max;
  return (
    <div className={`rationale ${full ? 'rationale-good' : 'rationale-bad'}`} role="status">
      <h2>
        {answer.timedOut && 'Time’s up. '}
        {full ? 'Correct!' : answer.score > 0 ? 'Partially correct' : 'Incorrect'}
      </h2>
      <p>
        <strong>
          {answer.score} / {answer.max} {answer.max === 1 ? 'point' : 'points'}
        </strong>
      </p>
      <p>{question.rationale}</p>
      <button className="btn btn-primary" onClick={onNext} autoFocus>
        {isLast ? 'See results' : 'Next question'}
      </button>
    </div>
  );
}
