import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QuizProvider } from '../quiz/QuizContext';
import { AuthProvider } from './AuthContext';
import LoginPage from './LoginPage';
import RequireAuth from './RequireAuth';
import { sha256Hex } from './hash';
import { PASSWORD_SHA256 } from './credentials';

const renderApp = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <QuizProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<p>secret page</p>} />
            </Route>
          </Routes>
        </QuizProvider>
      </AuthProvider>
    </MemoryRouter>,
  );

beforeEach(() => sessionStorage.clear());

it('password hash constant matches the placeholder password', async () => {
  expect(await sha256Hex('quiz123')).toBe(PASSWORD_SHA256);
});

it('redirects unauthenticated users to login', () => {
  renderApp('/');
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  expect(screen.queryByText('secret page')).not.toBeInTheDocument();
});

it('rejects bad credentials', async () => {
  renderApp('/login');
  await userEvent.type(screen.getByLabelText('Username'), 'quiz');
  await userEvent.type(screen.getByLabelText('Password'), 'wrong');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid');
});

it('accepts good credentials, then logs out', async () => {
  renderApp('/login');
  await userEvent.type(screen.getByLabelText('Username'), 'quiz');
  await userEvent.type(screen.getByLabelText('Password'), 'quiz123');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText('secret page')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Log out' }));
  expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
});
