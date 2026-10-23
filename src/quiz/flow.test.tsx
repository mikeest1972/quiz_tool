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
  await user.click(screen.getByRole('link', { name: /Take the Test Bank quiz/ }));
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

it('offers both quizzes and loads the chosen file', async () => {
  const user = userEvent.setup();
  renderApp();
  expect(screen.getByText('Which quiz do you want to take?')).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Take the Study Guide quiz/ }));
  await screen.findByText('Test Quiz');
  expect(vi.mocked(fetch).mock.calls[0][0]).toContain('questions-study-guide.json');
});

it('switches quizzes with the test dropdown', async () => {
  const user = userEvent.setup();
  renderApp();
  expect(screen.getByLabelText('Test')).toHaveValue('test3');
  expect(screen.getByRole('link', { name: /Take the Study Guide quiz/ })).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Test'), 'test4');
  expect(screen.queryByRole('link', { name: /Take the Study Guide quiz/ })).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Take the Test Bank quiz/ }));
  await screen.findByText('Test Quiz');
  expect(vi.mocked(fetch).mock.calls[0][0]).toContain('questions-test4.json');
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

it('handles match and text questions end to end', async () => {
  const mixed = {
    title: 'Mixed Quiz',
    questions: [
      {
        id: 'm1',
        type: 'match',
        question: 'Match each animal',
        items: [
          { id: 'i1', prompt: 'Cat' },
          { id: 'i2', prompt: 'Cow' },
        ],
        options: [
          { id: 'o1', text: 'Meow' },
          { id: 'o2', text: 'Moo' },
        ],
        answers: { i1: 'o1', i2: 'o2' },
        rationale: 'Cats meow; cows moo.',
      },
      {
        id: 't1',
        type: 'text',
        question: 'Compute',
        items: [{ id: 'i1', prompt: 'Two plus two', accepted: ['4'], numeric: true, tolerance: 0 }],
        rationale: 'Basic math.',
      },
    ],
  };
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => mixed })));
  const user = userEvent.setup();
  renderApp();
  await user.click(screen.getByRole('link', { name: /Take the Test Bank quiz/ }));
  await screen.findByText('Mixed Quiz');
  await user.selectOptions(screen.getByLabelText('Timer'), 'off');
  await user.click(screen.getByRole('button', { name: 'Start quiz' }));

  for (let i = 0; i < 2; i++) {
    if (screen.queryByLabelText('Cat')) {
      await user.selectOptions(screen.getByLabelText('Cat'), 'Meow');
      await user.selectOptions(screen.getByLabelText('Cow'), 'Moo');
    } else {
      await user.type(screen.getByLabelText('Two plus two'), '4');
    }
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
    await user.click(screen.getByRole('button', { name: /Next question|See results/ }));
  }
  expect(await screen.findByText(/3 \/ 3 points/)).toBeInTheDocument();
});
