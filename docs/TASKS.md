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
- [ ] 2.1 Define types (`types.ts`)
- [ ] 2.2 `shuffle.ts` with tests
- [ ] 2.3 `scoring.ts` (weighted +1/-1 grading, max = number of correct, `FLOOR_AT_ZERO` flag) with tests
- [ ] 2.4 `loadQuestions.ts`: fetch + schema validation + tests for bad data
- [ ] 2.5 Create sample `public/questions.json` (mix of single and select-all, with rationales)
- [ ] 2.6 `quizReducer.ts` state machine with tests
- [ ] 2.7 `config.ts` defaults + `useTimer.ts` deadline-based countdown hook (modes: per-question, overall, off) with fake-timer tests

## Phase 3: Authentication
- [ ] 3.1 `credentials.ts` (username + SHA-256 password hash)
- [ ] 3.2 `AuthContext` (login/logout, sessionStorage persistence) with tests
- [ ] 3.3 `LoginPage` UI with error state
- [ ] 3.4 `RequireAuth` route guard + logout button

## Phase 4: Quiz UI
- [ ] 4.1 `StartPage` (title, question count, timer mode and seconds, Start button)
- [ ] 4.2 `ChoiceList` (radio vs checkbox, "Select all that apply" label)
- [ ] 4.3 `TimerBar` (countdown display, low-time warning)
- [ ] 4.4 `QuestionView` (submit, lock answer, auto-submit on timeout)
- [ ] 4.5 `RationalePanel` (correct/incorrect marking per choice + rationale + Next)
- [ ] 4.6 `ResultsPage` (points and percentage, per-question breakdown, restart)
- [ ] 4.7 Component tests for the main flow

## Phase 5: Polish
- [ ] 5.1 Responsive styling, accessible markup (labels, focus, keyboard, aria-live for timer)
- [ ] 5.2 Loading and error states (failed/invalid JSON)
- [ ] 5.3 README: how to run, edit questions.json, deploy

## Phase 6: Deployment
- [ ] 6.1 GitHub Actions workflow `.github/workflows/deploy.yml`
- [ ] 6.2 Enable Pages (source: GitHub Actions) in repo settings
- [ ] 6.3 Push to `main`, verify the live site (login, quiz, rationale, timer, refresh on a route)
