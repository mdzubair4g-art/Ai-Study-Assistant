# AI Study Assistant

An AI-powered study workspace that helps students turn class material into clear explanations, exam-ready answers, revision notes, practice questions and more.

[**Open the live website →**](https://ai-notes-simplifier-iota.vercel.app/)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

---

## Contents

- [About the project](#about-the-project)
- [Study tools](#study-tools)
- [Highlights](#highlights)
- [Tech stack](#tech-stack)
- [How the AI connection works](#how-the-ai-connection-works)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [Available commands](#available-commands)
- [Deploy to Vercel](#deploy-to-vercel)
- [Project structure](#project-structure)
- [Privacy and security](#privacy-and-security)
- [Troubleshooting](#troubleshooting)

## About the project

AI Study Assistant brings several everyday study activities together in one place. Start with lecture notes or a study topic, make difficult ideas easier to understand, and turn the same material into resources for revision and active recall.

The interface is designed around a simple study flow:

**Understand → Summarize → Practise → Remember → Plan**

The project is built with React and Vite and uses the Groq API for AI-powered generation. It is deployed as a web application on Vercel.

## Study tools

| Tool | What it helps you do |
| --- | --- |
| **AI Notes Simplifier** | Rewrite difficult or dense notes as clearer explanations. |
| **Summary Generator** | Create focused, revision-friendly summaries. |
| **Exam Answer Generator** | Prepare source-based answers for 2, 5 and 10 marks in a selected language. |
| **MCQ Generator** | Generate multiple-choice practice questions with answers and explanations. |
| **Interactive Flashcards** | Turn study material into cards for active recall. |
| **AI Podcast** | Prepare a listening script from study material and play it with browser speech support. |
| **Study Planner** | Organize study tasks and focused sessions. |
| **AI Study Chatbot** | Ask study questions and work with uploaded PDF context. |
| **Student Dashboard** | View your study workspace, tasks and learning activity. |

## Highlights

- **Connected study workflow:** Simplify, Summary, Exam Answer, MCQ, Flashcards and Podcast can reuse the current study source saved in browser local storage.
- **Exam-focused answers:** Choose 2, 5 or 10 marks and generate a structured response from your supplied material. The tool is instructed to flag gaps instead of inventing unsupported details.
- **PDF-aware study chat:** Upload a study PDF in the chatbot and ask questions using its content as context.
- **Multilingual study support:** Generate study content in supported languages, including English, Hindi, Kannada, Tamil and Telugu.
- **Quick Navigation:** Press **Ctrl + K** on Windows/Linux or **Cmd + K** on macOS to find a page or tool.
- **PDF export:** Study outputs can be exported as PDF where the tool provides that option.
- **Responsive interface:** Use the study workspace on desktop, tablet or mobile.
- **Sample preview:** The homepage includes clearly labelled sample study content to demonstrate the experience; it is not a live AI response.

## Tech stack

<p align="left">
  <img src="https://skillicons.dev/icons?i=html,css,js,react,vite,tailwind,nodejs,vercel,github" alt="HTML, CSS, JavaScript, React, Vite, Tailwind CSS, Node.js, Vercel and GitHub logos" />
  <img src="https://cdn.simpleicons.org/groq/F55036" alt="Groq logo" height="48" />
</p>

| Area | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 and Tailwind CSS 4 |
| Programming language | JavaScript (ES modules) |
| Frontend | React 19 |
| Build tool and development server | Vite 8 |
| Routing | React Router |
| AI provider | Groq API |
| Default AI model | `openai/gpt-oss-120b` |
| Local development API | Node.js |
| Production hosting | Vercel |
| Version control | Git and GitHub |
| PDF features | PDF.js and jsPDF |
| Voice playback | Browser Speech APIs |
| Browser-side persistence | Local Storage |

## How the AI connection works

The application sends generation requests to a server-side endpoint. The server calls Groq and returns the generated result to the frontend.

- **Local development:** `ai-server.mjs` runs the local Node.js API on port `3001`. Vite forwards `/api` requests to it.
- **Production:** Vercel runs `api/generate.js` as a serverless function.
- **Secrets:** The Groq API key belongs on the server. It should never be placed in frontend code or exposed through a `VITE_*` variable.

The browser stores the shared study source locally so the supported tools can continue working with the same material in that browser profile.

## Run locally

### 1. Install prerequisites

Install:

- [Node.js 22 LTS](https://nodejs.org/) (Node.js 20.19 or newer is recommended)
- npm
- A [Groq API key](https://console.groq.com/keys)

### 2. Get the code

Clone the repository and open its folder:

```bash
git clone https://github.com/mdzubair4g-art/Ai-Study-Assistant.git
cd Ai-Study-Assistant
```

### 3. Install dependencies

```bash
npm ci
```

### 4. Create your local environment file

Copy `.env.example` to a new file named `.env` in the project root.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Open `.env` and add your Groq API key. See [Environment variables](#environment-variables) below.

### 5. Start the local AI server

In the first terminal:

```bash
npm run ai:server
```

Keep this terminal running. The local API listens on port `3001` by default.

### 6. Start the website

Open a second terminal in the project folder:

```bash
npm run dev
```

Open the local address printed by Vite (usually [http://localhost:5173](http://localhost:5173)).

## Environment variables

The example file contains these settings:

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Yes | Your private API key from Groq Console. |
| `GROQ_MODEL` | No | Model to use. Defaults to `openai/gpt-oss-120b`. |
| `AI_SERVER_PORT` | No | Local development API port. Defaults to `3001`. |

Example `.env`:

```env
GROQ_API_KEY=your_real_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
AI_SERVER_PORT=3001
```

Never commit your real `.env` file. It is excluded through `.gitignore`. Do not share API keys in screenshots, issues, chat messages or frontend source files.

### Check the local AI connection

With the local server running, open:

```text
http://127.0.0.1:3001/api/health
```

A successful response includes `"ok": true` and information about the configured provider and model.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run ai:server` | Start the local Node.js AI API. |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run the ESLint checks. |

## Deploy to Vercel

The repository includes a `vercel.json` configuration for Vercel deployment.

1. Import this GitHub repository into [Vercel](https://vercel.com/).
2. Use the Vite framework preset.
3. Set the install command to `npm ci`.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Open **Project → Settings → Environment Variables**.
7. Add `GROQ_API_KEY` and, optionally, `GROQ_MODEL` for the Production environment. Add them to Preview too if preview deployments should use AI.
8. Redeploy the project.

The production API is handled by `api/generate.js`. You do not need to run `ai-server.mjs` on Vercel.

**Live deployment:** [https://ai-notes-simplifier-iota.vercel.app/](https://ai-notes-simplifier-iota.vercel.app/)

## Project structure

```text
Ai-Study-Assistant/
├── api/
│   └── generate.js          # Vercel serverless AI endpoint
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── FeatureCard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Simplify.jsx
│   │   ├── Summary.jsx
│   │   ├── MCQ.jsx
│   │   ├── Flashcards.jsx
│   │   ├── Podcast.jsx
│   │   ├── Planner.jsx
│   │   ├── Chatbot.jsx
│   │   └── Dashboard.jsx
│   ├── aiProxy.js           # Frontend API request helper
│   ├── studyWorkflow.js     # Shared study-source workflow
│   ├── App.jsx               # Routes and page loading
│   └── main.jsx              # React entry point
├── .env.example
├── ai-server.mjs             # Local development AI server
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## Privacy and security

- Keep API keys in server-side environment variables.
- Do not commit `.env` or paste secrets into public repositories.
- The shared study source used by the study tools is stored in the browser's local storage for that browser profile.
- Uploaded PDF content is used by the chatbot flow as context for requests. Avoid uploading confidential, personal or sensitive documents.
- AI-generated explanations and answers can contain mistakes. Check important facts against your course material or trusted sources.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| AI request says the key is missing | Confirm `.env` exists in the project root and contains `GROQ_API_KEY`. Restart the local AI server after changing it. |
| Connection refused on port 3001 | Run `npm run ai:server` and keep that terminal open. |
| Invalid API key / HTTP 401 | Create or replace the key in [Groq Console](https://console.groq.com/keys). |
| Model access error | Check that the configured model is available to your Groq account. |
| Rate limit / HTTP 429 | Check your Groq account's rate limits and retry after the reset period. |
| A production deployment does not use a new environment variable | Save the variable in the correct Vercel environment and redeploy. |

---

Built to make studying feel clearer, more focused and a little less overwhelming.

**Live app:** [AI Study Assistant](https://ai-notes-simplifier-iota.vercel.app/) · **Source code:** [GitHub repository](https://github.com/mdzubair4g-art/Ai-Study-Assistant)
