
import { useState } from "react";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";
import { readStudySource, saveStudySource } from "../studyWorkflow";

const LANGUAGES = [
  "English",
  "Hindi",
  "Kannada",
  "Tamil",
  "Telugu",
];

function MCQ() {
  const [notes, setNotes] = useState(() => readStudySource());
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionCount, setQuestionCount] = useState("5");
  const [difficulty, setDifficulty] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Generate questions using the Groq AI backend
  const generateMCQs = async () => {
    if (!notes.trim()) {
      setError("Please enter your study material first.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);

    const prompt = `
You are an expert AI exam question generator.

Generate exactly ${questionCount} multiple-choice questions
from the study material provided below.

Language: ${language}
Difficulty: ${difficulty}

Return ONLY a valid JSON array.
Do not include markdown, code fences or explanations outside JSON.

Use this exact structure:

[
  {
    "question": "What is a computer?",
    "options": {
      "A": "An electronic device",
  ֻǱ˞