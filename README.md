
# AI Study Assistant

An AI-powered study platform designed to help students simplify notes, generate summaries, create quizzes and flashcards, and organize their study routine.

## Features

- **AI Notes Simplifier:** Simplifies complex study notes.
- **Summary Generator:** Creates short, medium, and detailed summaries.
- **MCQ Generator:** Generates multiple-choice questions with answers and explanations.
- **Flashcards:** Creates interactive flashcards for revision.
- **AI Podcast:** Generates study content for listening.
- **Study Planner:** Organizes tasks and includes a Pomodoro timer.
- **AI Study Chatbot:** Answers questions about study topics and uploaded PDF documents.
- **Student Dashboard:** Displays study progress and activity.

## Technologies Used

- React
- Vite
- JavaScript
- CSS
- Ollama
- Qwen 3 (0.6B)
- jsPDF
- PDF.js
- Browser Speech APIs
- Local Storage

## Requirements

- Node.js and npm
- Ollama

## Installation and Setup

1. Clone or download this repository.
2. Open the project folder in VS Code.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Download the AI model:

   ```bash
   ollama pull qwen3:0.6b
   ```

5. Start Ollama on your computer.
6. Start the application:

   ```bash
   npm run dev
   ```

7. Open the local URL shown in the terminal.

## Important Note

AI features use Ollama running locally on your computer. Ollama must be running for those features to work.

## Production Build

To create a production build, run:

```bash
npm run build
```

The generated production files are saved in the `dist` folder.

## Author

AI Study Assistant Project
