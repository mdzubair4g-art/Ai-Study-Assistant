
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
  const [now] = useState(() => Date.now());
  const [tasks, setTasks] = useState(() =>
    readSaֻǱ˞