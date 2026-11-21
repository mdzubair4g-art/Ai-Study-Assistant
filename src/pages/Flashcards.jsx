
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";
import { readStudySource, saveStudySource } from "../studyWorkflow";

const STORAGE_KEY = "ai-study-flashcards";

function Flashcards() {
  const [now] = useState(() => Date.now());
  const [notes, setNotes] = useState(() => readStudySource());
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [flipped, setFlipped] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [reviewMessage, setReviewMessage] = useState("");

  // Save flashcards automatically
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.warn("Unable to save flashcards in browser storage.", error);
    }
  }, [cards]);

  // Generate flashcards using the Groq AI backend
  const generateFlashcards = async () => {
    if (!notes.trim()) {
      setError("Please enter your study notes first.");
      return;
    }

    setLoading(true);
    setError("");
    setReviewMessage("");
    setCards([]);
    setFlipped({});

    const prompt = `
You are an expert AI study assistant.

Create exactly 8 useful flashcards from the study notes below.

Return ONLY a validֻǱ˞