
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
    path: "/simpֻǱ˞