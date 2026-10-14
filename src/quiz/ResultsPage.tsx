import { Navigate, useNavigate } from 'react-router-dom';
import { describeAnswer } from './answerText';
import { useQuiz } from './QuizContext';

export default function ResultsPage() {
  const { state, dispatch } = useQuiz();
  const navigate = useNavigate();
  if (state.status !== 'finished') return <Navigate to="/" replace />;

  const total = state.answers.reduce((n, a) => n + a.score, 0);
  const max = state.answers.reduce((n, a) => n + a.max, 0);
  const pct = max === 0 ? 0 : Math.round((total / max) * 100);

  return (
    <div className="card">
      <h1>Results</h1>
      <p className="big-score">
        {total} / {max} points <span className="muted">({pct}%)</span>
      </p>
      <ol className="review">
        {state.questions.map((q, i) => {
          const a = state.answers[i];
          const { yours, correct } = describeAnswer(q, a);
          return (
            <li key={q.id} className="review-item">
              <p>
                <strong>{q.question}</strong>
              </p>
              <p>
                Your answer:{' '}
                {yours || <em>none</em>}
                {a.timedOut && <em> (timed out)</em>}
              </p>
              <p>Correct: {correct}</p>
              <p>
                <strong>
                  {a.score} / {a.max}
                </strong>{' '}
                — {q.rationale}
              </p>
            </li>
          );
        })}
      </ol>
      <button
        className="btn btn-primary"
        onClick={() => {
          dispatch({ type: 'reset' });
          navigate('/');
        }}
      >
        Take another quiz
      </button>
    </div>
  );
}
