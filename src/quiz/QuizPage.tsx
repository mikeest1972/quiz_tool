import { Navigate } from 'react-router-dom';
import ChoiceList from './ChoiceList';
import { Figure } from './Figure';
import MatchList from './MatchList';
import TextList from './TextList';
import { useQuiz } from './QuizContext';
import RationalePanel from './RationalePanel';
import TimerBar from './TimerBar';
import { useCountdown } from './useCountdown';
import { isChoice, isMultiSelect } from './types';

export default function QuizPage() {
  const { state, dispatch } = useQuiz();
  const remainingQuestion = useCountdown(state.questionDeadline, () =>
    dispatch({ type: 'submit', timedOut: true }),
  );
  const remainingOverall = useCountdown(state.overallDeadline, () => dispatch({ type: 'finish' }));

  if (state.status === 'idle') return <Navigate to="/" replace />;
  if (state.status === 'finished') return <Navigate to="/results" replace />;

  const { settings, questions, index, phase, selected, responses, answers } = state;
  const question = questions[index];
  const reviewing = phase === 'reviewing';
  const earned = answers.reduce((n, a) => n + a.score, 0);
  const possible = answers.reduce((n, a) => n + a.max, 0);
  const respond = (itemId: string, value: string) => dispatch({ type: 'respond', itemId, value });
  const hasAnswer = isChoice(question)
    ? selected.length > 0
    : Object.values(responses).some((v) => v.trim() !== '');

  return (
    <div className="card">
      <div className="quiz-meta">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>
          Score: {earned} / {possible}
        </span>
      </div>
      {settings?.timerMode === 'per-question' && !reviewing && (
        <TimerBar remainingMs={remainingQuestion} totalSeconds={settings.seconds} label="Time left" />
      )}
      {settings?.timerMode === 'overall' && (
        <TimerBar remainingMs={remainingOverall} totalSeconds={settings.seconds} label="Quiz time left" />
      )}
      <h1 className="question-text">{question.question}</h1>
      {question.image && <Figure src={question.image} alt="Figure for this question" />}
      {isMultiSelect(question) && <p className="hint">Select all that apply.</p>}
      {question.type === 'match' && <p className="hint">Choose an answer for each item.</p>}
      {question.type === 'text' && <p className="hint">Type an answer for each item.</p>}
      {isChoice(question) ? (
        <ChoiceList
          question={question}
          selected={selected}
          reviewing={reviewing}
          onToggle={(choiceId) => dispatch({ type: 'toggle', choiceId })}
        />
      ) : question.type === 'match' ? (
        <MatchList question={question} responses={responses} reviewing={reviewing} onRespond={respond} />
      ) : (
        <TextList question={question} responses={responses} reviewing={reviewing} onRespond={respond} />
      )}
      {reviewing ? (
        <RationalePanel
          question={question}
          answer={answers[answers.length - 1]}
          isLast={index + 1 >= questions.length}
          onNext={() => dispatch({ type: 'next', now: Date.now() })}
        />
      ) : (
        <button
          className="btn btn-primary"
          disabled={!hasAnswer}
          onClick={() => dispatch({ type: 'submit' })}
        >
          Submit answer
        </button>
      )}
    </div>
  );
}
