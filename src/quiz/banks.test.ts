import originalRaw from '../../public/questions.json?raw';
import studyGuideRaw from '../../public/questions-study-guide.json?raw';
import { validateBank } from './loadQuestions';

const images = Object.keys(import.meta.glob('../../public/images/**/*', { eager: false }));

describe.each([
  ['questions.json', originalRaw],
  ['questions-study-guide.json', studyGuideRaw],
])('bundled bank %s', (_name, raw) => {
  const bank = validateBank(JSON.parse(raw));
  it('passes validation', () => {
    expect(bank.questions.length).toBeGreaterThan(0);
  });
  it('references only images that exist', () => {
    const paths = bank.questions.flatMap((q) => [q.image, ...('items' in q ? q.items.map((i) => i.image) : [])]);
    for (const p of paths.filter((p): p is string => !!p)) expect(images).toContain(`../../public/${p}`);
  });
});
