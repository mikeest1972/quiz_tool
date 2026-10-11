# Quiz Tool: Task List

See `ARCHITECTURE.md` for design. Check items off as completed. Each phase ends in a working, committable state.

## Phase 0: Decisions
- [x] Decisions recorded in ARCHITECTURE.md section 10 (timer configurable, weighted +1/-1 grading, forward only, repo `quiz_tool`, placeholder credentials)

## Phase 1: Project scaffolding
- [x] 1.1 Scaffold Vite + React + TypeScript project in repo root
- [x] 1.2 Add `react-router-dom`, Vitest, React Testing Library, jsdom
- [x] 1.3 Configure `vite.config.ts` (`base` for GH Pages) and test setup
- [x] 1.4 Add `.gitignore`, npm scripts (`dev`, `build`, `test`, `lint`)
- [x] 1.5 Set up `HashRouter` + route skeleton with placeholder pages

## Phase 2: Quiz domain logic (pure, test-first)
- [x] 2.1 Define types (`types.ts`)
- [x] 2.2 `shuffle.ts` with tests
- [x] 2.3 `scoring.ts` (weighted +1/-1 grading, max = number of correct, `FLOOR_AT_ZERO` flag) with tests
- [x] 2.4 `loadQuestions.ts`: fetch + schema validation + tests for bad data
- [x] 2.5 Create sample `public/questions.json` (mix of single and select-all, with rationales)
- [x] 2.6 `quizReducer.ts` state machine with tests
- [x] 2.7 `config.ts` defaults + `useTimer.ts` deadline-based countdown hook (modes: per-question, overall, off) with fake-timer tests

## Phase 3: Authentication
- [x] 3.1 `credentials.ts` (username + SHA-256 password hash)
- [x] 3.2 `AuthContext` (login/logout, sessionStorage persistence) with tests
- [x] 3.3 `LoginPage` UI with error state
- [x] 3.4 `RequireAuth` route guard + logout button

## Phase 4: Quiz UI
- [x] 4.1 `StartPage` (title, question count, timer mode and seconds, Start button)
- [x] 4.2 `ChoiceList` (radio vs checkbox, "Select all that apply" label)
- [x] 4.3 `TimerBar` (countdown display, low-time warning)
- [x] 4.4 `QuestionView` (submit, lock answer, auto-submit on timeout)
- [x] 4.5 `RationalePanel` (correct/incorrect marking per choice + rationale + Next)
- [x] 4.6 `ResultsPage` (points and percentage, per-question breakdown, restart)
- [x] 4.7 Component tests for the main flow

## Phase 5: Polish
- [x] 5.1 Responsive styling, accessible markup (labels, focus, keyboard, aria-live for timer)
- [x] 5.2 Loading and error states (failed/invalid JSON)
- [x] 5.3 README: how to run, edit questions.json, deploy

## Phase 6: Deployment
- [x] 6.1 GitHub Actions workflow `.github/workflows/deploy.yml`
- [ ] 6.2 Enable Pages (source: GitHub Actions) in repo settings
- [ ] 6.3 Push to `main`, verify the live site (login, quiz, rationale, timer, refresh on a route)
