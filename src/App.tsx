import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import RequireAuth from './auth/RequireAuth';
import { QuizProvider } from './quiz/QuizContext';
import QuizSelectPage from './quiz/QuizSelectPage';
import QuizPage from './quiz/QuizPage';
import ResultsPage from './quiz/ResultsPage';
import StartPage from './quiz/StartPage';

export default function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<QuizSelectPage />} />
            <Route path="/start/:quizId" element={<StartPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </QuizProvider>
    </AuthProvider>
  );
}
