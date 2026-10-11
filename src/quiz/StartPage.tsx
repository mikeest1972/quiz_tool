import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_SECONDS, DEFAULT_SETTINGS } from './config';
import { loadQuestions } from './loadQuestions';
import { useQuiz } from './QuizContext';
import { prepareQuestions } from './shuffle';
import type { QuestionBank, TimerMode } from './types';

export default function StartPage() {
  const { dispatch } = useQuiz();
  const navigate = useNavigate();
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(DEFAULT_SETTINGS.questionCount);
  const [mode, setMode] = useState<TimerMode>(DEFAULT_SETTINGS.timerMode);
  const [seconds, setSeconds] = useState(DEFAULT_SETTINGS.seconds);

  useEffect(() => {
    loadQuestions()
      .then((b) => {
        setBank(b);
        setCount((c) => Math.min(c, b.questions.length));
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="card">
        <h1>Couldn't load questions</h1>
        <p role="alert" className="error">
          {error}
        </p>
      </div>
    );
  }
  if (!bank) return <p>Loading questions…</p>;

  const total = bank.questions.length;
  const onModeChange = (m: TimerMode) => {
    setMode(m);
    if (m !== 'off') setSeconds(DEFAULT_SECONDS[m]);
  };
  const valid = count >= 1 && count <= total && (mode === 'off' || seconds >= 5);

  const start = () => {
    dispatch({
      type: 'start',
      questions: prepareQuestions(bank.questions, count),
      settings: { questionCount: count, timerMode: mode, seconds },
      now: Date.now(),
    });
    navigate('/quiz');
  };

  return (
    <div className="card">
      <h1>{bank.title}</h1>
      <p className="muted">
        {total} questions available. Some are multiple choice, some are select all that apply.
      </p>
      <label>
        Number of questions
        <input
          type="number"
          min={1}
          max={total}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </label>
      <label>
        Timer
        <select value={mode} onChange={(e) => onModeChange(e.target.value as TimerMode)}>
          <option value="per-question">Per question</option>
          <option value="overall">Whole quiz</option>
          <option value="off">No timer</option>
        </select>
      </label>
      {mode !== 'off' && (
        <label>
          {mode === 'per-question' ? 'Seconds per question' : 'Seconds for the whole quiz'}
          <input
            type="number"
            min={5}
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
          />
        </label>
      )}
      <p className="muted small">
        Scoring: each question is worth one point per correct answer. You get +1 for each correct
        choice you select and −1 for each incorrect one (a question never scores below 0).
      </p>
      <button className="btn btn-primary" disabled={!valid} onClick={start}>
        Start quiz
      </button>
    </div>
  );
}
