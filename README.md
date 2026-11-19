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
- Groq API with OpenAI-compatible Chat Completions
- OpenAI GPT-OSS 120B served by Groq
- Node.js built-in HTTP server
- jsPDF and PDF.js
- Browser Speech APIs
- Local Storage

## Requirements

- Node.js 20.19+ (Node.js 22 LTS recommended)
- npm
- A Groq API key

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Groq API key in the [Groq Console](https://console.groq.com/keys).

3. In the project root, copy `.env.example` and name the copy `.env`.

4. Open `.env` and add your key:

   ```env
   GROQ_API_KEY=your_real_key_goes_here
   GROQ_MODEL=openai/gpt-oss-120b
   AI_SERVER_PORT=3001
   ```

   **Keep `.env` private.** It is excluded by `.gitignore`. Never put the key in a React component, commit it to Git, or share it in screenshots or chat.

5. Open a terminal in the project folder and start the Groq backend:

   ```bash
   npm run ai:server
   ```

6. Keep that terminal running. Open a second terminal in the same project folder and start the website:

   ```bash
   npm run dev
   ```

7. Open the local URL printed by Vite (usually `http://localhost:5173`).

The Vite development proxy forwards `/api` requests to the local Node backend at `127.0.0.1:3001`. The React study pages call `/api/generate` directly. The Groq key stays on the server and is never sent to the browser.

## Check the Groq connection

With the backend running, open:

```text
http://127.0.0.1:3001/api/health
```

A successful response returns JSON containing `"ok": true`, the provider name and selected model. It checks that the key is valid and that the selected model is available to the account.

## Troubleshooting

- **Missing GROQ_API_KEY:** Check that the file is named exactly `.env` (not `.env.txt`) and that it is in the project root. Restart `npm run ai:server` after editing it.
- **Connection refused on port 3001:** Start `npm run ai:server` and leave its terminal open.
- **401 or invalid API key:** Create/check the key in Groq Console. Do not paste the key into an issue or chat.
- **Model access error:** Confirm that `openai/gpt-oss-120b` is listed as available in your Groq account.
- **429 rate-limit response:** Wait for the reset shown in Groq's response headers or account limits page.

## Production deployment

### GitHub Pages (frontend)

The frontend is configured for GitHub Pages at:

`https://mdzubair4g-art.github.io/Ai-notes-simplifier/`

The `.github/workflows/deploy.yml` workflow builds the Vite app and deploys the `dist` folder whenever changes are pushed to `main`. In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.

GitHub Pages hosts static files only. The site's Groq-powered features call the Node.js API and will not work on GitHub Pages by themselves.

### Backend requirement

The local Vite proxy is for development only. To enable AI generation on the public website, deploy the Node.js backend separately (or use a serverless backend), configure `GROQ_API_KEY` as a server-side environment variable at that backend host, and point the frontend `/api` requests to that backend. Never deploy the API key in frontend environment variables.

## Production build

```bash
npm run build
```

The generated website files are saved in `dist`.


## Connected study workflow

The Simplify, Summary, MCQ, Flashcards and Podcast tools share the current study source in browser local storage. Enter or edit notes in one of these tools, then open another tool to continue with the same material. Clearing the text field also clears the shared source. This handoff is local to the browser profile and does not upload notes on its own.

Use **Ctrl + K** (or **Cmd + K** on macOS) from any page to open Quick Navigation and jump to a study tool.

The homepage product preview is labelled as sample content. It is an illustration, not a live AI generation.
