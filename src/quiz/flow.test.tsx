import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

const bank = {
  title: 'Test Quiz',
  questions: [
    {
      id: 'q1',
      question: 'Pick the fruit',
      choices: [
        { id: 'a', text: 'Apple' },
        { id: 'b', text: 'Brick' },
      ],
      correct: ['a'],
      rationale: 'Apples are fruit.',
    },
    {
      id: 'q2',
      question: 'Pick all vegetables',
      choices: [
        { id: 'a', text: 'Carrot' },
        { id: 'b', text: 'Pea' },
        { id: 'c', text: 'Rock' },
      ],
      correct: ['a', 'b'],
      rationale: 'Carrots and peas are vegetables.',
    },
  ],
};

beforeEach(() => {
  sessionStorage.setItem('quiz_tool_auth', '1');
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => bank })));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const renderApp = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

async function start(user: ReturnType<typeof userEvent.setup>, mode = 'off') {
  await screen.findByText('Test Quiz');
  await user.selectOptions(screen.getByLabelText('Timer'), mode);
  await user.click(screen.getByRole('button', { name: 'Start quiz' }));
}

it('runs a full quiz and shows rationale and results', async () => {
  const user = userEvent.setup();
  renderApp();
  await start(user);

  for (let i = 0; i < 2; i++) {
    const isMulti = !!screen.queryByText('Select all that apply.');
    if (isMulti) {
      await user.click(screen.getByLabelText('Carrot'));
      await user.click(screen.getByLabelText('Pea'));
      await user.click(screen.getByLabelText('Rock')); // wrong: +1 +1 -1 = 1 / 2
    } else {
      await user.click(screen.getByLabelText('Apple'));
    }
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(screen.getByRole('status')).toHaveTextContent(isMulti ? '1 / 2 points' : '1 / 1 point');
    expect(screen.getByRole('status')).toHaveTextContent(isMulti ? 'Carrots and peas' : 'Apples are fruit');
    await user.click(screen.getByRole('button', { name: /Next question|See results/ }));
  }

  expect(await screen.findByText('Results')).toBeInTheDocument();
  expect(screen.getByText(/2 \/ 3 points/)).toBeInTheDocument();
});

it('uses radio for single and checkbox for select-all', async () => {
  const user = userEvent.setup();
  renderApp();
  await start(user);
  const multi = !!screen.queryByText('Select all that apply.');
  const kind = multi ? 'checkbox' : 'radio';
  expect(screen.getAllByRole(kind).length).toBeGreaterThan(1);
});

it('auto-submits with a timeout when the per-question timer expires', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  renderApp();
  await start(user, 'per-question');
  expect(screen.getByRole('timer')).toBeInTheDocument();
  await act(async () => {
    vi.advanceTimersByTime(61_000);
  });
  expect(screen.getByRole('status')).toHaveTextContent('Time’s up');
});
