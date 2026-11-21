
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

function Simplify() {
  const [notes, setNotes] = useState(() => readStudySource());
  const [simplifiedText, setSimplifiedText] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const simplifyNotes = async () => {
    if (!notes.trim()) {
      setError("Please enter your study notes first.");
      return;
    }

    setLoading(true);
    setError("");
    setSimplifiedText("");
    setSpeaking(false);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const prompt = `
You are an expert AI study assistant.

Simplify the following study notes for a student.

Output language: ${language}

Instructions:
1. Explain difficult concepts using simple words.
2. Organize the answer with clear headings.
3. Use bullet points where helpful.
4. ExplaiֻǱ˞