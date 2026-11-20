# AI Study Assistant

An AI-powered study platform that helps students understand class notes, generate summaries, create MCQs and flashcards, listen to study podcasts, and organize a study routine.

## Study tools

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

## Production deployment (Vercel)

This project is configured for Vercel:

- Framework preset: **Vite**
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- API function: `api/generate.js`
- React Router routes are rewritten to `index.html`; `/api/*` remains available for the serverless API.

After importing this repository into Vercel, add these **server-side** environment variables in **Project → Settings → Environment Variables**:

```env
GROQ_API_KEY=your_real_groq_key
GROQ_MODEL=openai/gpt-oss-120b
```

Add them to the Production environment (and Preview too if you want preview deployments to use AI), then redeploy. Never use a `VITE_` prefix for the API key and never put the key in frontend code or commit it to Git.

The `api/generate.js` function calls Groq securely from Vercel. The local `ai-server.mjs` is only for local development; Vercel does not need a long-running local Node server.

## Connected study workflow

The Simplify, Summary, MCQ, Flashcards and Podcast tools share the current study source in browser local storage. Enter or edit notes in one of these tools, then open another tool to continue with the same material. Clearing the text field also clears the shared source. This handoff is local to the browser profile and does not upload notes on its own.

Use **Ctrl + K** (or **Cmd + K** on macOS) from any page to open Quick Navigation and jump to a study tool.

The homepage product preview is labelled as sample content. It is an illustration, not a live AI generation.
