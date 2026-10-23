import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QUIZZES, TESTS } from './catalog';

export default function QuizSelectPage() {
  const [testId, setTestId] = useState(TESTS[0].id);
  const quizzes = QUIZZES.filter((q) => q.test === testId);
  return (
    <div className="card">
      <h1>Which quiz do you want to take?</h1>
      <label>
        Test
        <select value={testId} onChange={(e) => setTestId(e.target.value)}>
          {TESTS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </label>
      {quizzes.map((q) => (
        <div key={q.id} className="quiz-option">
          <h2>{q.title}</h2>
          <p className="muted">{q.description}</p>
          <Link className="btn btn-primary" to={`/start/${q.id}`} aria-label={`Take the ${q.title} quiz`}>
            Select
          </Link>
        </div>
      ))}
    </div>
  );
}
