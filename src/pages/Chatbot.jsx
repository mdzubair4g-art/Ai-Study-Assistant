
import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import Navbar from "../components/Navbar";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const STORAGE_KEY = "ai-study-chat-history";
const DOCUMENT_TEXT_KEY = "ai-study-pdf-text";
const DOCUMENT_NAME_KEY = "ai-study-pdf-name";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_PAGES = 30;
const MAX_TEXT_LENGTH = 30000;

const initialMessages = [
  {
    role: "assistant",
    content:
      "Hello! Welcome to your AI Study Assistant. You can talk to me, upload study PDFs and generate practice quizzes!",
  },
];

const VOICE_LANGUAGES = [
  { name: "English", code: "en-IN" },
  { name: "Hindi", code: "hi-IN" },
  { name: "Kannada", code: "kn-IN" },
  { name: "Tamil", code: "ta-IN" },
  { name: "Telugu", code: "te-IN" },
];

function Chatbot() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;

      return Array.isArray(parsed) && parsed.length
        ? parsed
        : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  const [pdfText, setPdfText] = useState(() => {
    try {
      return localStorage.getItem(DOCUMENT_TEXT_KEY) || "";
    } catch {
      return "";
    }
  });

  const [pdfName, setPdfName] = useState(() => {
    try {
ֻǱ˞