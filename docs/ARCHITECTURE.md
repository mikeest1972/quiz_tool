# Quiz Tool: Architecture

## 1. Goals
- Static React web app hosted on GitHub Pages (no backend).
- Login screen with one hard-coded user.
- Quiz questions loaded from JSON: question, choices, correct answer(s), rationale.
- Questions are randomized; supports single-choice and select-all-that-apply.
- Rationale shown after each answer.
- Configurable timer.

## 2. Tech Stack
| Concern | Choice | Why |
|---|---|---|
| Build | Vite + React + TypeScript | Fast, simple static output, easy GH Pages `base` config |
| Routing | `react-router-dom` with `HashRouter` | GH Pages has no server rewrites; hash routing avoids 404 on refresh |
| State | React Context + `useReducer` | App is small; no external state lib needed |
| Styling | Plain CSS modules | No dependencies, simple |
| Tests | Vitest + React Testing Library | Native Vite integration |
| Deploy | GitHub Actions -> `gh-pages` (Pages artifact) | Automatic on push to `main` |

## 3. Security Caveat (important)
GitHub Pages is static, so **all auth is client-side**. The hard-coded credentials
and the question JSON (including correct answers) ship to the browser and can be
read by anyone who opens dev tools. This is a UI gate, not real security.
Mitigations we will apply: store only a SHA-256 hash of the password in the
bundle (not plaintext), and keep the session in `sessionStorage`. Do not put
sensitive content in the question bank. If real protection is needed later, it
requires a backend or an auth provider.

## 4. Folder Structure
```
quiz_tool/
├── docs/                 ARCHITECTURE.md, TASKS.md
├── public/
│   └── questions.json    question bank (fetched at runtime)
├── src/
│   ├── main.tsx          entry, HashRouter
│   ├── App.tsx           routes
│   ├── auth/
│   │   ├── AuthContext.tsx     login state, login()/logout()
│   │   ├── credentials.ts      hard-coded username + password hash
│   │   ├── LoginPage.tsx
│   │   └── RequireAuth.tsx     route guard
│   ├── quiz/
│   │   ├── types.ts            Question, QuizState, Result types
│   │   ├── loadQuestions.ts    fetch + validate JSON
│   │   ├── shuffle.ts          Fisher-Yates (seedable for tests)
│   │   ├── scoring.ts          pure grading functions
│   │   ├── quizReducer.ts      state machine
│   │   ├── useTimer.ts         countdown hook
│   │   ├── StartPage.tsx       settings + start
│   │   ├── QuestionView.tsx    question + choices + submit
│   │   ├── ChoiceList.tsx      radio or checkbox depending on type
│   │   ├── RationalePanel.tsx  correct/incorrect + rationale
│   │   ├── TimerBar.tsx
│   │   └── ResultsPage.tsx     score + review
│   └── styles/
├── .github/workflows/deploy.yml
├── vite.config.ts        base: '/<repo-name>/'
└── package.json
```

## 5. Data Model

### questions.json
```json
{
  "title": "Sample Quiz",
  "questions": [
    {
      "id": "q1",
      "question": "Which are primary colors?",
      "choices": [
        { "id": "a", "text": "Red" },
        { "id": "b", "text": "Green" },
        { "id": "c", "text": "Blue" }
      ],
      "correct": ["a", "c"],
      "rationale": "Red, blue (and yellow) are traditional primaries..."
    }
  ]
}
```
- **Question type is derived**: `correct.length === 1` means single choice (radio);
  `> 1` means select all that apply (checkbox). The UI states "Select all that apply"
  for the latter. An optional explicit `"type"` field may override this.
- Choices have stable `id`s so shuffling choice order doesn't break grading.
- Validation at load time: unique ids, `correct` ids exist in `choices`,
  non-empty rationale, at least 2 choices. Bad data shows a clear error screen.

### TypeScript types (sketch)
```ts
type Choice = { id: string; text: string };
type Question = { id: string; question: string; choices: Choice[];
                  correct: string[]; rationale: string };
type Answer = { questionId: string; selected: string[]; correct: boolean;
                timedOut: boolean; timeSpentMs: number };
```

## 6. Key Behaviors

### Randomization
- On quiz start, shuffle question order (Fisher-Yates) and also shuffle choices
  within each question. Optional "number of questions" setting takes the first N.

### Grading (weighted, with negative marking)
- Each question is worth **N points, where N = number of correct answers**, so
  multi-answer questions weigh more.
- For a submitted answer: **+1 per correct choice selected, -1 per incorrect choice selected**.
- Question score = `max(0, correctSelected - incorrectSelected)` (floor is a single
  constant `FLOOR_AT_ZERO` in `scoring.ts`; set it to `false` to let questions go negative).
- Single-answer questions are the N=1 case: right = 1, wrong = 0 (or -1 if no floor).
- Timed-out with no selection scores 0. Selections made before timeout are NOT auto-submitted
  unless "submit current selection on timeout" is on (default: on).
- Example: 4 correct answers, you pick 3 right + 1 wrong = 3 - 1 = 2 / 4.
- Quiz total = sum of question scores / sum of question maximums. Results page shows both
  the points and percentage, plus per-question breakdown.

### Timing (configurable)
Configured on the Start screen, defaults stored in `src/quiz/config.ts`:
- **Mode:** `per-question` | `overall` | `off`.
- **Seconds:** per question (default 60) or total for the quiz (default 600).
- **Per-question:** when it hits 0, the current selection is submitted, the question is
  marked timed out, and the rationale is shown.
- **Overall:** when it hits 0, the quiz ends and unanswered questions score 0.
- `useTimer` uses a timestamp deadline (`Date.now()`-based), not tick counting,
  so it stays accurate if the tab is throttled.
- Per-question timer stops once an answer is submitted, while the rationale is displayed.
  The overall timer keeps running during rationale review.

### Quiz state machine (`quizReducer`)
```
idle -> in_progress(question i, phase: answering)
answering --submit/timeout--> reviewing (rationale shown, answer locked)
reviewing --next--> answering (i+1)  |  finished (if last)
finished --restart--> idle
```

### Auth flow
- `/login` is public; `/`, `/quiz`, `/results` are wrapped in `RequireAuth`.
- Login compares username and SHA-256(password) (via `crypto.subtle`) to constants.
- Session flag in `sessionStorage` (cleared when tab closes). Logout button in header.

## 7. Routes (HashRouter)
| Route | Page | Auth |
|---|---|---|
| `#/login` | LoginPage | public |
| `#/` | StartPage | required |
| `#/quiz` | Quiz (QuestionView) | required |
| `#/results` | ResultsPage | required |

## 8. Deployment
- `vite.config.ts` sets `base` to `/<repo-name>/`.
- `questions.json` lives in `public/` and is fetched via
  `import.meta.env.BASE_URL + 'questions.json'`, so updating questions needs no code change.
- GitHub Actions workflow: on push to `main`, `npm ci`, `npm run build`, upload
  `dist/` and deploy with `actions/deploy-pages`.
- Repo setting required: Pages source set to "GitHub Actions".

## 9. Testing Strategy
- Unit: `shuffle`, `scoring`, `loadQuestions` validation, `quizReducer`, password hash check.
- Component: LoginPage (good/bad creds), QuestionView (radio vs checkbox, rationale appears
  after submit), timer expiry using fake timers.
- Manual: full run-through in browser, then verify the deployed Pages URL.

## 10. Decisions
1. Timer: configurable (mode + seconds) on the Start screen.
2. Grading: weighted, +1 per correct selection, -1 per incorrect selection (see section 6).
3. Navigation: forward only, no going back.
4. Repo name: `quiz_tool` (Pages base `/quiz_tool/`). Changeable in `vite.config.ts`.
5. Credentials: placeholder user `quiz` with a placeholder password. The hash lives in
   `credentials.ts` and is easy to change.

## 11. Remaining assumptions to confirm
- Does a question's score floor at 0 (assumed yes) or can it go negative?
- Does the overall-timer mode matter to you, or is per-question enough?
