
import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import { readStudySource, saveStudySource } from "../studyWorkflow";

const LANGUAGES = [
  { name: "English", code: "en-US" },
  { name: "Hindi", code: "hi-IN" },
  { name: "Kannada", code: "kn-IN" },
  { name: "Tamil", code: "ta-IN" },
  { name: "Telugu", code: "te-IN" },
  { name: "Malayalam", code: "ml-IN" },
  { name: "Urdu", code: "ur-PK" },
  { name: "Bengali", code: "bn-IN" },
  { name: "Marathi", code: "mr-IN" },
  { name: "Spanish", code: "es-ES" },
  { name: "French", code: "fr-FR" },
  { name: "German", code: "de-DE" },
];

const MODEL = "openai/gpt-oss-120b";
const AI_GENERATE_URL = "/api/generate";

function Podcast() {
  const [notes, setNotes] = useState(() => readStudySource());
  const [podcast, setPodcast] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voices, setVoices] = useState(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  });
  const [selectedVoice, setSelectedVoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [playback, setPlayback] = useState("stopped");

  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;

ֻǱ˞