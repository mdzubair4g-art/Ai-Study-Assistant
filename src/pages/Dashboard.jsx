
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const TASK_KEY = "ai-study-assistant-tasks";
const FLASHCARD_KEY = "ai-study-flashcards";
const CHAT_KEY = "ai-study-chat-history";
const FOCUS_KEY = "ai-study-focus-history";

function readArray(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getDashboardData() {
  return {
    tasks: readArray(TASK_KEY),
    cards: readArray(FLASHCARD_KEY),
    messages: readArray(CHAT_KEY),
    focusSessions: readArray(FOCUS_KEY),
  };
}

function getDateKey(timestamp) {
  const date = new Date(Number(timestamp));

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getCurrentStreak(sessions) {
  const activeDays = new Set(sessions.map(getDateKey));

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!activeDays.has(getDateKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (activeDays.has(getDateKey(cursor.getTime()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

const tools = [
  {
    icon: "✨",
    title: "Notes Simplifier",
    description: "Make difficult notes easy to understand.",
    path: "/simplify",
  },
  {
    icon: "📝",
    title: "Summary Generator",
    description: "Create clear summaries for revision.",
    path: "/summary",
  },
  {
    icon: "✍️",
    title: "Exam Answer Generator",
    description: "Prepare source-based answers for 2, 5 and 10 marks.",
    path: "/exam-answer",
  },
  {
    icon: "🎯",
    title: "MCQ Generator",
    description: "Practise questions and check your knowledge.",
    path: "/mcq",
  },
  {
    icon: "🃏",
    title: "Flashcards",
    description: "Review concepts using interactive cards.",
    path: "/flashcards",
  },
  {
    icon: "🎧",
    title: "AI Podcast",
    description: "Turn study material into an audio experience.",
    path: "/podcast",
  },
  {
    icon: "📅",
    title: "Study Planner",
    description: "Organize tasks, focus sessions and deadlines.",
    path: "/planner",
  },
  {
    icon: "🤖",
    title: "AI Chatbot",
    description: "Ask questions and get AI explanations.",
    path: "/chatbot",
  },
];

function Dashboard() {
  const [now] = useState(() => Date.now());
  const [data, setData] = useState(getDashboardData);

  useEffect(() => {
    const refreshData = () => {
      setData(getDashboardData());
    };

    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const refreshDashboard = () => {
    setData(getDashboardData());
  };

  const {
    tasks,
    cards,
    messages,
    focusSessions,
  } = data;

  // Task statistics
  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = tasks.length - completedTasks;

  const taskProgress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  // Flashcard statistics
  const reviewedCards = cards.filter(
    (card) =>
      (card.repetitions || 0) > 0 ||
      Boolean(card.lastReviewedAt)
  ).length;

  const masteredCards = cards.filter(
    (card) => (card.intervalDays || 0) >= 7
  ).length;

  const dueCards = cards.filter(
    (card) => !card.dueAt || Number(card.dueAt) <= now
  );

  const flashcardProgress = cards.length
    ? Math.round((reviewedCards / cards.length) * 100)
    : 0;

  // Chatbot statistics
  const chatQuestions = messages.filter(
    (message) => message.role === "user"
  ).length;

  // Focus statistics
  const currentStreak = getCurrentStreak(focusSessions);

  const todayFocusSessions = focusSessions.filter(
    (timestamp) =>
      getDateKey(timestamp) === getDateKey(now)
  ).length;

  const totalFocusMinutes = focusSessions.length * 25;

  const overallTotal = tasks.length + cards.length;
  const overallCompleted = completedTasks + reviewedCards;

  const overallProgress = overallTotal
    ? Math.round((overallCompleted / overallTotal) * 100)
    : 0;

  // Weekly focus activity
  const weeklyActivity = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      const key = getDateKey(date.getTime());

      const count = focusSessions.filter(
        (timestamp) => getDateKey(timestamp) === key
      ).length;

      return {
        key,
        label: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        count,
      };
    }
  );

  const maxSessions = Math.max(
    1,
    ...weeklyActivity.map((day) => day.count)
  );

  // Upcoming tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTasks = tasks
    .filter((task) => {
      if (task.completed || !task.dueDate) return false;

      const date = new Date(`${task.dueDate}T00:00:00`);

      return !Number.isNaN(date.getTime());
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const recentDueCards = dueCards.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-950 text-white tool-page tool-page-dashboard">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Welcome */}
        <section className="rounded-3xl border border-gray-800 bg-gradient-to-r from-blue-950 via-gray-900 to-purple-950 p-8 md:p-12 mb-10">

          <div className="flex flex-wrap justify-between items-center gap-5">

            <div>
              <p className="text-blue-400 font-semibold mb-3">
                YOUR PERSONAL LEARNING SPACE
              </p>

              <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
                Welcome to Your Dashboard 👋
              </h1>

              <p className="text-gray-300 max-w-2xl leading-7">
                Track your learning progress, build daily study
                habits, manage assignments and explore your AI tools.
              </p>
            </div>

            <button
              onClick={refreshDashboard}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
            >
              ↻ Refresh Dashboard
            </button>

          </div>

          <p className="text-gray-400 text-sm mt-7">
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

        </section>

        {/* Main statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="text-3xl mb-4">📚</div>
            <p className="text-gray-400 text-sm">Total Study Tasks</p>
            <h2 className="text-4xl font-extrabold mt-2">
              {tasks.length}
            </h2>
            <p className="text-gray-500 text-xs mt-3">
              {completedTasks} completed
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="text-3xl mb-4">⏳</div>
            <p className="text-gray-400 text-sm">Pending Tasks</p>
            <h2 className="text-4xl font-extrabold text-yellow-400 mt-2">
              {pendingTasks}
            </h2>
            <p className="text-gray-500 text-xs mt-3">
              Tasks waiting to be completed
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="text-3xl mb-4">🃏</div>
            <p className="text-gray-400 text-sm">Flashcards Reviewed</p>
            <h2 className="text-4xl font-extrabold text-blue-400 mt-2">
              {reviewedCards}/{cards.length}
            </h2>
            <p className="text-gray-500 text-xs mt-3">
              {masteredCards} mastered
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="text-3xl mb-4">⏱️</div>
            <p className="text-gray-400 text-sm">Total Focus Sessions</p>
            <h2 className="text-4xl font-extrabold text-cyan-400 mt-2">
              {focusSessions.length}
            </h2>
            <p className="text-gray-500 text-xs mt-3">
              {totalFocusMinutes} completed focus minutes
            </p>
          </div>

          <div className="rounded-2xl border border-orange-800/50 bg-orange-950/20 p-6">
            <div className="text-3xl mb-4">🔥</div>
            <p className="text-gray-400 text-sm">Current Study Streak</p>
            <h2 className="text-4xl font-extrabold text-orange-400 mt-2">
              {currentStreak} days
            </h2>
            <p className="text-gray-500 text-xs mt-3">
              Consecutive days with completed focus sessions
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="text-3xl mb-4">💬</div>
            <p className="text-gray-400 text-sm">Chatbot Questions</p>
            <h2 className="text-4xl font-extrabold text-purple-400 mt-2">
              {chatQuestions}
            </h2>
            <p className="text-gray-500 text-xs mt-3">
              Questions in saved chat history
            </p>
          </div>

        </section>

        {/* Focus Activity */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8 mb-10">

          <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
            <div>
              <p className="text-blue-400 text-sm font-semibold mb-2">
                BUILD YOUR STUDY HABIT
              </p>

              <h2 className="text-2xl font-bold">
                Weekly Focus Activity
              </h2>

              <p className="text-gray-400 text-sm mt-2">
                Completed 25-minute focus sessions over the last seven days.
              </p>
            </div>

            <Link
              to="/planner"
              className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-semibold transition"
            >
              Start Focusing →
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-3 h-44 items-end">

            {weeklyActivity.map((day) => (
              <div
                key={day.key}
                className="h-full flex flex-col items-center justify-end gap-2"
              >
                <span className="text-xs text-gray-400">
                  {day.count}
                </span>

                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    className="w-full max-w-12 rounded-t-lg bg-blue-500 transition-all"
                    style={{
                      height: `${
                        day.count
                          ? Math.max(
                              12,
                              (day.count / maxSessions) * 100
                            )
                          : 4
                      }%`,
                    }}
                  />
                </div>

                <span className="text-xs text-gray-400">
                  {day.label}
                </span>
              </div>
            ))}

          </div>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">
                Focus Sessions Today
              </p>

              <h3 className="text-2xl font-bold text-blue-400 mt-2">
                {todayFocusSessions}
              </h3>
            </div>

            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">
                Focus Time Today
              </p>

              <h3 className="text-2xl font-bold text-green-400 mt-2">
                {todayFocusSessions * 25} minutes
              </h3>
            </div>

          </div>

        </section>

        {/* Overall Progress */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8 mb-10">

          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">

            <div>
              <h2 className="text-2xl font-bold">
                Your Learning Progress
              </h2>

              <p className="text-gray-400 text-sm mt-2">
                Based on completed tasks and reviewed flashcards.
              </p>
            </div>

            <span className="text-3xl font-extrabold text-blue-400">
              {overallProgress}%
            </span>

          </div>

          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <p className="text-gray-400 text-sm mt-4">
            {overallCompleted} of {overallTotal} tracked learning
            items completed or reviewed.
          </p>

          {overallTotal === 0 && (
            <p className="text-yellow-400 text-sm mt-3">
              Start adding study tasks or generating flashcards
              to see your progress here.
            </p>
          )}

        </section>

        {/* Individual Progress */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">
                📅 Study Tasks
              </h2>

              <span className="text-blue-400 font-bold">
                {taskProgress}%
              </span>
            </div>

            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${taskProgress}%` }}
              />
            </div>

            <p className="text-gray-400 text-sm mt-4">
              {completedTasks} completed out of {tasks.length} tasks.
            </p>

            <Link
              to="/planner"
              className="inline-block mt-6 text-blue-400 font-semibold hover:text-blue-300"
            >
              Open Study Planner →
            </Link>

          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">
                🃏 Flashcard Progress
              </h2>

              <span className="text-purple-400 font-bold">
                {flashcardProgress}%
              </span>
            </div>

            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${flashcardProgress}%` }}
              />
            </div>

            <p className="text-gray-400 text-sm mt-4">
              {reviewedCards} reviewed out of {cards.length} flashcards.
            </p>

            <Link
              to="/flashcards"
              className="inline-block mt-6 text-purple-400 font-semibold hover:text-purple-300"
            >
              Review Flashcards →
            </Link>

          </div>

        </section>

        {/* Upcoming Deadlines and Due Flashcards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                📌 Upcoming Deadlines
              </h2>

              <Link
                to="/planner"
                className="text-blue-400 text-sm font-semibold"
              >
                View All →
              </Link>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎉</div>

                <p className="font-semibold">
                  No upcoming deadlines
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  Add tasks with deadlines in your Study Planner.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {upcomingTasks.map((task) => {
                  const deadline = new Date(
                    `${task.dueDate}T00:00:00`
                  );

                  const isOverdue = deadline < today;

                  return (
                    <div
                      key={task.id}
                      className="flex justify-between items-center gap-3 border-b border-gray-800 pb-4 last:border-0"
                    >

                      <div>
                        <p className="font-semibold">
                          {task.title}
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                          {task.subject}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 text-xs px-3 py-2 rounded-full ${
                          isOverdue
                            ? "bg-red-900/40 text-red-400"
                            : "bg-blue-900/40 text-blue-400"
                        }`}
                      >
                        {isOverdue
                          ? "Overdue"
                          : deadline.toLocaleDateString("en-IN")}
                      </span>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                🔄 Flashcards Due for Review
              </h2>

              <Link
                to="/flashcards"
                className="text-purple-400 text-sm font-semibold"
              >
                Review →
              </Link>
            </div>

            {recentDueCards.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📖</div>

                <p className="font-semibold">
                  No cards due right now
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  Generate flashcards or continue your revision.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {recentDueCards.map((card) => (
                  <div
                    key={card.id}
                    className="border-b border-gray-800 pb-4 last:border-0"
                  >
                    <p className="font-semibold leading-6">
                      {card.question}
                    </p>

                    <p className="text-xs text-yellow-400 mt-2">
                      Ready for revision
                    </p>
                  </div>
                ))}

              </div>
            )}

            <p className="text-gray-500 text-xs mt-4">
              {dueCards.length} cards currently due for review.
            </p>

          </div>

        </section>

        {/* Learning Tools */}
        <section>

          <div className="text-center mb-8">
            <p className="text-blue-400 text-sm font-semibold mb-2">
              YOUR LEARNING TOOLKIT
            </p>

            <h2 className="text-3xl font-bold mb-3">
              Explore Your AI Tools
            </h2>

            <p className="text-gray-400">
              Choose a tool and continue learning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {tools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 hover:border-blue-500 hover:bg-gray-800 transition duration-300"
              >

                <div className="text-4xl mb-4">
                  {tool.icon}
                </div>

                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-400 transition">
                  {tool.title}
                </h3>

                <p className="text-gray-400 text-sm leading-6">
                  {tool.description}
                </p>

                <p className="text-blue-400 font-semibold text-sm mt-5">
                  Open Tool →
                </p>

              </Link>
            ))}

          </div>

        </section>

      </main>

      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © 2026 AI Study Assistant. Learn smarter, every day.
      </footer>

    </div>
  );
}

export default Dashboard;
