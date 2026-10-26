# Student Matrix — Personalized Learning Assistant

Student Matrix (UI branding: LearnAI) is a browser-based learning assistant built for Code Carnival 3.0 problem statement PS-06: personalized learning that remains useful when connectivity is unavailable.

**Live app:** https://student-matrix.vercel.app  
**Repository:** https://github.com/SSVP-debug/student_matrix

## What it does

- **Adaptive practice:** tracks quiz answers, topic progress, streaks, study time, and pace locally to personalize practice.
- **Learning dashboard:** quests, topic learning material, flashcards, achievements, and settings.
- **Local tutor:** searches bundled course material and user-created notes to produce grounded answers without a cloud model.
- **Cloud and local-model options:** optional Gemini and Groq API integrations, or a user-configured local Ollama endpoint.
- **Study-material import:** extracts text from PDFs in the browser, and turns pasted/uploaded content into summaries, questions, and flashcards using extractive, on-device logic.
- **Offline web app:** a service worker precaches the app shell and static assets. After the app has been loaded online and the service worker has installed its cache, cached screens and bundled learning data can work offline.
- **Accessibility and low-resource settings:** text scaling, dyslexia-friendly font mode, high contrast, reduced motion, and a lite-mode preference.

## Important offline and AI distinction

Offline support is not the same as offline generative AI.

- The built-in tutor can retrieve answers from bundled course content and notes stored in the browser without calling a cloud API.
- Gemini and Groq require internet access and a valid API key.
- Ollama can use a model hosted on the user's own device or private network, but the user must install and run Ollama separately and configure its URL and model.
- API requests are deliberately excluded from service-worker caching; cloud answers are not replayed as stale offline responses.
- The service worker is not available until the app has been loaded successfully online at least once. For reliable offline use, open the deployed app online, allow it to finish loading, and then test offline from the same browser/device.
- After a new deployment, open the app online and reload once so the browser can install/update the new service worker and cache the latest hashed JavaScript chunks. If it still shows a blank screen, use Chrome DevTools → Application → Service Workers → **Unregister**, then Application → Storage → **Clear site data**; reload online, wait for the app to finish loading, and only then disconnect Wi-Fi. Clearing site data removes local progress/settings, so export or note anything important first.

## Technology

- React 18, TypeScript, Vite
- React Router
- Tailwind CSS
- Vite PWA / custom service worker
- Browser local storage for profile, settings, progress, and notes
- PDF.js for client-side PDF text extraction
- Gemini API and Groq API (optional cloud providers)
- Ollama-compatible local chat endpoint (optional)

## Run locally

Requirements: Node.js and npm.

```bash
git clone https://github.com/SSVP-debug/student_matrix.git
cd student_matrix
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Build and checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

`npm test` runs the repository's engine check script. Run all checks after changing the adaptive learning, tutor, storage, or service-worker code.

## AI configuration

The Settings screen supports provider selection and API keys. Vite environment variables can also be used for local builds:

```env
VITE_GEMINI_API_KEY=
VITE_GROQ_API_KEY=
```

Create a local `.env.local` file for development and do not commit real keys. Values prefixed with `VITE_` are included in client-side bundles at build time; they are not suitable for secrets that must be kept private. Prefer entering a personal key locally in the app Settings rather than embedding a shared production key.

For local model mode, install Ollama separately, download a compatible model such as `llama3.2:1b`, then set its base URL and model in Settings. Browser-to-local-server connectivity and Ollama CORS configuration may need to be configured for your environment.

## Privacy and limitations

- Progress, settings, and uploaded-note content are stored in browser local storage, so they stay in that browser profile unless exported or cleared.
- Cloud AI providers receive the prompt/context sent in a request when selected. Do not submit sensitive personal or confidential material.
- This is a student project/prototype, not a validated educational assessment system.
- Content coverage depends on the bundled question/flashcard bank and notes supplied by the student.
- Offline behavior depends on a successful initial load and service-worker cache; it should be tested on the target device/browser.
- Cloud AI answers are not available offline. A configured local Ollama server may generate answers without cloud access, but it is not bundled with the website.

## Project structure

```text
src/
  components/   Reusable UI and navigation
  engine/       Adaptive practice, local retrieval tutor, storage, notes, speech
  pages/        Dashboard, Quests, LearnHub, Mentor, Flashcards, Achievements, Settings
  App.tsx       Client-side routes and lazy-loaded pages
public/
  data/         Bundled quest and flashcard data
  sw.js         Offline app-shell and static-asset caching
  manifest.webmanifest
```

## Demo checklist

1. Open the deployed app online and allow the first load to complete.
2. Try a quiz and verify that progress persists after reloading.
3. Upload a text-based PDF or paste a note, then inspect the generated summary/questions/flashcards.
4. Ask the mentor about a topic included in the local course content.
5. Turn off the network and test cached routes and local retrieval.
6. Separately test cloud providers online with your own API key; do not expect Gemini/Groq to work offline.
7. Record the exact browser, device, and features tested before making offline compatibility claims.

## Hackathon context

Built for **Code Carnival 3.0 — PS-06: On-device Personalized Learning Assistant**. Update this section with the final team member names, role split, and verified result/certificate wording before using it as an official submission record.
