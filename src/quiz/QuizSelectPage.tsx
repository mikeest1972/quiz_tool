import { Link } from 'react-router-dom';
import { QUIZZES } from './catalog';

export default function QuizSelectPage() {
  return (
    <div className="card">
      <h1>Which quiz do you want to take?</h1>
      {QUIZZES.map((q) => (
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
