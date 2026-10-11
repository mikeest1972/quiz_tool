import { scoreQuestion } from './scoring';
import { isMultiSelect, type Answer, type Question, type QuizSettings } from './types';

export type QuizState = {
  status: 'idle' | 'in_progress' | 'finished';
  settings: QuizSettings | null;
  questions: Question[];
  index: number;
  phase: 'answering' | 'reviewing';
  selected: string[];
  answers: Answer[];
  /** Epoch ms when the current question times out (per-question mode, answering phase). */
  questionDeadline: number | null;
  /** Epoch ms when the whole quiz times out (overall mode). */
  overallDeadline: number | null;
};

export type QuizAction =
  | { type: 'start'; questions: Question[]; settings: QuizSettings; now: number }
  | { type: 'toggle'; choiceId: string }
  | { type: 'submit'; timedOut?: boolean }
  | { type: 'next'; now: number }
  | { type: 'finish' }
  | { type: 'reset' };

export const initialState: QuizState = {
  status: 'idle',
  settings: null,
  questions: [],
  index: 0,
  phase: 'answering',
  selected: [],
  answers: [],
  questionDeadline: null,
  overallDeadline: null,
};

const questionDeadline = (s: QuizSettings, now: number) =>
  s.timerMode === 'per-question' ? now + s.seconds * 1000 : null;

function submit(state: QuizState, timedOut: boolean): QuizState {
  if (state.status !== 'in_progress' || state.phase !== 'answering') return state;
  const q = state.questions[state.index];
  const { score, max } = scoreQuestion(q, state.selected);
  const answer: Answer = { questionId: q.id, selected: state.selected, score, max, timedOut };
  return { ...state, phase: 'reviewing', answers: [...state.answers, answer], questionDeadline: null };
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'start':
      return {
        ...initialState,
        status: 'in_progress',
        settings: action.settings,
        questions: action.questions,
        questionDeadline: questionDeadline(action.settings, action.now),
        overallDeadline:
          action.settings.timerMode === 'overall' ? action.now + action.settings.seconds * 1000 : null,
      };
    case 'toggle': {
      if (state.status !== 'in_progress' || state.phase !== 'answering') return state;
      const q = state.questions[state.index];
      if (!isMultiSelect(q)) return { ...state, selected: [action.choiceId] };
      const selected = state.selected.includes(action.choiceId)
        ? state.selected.filter((id) => id !== action.choiceId)
        : [...state.selected, action.choiceId];
      return { ...state, selected };
    }
    case 'submit':
      return submit(state, action.timedOut ?? false);
    case 'next': {
      if (state.status !== 'in_progress' || state.phase !== 'reviewing') return state;
      if (state.index + 1 >= state.questions.length) return { ...state, status: 'finished' };
      return {
        ...state,
        index: state.index + 1,
        phase: 'answering',
        selected: [],
        questionDeadline: questionDeadline(state.settings!, action.now),
      };
    }
    case 'finish': {
      // Overall timeout: grade the in-progress question, mark the rest unanswered (0 points).
      if (state.status !== 'in_progress') return state;
      const graded = submit(state, true);
      const answers = [...graded.answers];
      for (const q of state.questions.slice(answers.length)) {
        answers.push({
          questionId: q.id,
          selected: [],
          score: 0,
          max: new Set(q.correct).size,
          timedOut: true,
        });
      }
      return { ...graded, answers, status: 'finished', questionDeadline: null, overallDeadline: null };
    }
    case 'reset':
      return initialState;
  }
}
