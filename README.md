# student_matrix — On-Device Personalized Learning Assistant

A private, offline-first learning assistant that adapts to each student's pace, knowledge level, strengths and weaknesses.
Core learning features — the learner model, question selection, retrieval tutor, note processing, spaced repetition and progress — run **in the browser on the student's device**. Offline mode needs no account or API key. Optional online tutor mode uses a small server-side API route for OpenAI or Gemini; cloud keys are never shipped to the browser.

## How it matches the brief

| Requirement | What the app does |
|---|---|
| **Adapts to pace** | Tracks answer time against an expected time per question (EMA). Sets session length (5 / 8 / 12), and rewards fast unaided answers slightly more. |
| **Adapts to knowledge level** | Per-topic *Bayesian Knowledge Tracing* (mastery) + *Elo ability rating*. The next question is picked so the chance of success is about 70%. |
| **Strengths & weaknesses** | Dashboard shows mastery per topic, strongest / needs-work lists, a knowledge map, and mastery that decays with time (forgetting curve). Repeated mistakes are re-served. |
| **Personalized explanations** | Tutor retrieves answers from local material (course cards, question explanations, *your notes*) with BM25 and explains at a Simple / Standard / Deep level, chosen automatically from your mastery. |
| **Practice questions & feedback** | Adaptive practice with instant explanations, 50:50 hint, per-session mastery change and review list. |
| **Study recommendations** | Rule-based recommender: due flashcards, weak topics, repeat errors, challenge topics, new topics. |
| **Works without internet** | Service worker caches the app and data; verified by reloading with the network switched off. |
| **Privacy** | Offline mode makes no third-party AI calls. Progress stays in `localStorage`; export / restore / delete in Settings. Online mode sends the question and relevant course excerpts to the selected provider. API keys stay on the server. |
| **Accessibility** | Keyboard-only use (1–4 to answer, Space to flip cards), skip link, ARIA labels/live regions, text size, dyslexia-friendly mode, high contrast, reduced motion, read-aloud via the device's built-in voice. |
| **Low-resource devices** | ~25 KB app code + 175 KB React (gzip ≈ 66 KB) on first load, lazy-loaded pages, PDF engine loaded only when you upload a PDF, Lite mode (auto-enabled on low-memory / data-saver devices) removes blur, shadows and animation. System fonts only. |

## Run it

```bash
cd student_matrix
npm install
npm run dev        # frontend development server
npm run dev:api    # run this in a second terminal for the optional online tutor
npm run build && npm run preview   # production build (needed to test offline mode)
npm test           # engine sanity checks (adaptivity, SM-2, retrieval, note generation)
```

Open the production build once while online; after that the core app works with no connection (and can be installed as an app from the browser menu). In Tutor, choose **Offline** for local retrieval / optional Ollama, or **Online** for OpenAI or Gemini. If cloud AI is unavailable, the tutor falls back to the offline answer.

### Configure online AI (optional)

For local development, set one provider key in your terminal environment, then run `npm run dev:api` in a second terminal. On PowerShell:

```powershell
$env:GEMINI_API_KEY="your-key"
# or: $env:OPENAI_API_KEY="your-key"
npm run dev:api
```

On macOS/Linux, use `export GEMINI_API_KEY="your-key"` (or `export OPENAI_API_KEY="your-key"`) before starting the API server. Optional model overrides are `GEMINI_MODEL` and `OPENAI_MODEL`. Never commit keys or place them in Vite `VITE_*` variables.

For Vercel, set the project's Root Directory to `student_matrix`, then add `GEMINI_API_KEY` and/or `OPENAI_API_KEY` in **Project Settings → Environment Variables** and redeploy. The serverless endpoints are `/api/tutor` and `/api/health`. Online AI usage may incur provider charges. The app does not require cloud credentials for offline mode.

## Structure

```
student_matrix/
├── public/ (data/quests.json, data/flashcards.json, sw.js, manifest.webmanifest)
├── scripts/engine-check.ts
└── src/
    ├── engine/   store · bank · adaptive (BKT, Elo, pace, SM-2, recommender) · tutor · notes · text (BM25) · speech
    ├── pages/    Dashboard · Quests (adaptive practice) · LearnHub (My Notes) · Mentor (Tutor) · Flashcards · Achievements · Settings · Landing
    └── components/
```

## Honest limits

- The built-in offline tutor is **retrieval-based**, not a generative LLM. For fully local open-ended answers, run a small model with Ollama and enter its localhost/private-network address in Settings. Online mode can use OpenAI or Gemini through the server-side API.
- Notes → summaries / questions / flashcards use simple on-device language rules; quality is a starting point, so review them.
- Course content is the 9 included missions and 6 flashcard decks; add more by editing the JSON in `public/data/` or by adding notes.
- Progress is per browser. Use Export / Restore to move between devices.
- YouTube-transcript notes were removed because they require an internet connection and a server.

## Changes from the original (cloud) version

Removed the old Express/OpenAI backend and Supabase dependencies from the core app; replaced hard-coded demo stats with real learner data; fixed a TypeScript build error, the broken ESLint setup and an undefined `animate-spin-fast` class; replaced the 1 MB hero image with a 28 KB WebP. Optional online AI is implemented as a separate, server-side provider adapter while the app remains offline-first.

License: MIT (see LICENSE).
