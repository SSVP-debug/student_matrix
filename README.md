# student_matrix — On-Device Personalized Learning Assistant

A private, offline-first learning assistant that adapts to each student's pace, knowledge level, strengths and weaknesses.
The learner model, question selection, note processing and spaced repetition run **in the browser on the student's device**. The optional Gemini tutor uses a small local server-side proxy; no account is required.

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
| **Privacy** | By default, no network calls to third parties. Data lives in `localStorage`; export / restore / delete in Settings. Optional local model URL is restricted to localhost / private network. Gemini is opt-in and sends tutor questions and relevant material to Google. |
| **Accessibility** | Keyboard-only use (1–4 to answer, Space to flip cards), skip link, ARIA labels/live regions, text size, dyslexia-friendly mode, high contrast, reduced motion, read-aloud via the device's built-in voice. |
| **Low-resource devices** | ~25 KB app code + 175 KB React (gzip ≈ 66 KB) on first load, lazy-loaded pages, PDF engine loaded only when you upload a PDF, Lite mode (auto-enabled on low-memory / data-saver devices) removes blur, shadows and animation. System fonts only. |

## Run it

```bash
cd student_matrix
npm install
npm run dev        # app and local Gemini proxy
npm run build && npm run preview   # production app and local proxy
npm test           # engine sanity checks (adaptivity, SM-2, retrieval, note generation)
```

Open the production build once while online; after that it works with no connection (and can be installed as an app from the browser menu).

### Optional Gemini tutor

In the app, open **Settings**, paste your Gemini API key into **Gemini API key**, and choose **Save key**. The local server saves it to the ignored `.env` file; it is not stored in browser settings or included in the browser bundle. Then enable **Use Gemini for tutor answers**.

Gemini needs an internet connection. When enabled, a question and matching excerpts from course material or your notes are sent to Google's Gemini API. The local server binds to `127.0.0.1`; do not expose it publicly without adding authentication, access controls, and appropriate rate limiting.

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

- The built-in tutor is **retrieval-based**, not a generative LLM: it answers from the stored material and says so when it finds nothing. For open-ended answers, run a small model locally (e.g. Ollama) and enter its address in Settings, or opt in to Gemini as described above.
- Notes → summaries / questions / flashcards use simple on-device language rules; quality is a starting point, so review them.
- Course content is the 9 included missions and 6 flashcard decks; add more by editing the JSON in `public/data/` or by adding notes.
- Progress is per browser. Use Export / Restore to move between devices.
- YouTube-transcript notes were removed because they require an internet connection and a server.

## Changes from the original (cloud) version

Removed Supabase and react-markdown dependencies, Google Fonts and the hosted API call; replaced hard-coded demo stats with real learner data; fixed a TypeScript build error, the broken ESLint setup and an undefined `animate-spin-fast` class; replaced the 1 MB hero image with a 28 KB WebP. Added an optional local Gemini proxy; the app continues to work without an API key.

License: MIT (see LICENSE).
