# AI Notes Simplifier

An AI-powered study platform that helps students simplify class notes, generate summaries, create MCQs and flashcards, listen to study podcasts, and organize a study routine.

## Features

- **AI Notes Simplifier:** Turns difficult study notes into clearer explanations.
- **Summary Generator:** Creates revision-friendly summaries.
- **MCQ Generator:** Creates practice questions with answers and explanations.
- **Flashcards:** Builds interactive revision cards.
- **AI Podcast:** Turns study material into a listening script.
- **Study Planner:** Organizes tasks and focus sessions.
- **AI Study Chatbot:** Answers questions about study topics and uploaded PDFs.
- **Student Dashboard:** Tracks learning activity and progress.

## Technology

- React and Vite
- Google Gemini API (server-side)
- Node.js built-in HTTP server
- jsPDF and PDF.js
- Browser Speech APIs
- Local Storage

## Requirements

- Node.js 20.19+ (Node.js 22 LTS recommended)
- npm
- A Google AI Studio Gemini API key

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey).

3. In the project root, make a copy of `.env.example` and name the copy `.env`.

4. Open `.env` and replace the placeholder with your own key:

   ```env
   GEMINI_API_KEY=your_real_key_goes_here
   GEMINI_MODEL=gemini-3.8-flash
   AI_SERVER_PORT=3001
   ```

   **Keep `.env` private.** It is excluded by `.gitignore`. Never put the key in a React component, commit it to Git, or share it in screenshots or chat.

5. Open a terminal in the project folder and start the Gemini backend:

   ```bash
   npm run ai:server
   ```

6. Keep that terminal running. Open a second terminal in the same project folder and start the website:

   ```bash
   npm run dev
   ```

7. Open the local URL printed by Vite (usually `http://localhost:5173`).

Vite forwards `/api` requests to the local Gemini backend at `127.0.0.1:3001`. The existing study pages send their AI prompts through this backend, so the Gemini key is never sent to the browser.

## Check the Gemini connection

With the backend running, open:

```text
http://127.0.0.1:3001/api/health
```

A successful configuration returns JSON with `"ok": true`. This verifies that the key is present locally; the first real AI request verifies the model access and quota.

## Troubleshooting

- **Missing GEMINI_API_KEY:** Check that the file is named exactly `.env` (not `.env.txt`) and that it is in the project root. Restart `npm run ai:server` after changing it.
- **Connection refused on port 3001:** Start `npm run ai:server` and leave its terminal open.
- **Gemini API key or model error:** Check the key and Gemini API access in Google AI Studio. Do not paste the key into an issue or chat.
- **Quota or billing message:** Check the current usage and limits for your Google AI Studio project.

## Production deployment

The local Vite proxy is for development only. For a deployed website, deploy the Node.js Gemini backend separately (or use a serverless backend), configure `GEMINI_API_KEY` as a server-side environment variable in that hosting provider, and point the frontend `/api` requests to that backend. Do not deploy the API key in frontend environment variables.

## Production build

```bash
npm run build
```

The generated website files are saved in `dist`.
