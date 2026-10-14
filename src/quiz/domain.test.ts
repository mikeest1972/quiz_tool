import { prepareQuestions, shuffle } from './shuffle';
import { gradeQuestion, scoreQuestion } from './scoring';
import { validateBank } from './loadQuestions';
import { initialState, quizReducer, type QuizState } from './quizReducer';
import type { ChoiceQuestion as Question, MatchQuestion, QuizSettings, TextQuestion } from './types';

const q = (id: string, correct: string[], n = 4): Question => ({
  id,
  question: `Question ${id}`,
  choices: ['a', 'b', 'c', 'd', 'e'].slice(0, n).map((c) => ({ id: c, text: c })),
  correct,
  rationale: 'because',
});

describe('shuffle', () => {
  it('keeps all items and does not mutate input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
  it('is deterministic with a seeded rng', () => {
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
  });
  it('prepareQuestions limits count and keeps choice ids', () => {
    const qs = [q('1', ['a']), q('2', ['b']), q('3', ['c'])];
    const out = prepareQuestions(qs, 2);
    expect(out).toHaveLength(2);
    expect((out[0] as Question).choices.map((c) => c.id).sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('scoreQuestion', () => {
  const multi = q('m', ['a', 'b', 'c', 'd'], 5);
  it('single answer: right = 1, wrong = 0', () => {
    expect(scoreQuestion(q('s', ['a']), ['a'])).toEqual({ score: 1, max: 1 });
    expect(scoreQuestion(q('s', ['a']), ['b'])).toEqual({ score: 0, max: 1 });
  });
  it('+1 per correct, -1 per incorrect', () => {
    expect(scoreQuestion(multi, ['a', 'b', 'c', 'e'])).toEqual({ score: 2, max: 4 });
    expect(scoreQuestion(multi, ['a', 'b', 'c', 'd'])).toEqual({ score: 4, max: 4 });
  });
  it('floors at zero by default, can go negative otherwise', () => {
    expect(scoreQuestion(multi, ['e'])).toEqual({ score: 0, max: 4 });
    expect(scoreQuestion(multi, ['e'], false)).toEqual({ score: -1, max: 4 });
  });
  it('no selection scores 0', () => {
    expect(scoreQuestion(multi, [])).toEqual({ score: 0, max: 4 });
  });
});

describe('validateBank', () => {
  const good = { title: 'T', questions: [q('1', ['a'])] };
  it('accepts a valid bank', () => {
    expect(validateBank(good).questions).toHaveLength(1);
  });
  it.each([
    ['non-object', 5],
    ['empty questions', { questions: [] }],
    ['duplicate ids', { questions: [q('1', ['a']), q('1', ['a'])] }],
    ['unknown correct id', { questions: [q('1', ['z'])] }],
    ['too few choices', { questions: [{ ...q('1', ['a']), choices: [{ id: 'a', text: 'a' }] }] }],
    ['missing rationale', { questions: [{ ...q('1', ['a']), rationale: '' }] }],
    ['empty correct', { questions: [q('1', [])] }],
  ])('rejects %s', (_name, data) => {
    expect(() => validateBank(data)).toThrow(/Invalid question bank/);
  });
});

describe('quizReducer', () => {
  const settings = (over: Partial<QuizSettings> = {}): QuizSettings => ({
    questionCount: 2,
    timerMode: 'per-question',
    seconds: 30,
    ...over,
  });
  const questions = [q('1', ['a']), q('2', ['a', 'b'])];
  const started = (over?: Partial<QuizSettings>): QuizState =>
    quizReducer(initialState, { type: 'start', questions, settings: settings(over), now: 1000 });

  it('start sets per-question deadline', () => {
    const s = started();
    expect(s.status).toBe('in_progress');
    expect(s.questionDeadline).toBe(31000);
    expect(s.overallDeadline).toBeNull();
  });
  it('single choice toggle replaces, multi toggles', () => {
    let s = started();
    s = quizReducer(s, { type: 'toggle', choiceId: 'a' });
    s = quizReducer(s, { type: 'toggle', choiceId: 'b' });
    expect(s.selected).toEqual(['b']);
    s = quizReducer(quizReducer(s, { type: 'submit' }), { type: 'next', now: 2000 });
    s = quizReducer(s, { type: 'toggle', choiceId: 'a' });
    s = quizReducer(s, { type: 'toggle', choiceId: 'b' });
    s = quizReducer(s, { type: 'toggle', choiceId: 'a' });
    expect(s.selected).toEqual(['b']);
  });
  it('submit scores, locks, and ignores a second submit', () => {
    let s = quizReducer(started(), { type: 'toggle', choiceId: 'a' });
    s = quizReducer(s, { type: 'submit' });
    expect(s.phase).toBe('reviewing');
    expect(s.answers[0]).toMatchObject({ score: 1, max: 1, timedOut: false });
    expect(quizReducer(s, { type: 'submit' }).answers).toHaveLength(1);
    expect(quizReducer(s, { type: 'toggle', choiceId: 'b' }).selected).toEqual(['a']);
  });
  it('next advances with a fresh deadline and finishes after the last question', () => {
    let s = quizReducer(started(), { type: 'submit', timedOut: true });
    expect(s.answers[0].timedOut).toBe(true);
    s = quizReducer(s, { type: 'next', now: 5000 });
    expect(s).toMatchObject({ index: 1, phase: 'answering', selected: [], questionDeadline: 35000 });
    s = quizReducer(quizReducer(s, { type: 'submit' }), { type: 'next', now: 6000 });
    expect(s.status).toBe('finished');
  });
  it('overall timeout finishes and fills unanswered with 0', () => {
    let s = started({ timerMode: 'overall', seconds: 100 });
    expect(s.overallDeadline).toBe(101000);
    expect(s.questionDeadline).toBeNull();
    s = quizReducer(s, { type: 'finish' });
    expect(s.status).toBe('finished');
    expect(s.answers).toHaveLength(2);
    expect(s.answers[1]).toMatchObject({ score: 0, max: 2, selected: [] });
  });
  it('reset returns to idle', () => {
    expect(quizReducer(started(), { type: 'reset' })).toEqual(initialState);
  });
});

describe('match and text questions', () => {
  const match: MatchQuestion = {
    id: 'm',
    question: 'Order the steps',
    type: 'match',
    items: [
      { id: 'x', prompt: 'First' },
      { id: 'y', prompt: 'Second' },
    ],
    options: [
      { id: '1', text: '1' },
      { id: '2', text: '2' },
    ],
    answers: { x: '1', y: '2' },
    rationale: 'because',
  };
  const text: TextQuestion = {
    id: 't',
    question: 'Fill in',
    type: 'text',
    items: [
      { id: 'a', prompt: 'HR', accepted: ['80'], numeric: true, tolerance: 1 },
      { id: 'b', prompt: 'Valve', accepted: ['Mitral', 'bicuspid'] },
    ],
    rationale: 'because',
  };
  it('match: one point per correct item, no negatives', () => {
    expect(gradeQuestion(match, [], { x: '1', y: '1' })).toEqual({ score: 1, max: 2 });
    expect(gradeQuestion(match, [], {})).toEqual({ score: 0, max: 2 });
    expect(gradeQuestion(match, [], { x: '1', y: '2' })).toEqual({ score: 2, max: 2 });
  });
  it('text: numeric tolerance and case-insensitive text', () => {
    expect(gradeQuestion(text, [], { a: '79.5 bpm', b: ' MITRAL. ' })).toEqual({ score: 2, max: 2 });
    expect(gradeQuestion(text, [], { a: '90', b: 'aortic' })).toEqual({ score: 0, max: 2 });
  });
  it('text unordered: each accepted answer counts once', () => {
    const u: TextQuestion = {
      ...text,
      unordered: true,
      items: [
        { id: 'a', prompt: '1', accepted: ['pain'] },
        { id: 'b', prompt: '2', accepted: ['pallor'] },
      ],
    };
    expect(gradeQuestion(u, [], { a: 'pallor', b: 'pain' })).toEqual({ score: 2, max: 2 });
    expect(gradeQuestion(u, [], { a: 'pain', b: 'pain' })).toEqual({ score: 1, max: 2 });
  });
  it('validateBank accepts them and rejects a bad match answer', () => {
    expect(validateBank({ questions: [match, text] }).questions).toHaveLength(2);
    expect(() => validateBank({ questions: [{ ...match, answers: { x: '1', y: 'zzz' } }] })).toThrow(/Invalid/);
    expect(() => validateBank({ questions: [{ ...text, items: [{ id: 'a', prompt: 'p', accepted: [] }] }] })).toThrow(/Invalid/);
  });
  it('reducer records responses and grades them', () => {
    let s = quizReducer(initialState, {
      type: 'start',
      questions: [match],
      settings: { questionCount: 1, timerMode: 'off', seconds: 0 },
      now: 0,
    });
    s = quizReducer(s, { type: 'respond', itemId: 'x', value: '1' });
    s = quizReducer(s, { type: 'submit' });
    expect(s.answers[0]).toMatchObject({ score: 1, max: 2, responses: { x: '1' } });
  });
});
