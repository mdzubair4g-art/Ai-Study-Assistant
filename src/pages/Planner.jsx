
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";

const TASK_KEY = "ai-study-assistant-tasks";
const FOCUS_KEY = "ai-study-focus-history";

function readSavedArray(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getDateKey(timestamp) {
  const date = new Date(Number(timestamp));

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentStreak(sessions) {
  const activeDays = new Set(
    sessions.map(getDateKey)
  );

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // A streak remains active through today or until yesterday.
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

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function Planner() {
  const [tasks, setTasks] = useState(() =>
    readSavedArray(TASK_KEY)
  );

  const [focusSessions, setFocusSessions] = useState(() =>
    readSavedArray(FOCUS_KEY)
  );

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("All");

  const [mode, setMode] = useState("Focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");

  const completionHandled = useRef(false);

  // Save tasks
  useEffect(() => {
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Save focus history
  useEffect(() => {
    localStorage.setItem(
      FOCUS_KEY,
      JSON.stringify(focusSessions)
    );
  }, [focusSessions]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Handle a completed session only once
  useEffect(() => {
    if (
      !isRunning ||
      secondsLeft !== 0 ||
      completionHandled.current
    ) {
      return;
    }

    completionHandled.current = true;
    setIsRunning(false);

    if (mode === "Focus") {
      setFocusSessions((previous) => [
        ...previous,
        Date.now(),
      ]);

      setSessionMessage(
        "Focus session completed! Your study streak has been updated. Great work! 🎉"
      );
    } else {
      setSessionMessage(
        "Break completed! Time to get back to studying. 💪"
      );
    }
  }, [isRunning, secondsLeft, mode]);

  const totalSeconds = mode === "Focus" ? 25 * 60 : 5 * 60;

  const timerProgress =
    ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const todayFocusSessions = focusSessions.filter(
    (timestamp) =>
      getDateKey(timestamp) === getDateKey(Date.now())
  ).length;

  const currentStreak = getCurrentStreak(focusSessions);

  const switchMode = (nextMode) => {
    setIsRunning(false);
    completionHandled.current = false;
    setMode(nextMode);
    setSecondsLeft(nextMode === "Focus" ? 25 * 60 : 5 * 60);
    setSessionMessage("");
  };

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    if (secondsLeft === 0) {
      setSecondsLeft(totalSeconds);
      completionHandled.current = false;
      setSessionMessage("");
    }

    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    completionHandled.current = false;
    setSecondsLeft(totalSeconds);
    setSessionMessage("");
  };

  // Add a study task
  const addTask = (event) => {
    event.preventDefault();

    if (!title.trim() || !subject.trim()) return;

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      subject: subject.trim(),
      dueDate,
      completed: false,
    };

    setTasks((previous) => [newTask, ...previous]);

    setTitle("");
    setSubject("");
    setDueDate("");
  };

  // Complete or uncomplete task
  const toggleTask = (id) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks((previous) =>
      previous.filter((task) => task.id !== id)
    );
  };

  // Delete completed tasks
  const clearCompleted = () => {
    setTasks((previous) =>
      previous.filter((task) => !task.completed)
    );
  };

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white tool-page tool-page-planner">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <section className="mb-10">
          <p className="text-blue-400 font-semibold mb-3">
            YOUR PERSONAL LEARNING ORGANIZER
          </p>

          <h1 className="text-4xl font-extrabold mb-4">
            Study Planner 📚
          </h1>

          <p className="text-gray-400 max-w-2xl">
            Organize your studies, manage assignments,
            build daily habits and track your progress.
          </p>
        </section>

        {/* Daily Study Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400 mb-2">Total Study Tasks</p>
            <h2 className="text-3xl font-bold">{tasks.length}</h2>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400 mb-2">Pending Tasks</p>
            <h2 className="text-3xl font-bold text-yellow-400">
              {pendingCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400 mb-2">Focus Sessions Today</p>
            <h2 className="text-3xl font-bold text-blue-400">
              {todayFocusSessions}
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400 mb-2">Current Study Streak</p>
            <h2 className="text-3xl font-bold text-orange-400">
              🔥 {currentStreak} days
            </h2>
          </div>

        </section>

        {/* Focus Timer */}
        <section className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 to-blue-950/40 p-8 mb-10">

          <div className="text-center">

            <p className="text-blue-400 font-semibold tracking-widest text-sm mb-3">
              POMODORO FOCUS TIMER
            </p>

            <h2 className="text-2xl font-bold mb-6">
              Stay Focused. Achieve More.
            </h2>

            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={() => switchMode("Focus")}
                className={`px-5 py-2 rounded-full font-semibold transition ${
                  mode === "Focus"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                Focus · 25 min
              </button>

              <button
                onClick={() => switchMode("Break")}
                className={`px-5 py-2 rounded-full font-semibold transition ${
                  mode === "Break"
                    ? "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                Break · 5 min
              </button>
            </div>

            <div className="text-7xl md:text-8xl font-extrabold tracking-wider tabular-nums mb-6">
              {formatTime(secondsLeft)}
            </div>

            <p className="text-gray-400 mb-6">
              {isRunning
                ? `${mode} session is running...`
                : "Ready when you are!"}
            </p>

            <div className="max-w-md mx-auto h-3 rounded-full bg-gray-800 overflow-hidden mb-8">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${timerProgress}%` }}
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleStartPause}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition"
              >
                {isRunning ? "Pause" : "Start"}
              </button>

              <button
                onClick={resetTimer}
                className="px-8 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 font-bold transition"
              >
                Reset
              </button>
            </div>

            {sessionMessage && (
              <div className="mt-7 rounded-xl bg-green-900/30 border border-green-700 p-4 text-green-300 font-semibold">
                {sessionMessage}
              </div>
            )}

          </div>

        </section>

        {/* Focus Habit Tracking */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="rounded-2xl border border-orange-800/50 bg-orange-950/20 p-6">
            <div className="text-3xl mb-3">🔥</div>
            <p className="text-gray-400 text-sm">Current Study Streak</p>
            <h2 className="text-3xl font-bold text-orange-400 mt-2">
              {currentStreak} days
            </h2>
            <p className="text-xs text-gray-500 mt-3">
              Consecutive days with a completed focus session.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="text-3xl mb-3">⏱️</div>
            <p className="text-gray-400 text-sm">Total Focus Sessions</p>
            <h2 className="text-3xl font-bold text-blue-400 mt-2">
              {focusSessions.length}
            </h2>
            <p className="text-xs text-gray-500 mt-3">
              Completed 25-minute focus sessions.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="text-3xl mb-3">⭐</div>
            <p className="text-gray-400 text-sm">Focus Time Today</p>
            <h2 className="text-3xl font-bold text-green-400 mt-2">
              {todayFocusSessions * 25} min
            </h2>
            <p className="text-xs text-gray-500 mt-3">
              Based on completed focus sessions.
            </p>
          </div>

        </section>

        {/* Task Progress */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 mb-10">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Your Study Task Progress
            </h2>

            <span className="text-blue-400 font-bold">
              {progress}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-gray-400 mt-3">
            {completedCount} out of {tasks.length} tasks completed.
          </p>

        </section>

        {/* Add Task */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 mb-10">

          <h2 className="text-2xl font-bold mb-6">
            Add a New Study Task
          </h2>

          <form
            onSubmit={addTask}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Task Name
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Revise Data Structures"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Example: Computer Science"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Deadline
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 p-3 font-semibold transition"
              >
                + Add Study Task
              </button>
            </div>

          </form>

        </section>

        {/* Task List */}
        <section>

          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">

            <h2 className="text-2xl font-bold">
              Your Tasks
            </h2>

            <div className="flex flex-wrap gap-2">
              {["All", "Pending", "Completed"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filter === item
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center rounded-2xl border border-gray-800 bg-gray-900 p-12">
              <div className="text-5xl mb-4">📖</div>

              <h3 className="text-xl font-bold mb-2">
                No tasks found
              </h3>

              <p className="text-gray-400">
                Add a study task to start organizing your learning.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-wrap justify-between items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5"
                >

                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1 h-5 w-5 accent-blue-500 cursor-pointer"
                    />

                    <div>
                      <h3
                        className={`font-bold text-lg ${
                          task.completed
                            ? "line-through text-gray-500"
                            : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>

                      <p className="text-sm text-gray-400 mt-1">
                        {task.subject}
                      </p>

                      {task.dueDate && (
                        <p className="text-xs text-blue-400 mt-2">
                          Deadline: {task.dueDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-semibold px-3 py-2 rounded-full ${
                        task.completed
                          ? "bg-green-900/40 text-green-400"
                          : "bg-yellow-900/40 text-yellow-400"
                      }`}
                    >
                      {task.completed ? "Completed" : "Pending"}
                    </span>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 font-semibold"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}

          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="mt-6 text-sm text-red-400 hover:text-red-300"
            >
              Clear completed tasks
            </button>
          )}

        </section>

      </main>

      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © 2026 AI Study Assistant. Learn smarter, every day.
      </footer>

    </div>
  );
}

export default Planner;
