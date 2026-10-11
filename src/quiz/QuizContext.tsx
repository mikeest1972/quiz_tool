import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { initialState, quizReducer, type QuizAction, type QuizState } from './quizReducer';

const QuizContext = createContext<{ state: QuizState; dispatch: Dispatch<QuizAction> } | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  return <QuizContext.Provider value={{ state, dispatch }}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside <QuizProvider>');
  return ctx;
}
