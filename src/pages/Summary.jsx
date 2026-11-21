
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";
import { readStudySource, saveStudySource } from "../studyWorkflow";

const LANGUAGES = [
  { name: "English", code: "en-US" },
  { name: "Hindi", code: "hi-IN" },
  { name: "Kannada", code: "kn-IN" },
  { name: "Tamil", code: "ta-IN" },
  { name: "Telugu", code: "te-IN" },
];

function Summary() {
  const [notes, setNotes] = useState(() => readStudySource());
  const [summary, setSummary] = useState("");
  const [language, setLanguage] = useState("English");
  const [length, setLength] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Generate AI summary
  const generateSummary = async () => {
    if (!notes.trim()) {
      setError("Please enter your study notes first.");
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");

    window.speechSynthesis?.cancel();
    setSpeaking(false);

    const prompt = `
You are an expert AI study assistant.

Create a clear and accurate summary of the following study material.

Output language: ${language}
Summary length: ${length}

Instructions:
1. Identify the most important concepts.
2. Remove unnecessary repetition.
3. Use clear headings where appropriate.
4. Use bullet pointֻǱ˞