# quiz_tool

A timed quiz web app (React + Vite + TypeScript) hosted on GitHub Pages.

- Login screen with one hard-coded user (client-side only, a UI gate rather than real security)
- Randomized question and choice order
- Single-answer and "select all that apply" questions
- Rationale shown after each answer
- Configurable timer: per question, whole quiz, or off
- Weighted scoring: a question is worth one point per correct answer; +1 per correct selection, -1 per incorrect one (floored at 0 per question, see `FLOOR_AT_ZERO` in `src/quiz/config.ts`)

Design docs are in `docs/`.

## Run

```
npm install
npm run dev      # dev server
npm test         # unit and component tests
npm run build    # production build in dist/
```

Placeholder login: **quiz / quiz123**. To change it, edit `src/auth/credentials.ts`
(the password is stored as a SHA-256 hash; the file shows how to generate one).

## Editing questions

Edit `public/questions.json`:

```json
{
  "title": "My Quiz",
  "questions": [
    {
      "id": "q1",
      "question": "Which are primary colors?",
      "choices": [{ "id": "a", "text": "Red" }, { "id": "b", "text": "Green" }, { "id": "c", "text": "Blue" }],
      "correct": ["a", "c"],
      "rationale": "Shown after the question is answered."
    }
  ]
}
```

One id in `correct` renders radio buttons; more than one renders checkboxes ("select all that apply").
The file is validated on load and bad data shows an error on the start page.

## Deploy

Pushes to `main` build and deploy via `.github/workflows/deploy.yml`. In the GitHub repo, set
**Settings > Pages > Source** to **GitHub Actions**. If your repo is not named `quiz_tool`, change
`base` in `vite.config.ts`. The site will be at `https://<user>.github.io/quiz_tool/`.
Note that `questions.json`, including the correct answers, is publicly downloadable.
