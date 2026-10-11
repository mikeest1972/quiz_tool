import { Navigate, Outlet } from 'react-router-dom';
import { useQuiz } from '../quiz/QuizContext';
import { useAuth } from './AuthContext';

/** Route guard + app shell (header with logout) for authenticated pages. */
export default function RequireAuth() {
  const { isAuthenticated, logout } = useAuth();
  const { dispatch } = useQuiz();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <>
      <header className="app-header">
        <span className="brand">Quiz Tool</span>
        <button
          className="btn btn-link"
          onClick={() => {
            dispatch({ type: 'reset' });
            logout();
          }}
        >
          Log out
        </button>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
