
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
      return localStorage.getItem(DOCUMENT_NAME_KEY) || "";
    } catch {
      return "";
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [error, setError] = useState("");

  const [language, setLanguage] = useState("en-IN");
  const [voiceReplies, setVoiceReplies] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Quiz states
  const [quiz, setQuiz] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Save chat history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      setError("Could not save chat history in browser storage.");
    }
  }, [messages]);

  // Save PDF text
  useEffect(() => {
    try {
      if (pdfText) {
        localStorage.setItem(DOCUMENT_TEXT_KEY, pdfText);
      } else {
        localStorage.removeItem(DOCUMENT_TEXT_KEY);
      }
    } catch {
      setError("Could not save the document in browser storage.");
    }
  }, [pdfText]);

  useEffect(() => {
    try {
      if (pdfName) {
        localStorage.setItem(DOCUMENT_NAME_KEY, pdfName);
      } else {
        localStorage.removeItem(DOCUMENT_NAME_KEY);
      }
    } catch {
      // PDF text can still be used during this session.
    }
  }, [pdfName]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Stop voice when leaving the page
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.abort();
    };
  }, []);

  // Speak AI answer
  const speakAnswer = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const cleanAnswer = text
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/[*#`]/g, "")
      .replace(/\n{2,}/g, ". ");

    const utterance = new SpeechSynthesisUtterance(cleanAnswer);

    utterance.lang = language;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  // Upload and read PDF
  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");
    setUploadMessage("");
    setQuiz([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizError("");

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Please upload a PDF smaller than 15 MB.");
      return;
    }

    setUploadingPdf(true);

    let pdfDocument = null;

    try {
      const buffer = await file.arrayBuffer();

      pdfDocument = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
      }).promise;

      const pagesToRead = Math.min(
        pdfDocument.numPages,
        MAX_PAGES
      );

      let extractedText = "";

      for (
        let pageNumber = 1;
        pageNumber <= pagesToRead;
        pageNumber++
      ) {
        const page = await pdfDocument.getPage(pageNumber);
        const content = await page.getTextContent();

        const pageText = content.items
          .map((item) => item.str || "")
          .filter(Boolean)
          .join(" ");

        const remaining = MAX_TEXT_LENGTH - extractedText.length;

        if (remaining <= 0) {
          page.cleanup();
          break;
        }

        extractedText += pageText.slice(0, remaining) + "\n\n";
        page.cleanup();
      }

      if (!extractedText.trim()) {
        throw new Error(
          "No selectable text was found. This may be a scanned PDF."
        );
      }

      setPdfText(extractedText);
      setPdfName(file.name);

      if (
        pdfDocument.numPages > MAX_PAGES ||
        extractedText.length >= MAX_TEXT_LENGTH
      ) {
        setUploadMessage(
          "PDF uploaded. Processing is limited to 30 pages or 30,000 characters."
        );
      } else {
        setUploadMessage("PDF uploaded and read successfully!");
      }
    } catch (err) {
      setError(
        err.message || "Unable to read this PDF. Please try another file."
      );
    } finally {
      if (pdfDocument) {
        await pdfDocument.destroy();
      }

      setUploadingPdf(false);
    }
  };

  // Remove uploaded document
  const removePdf = () => {
    setPdfText("");
    setPdfName("");
    setUploadMessage("PDF removed successfully.");
    setQuiz([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizError("");
    setError("");
  };

  // Generate quiz from uploaded PDF
  const generateQuiz = async () => {
    if (!pdfText.trim()) {
      setQuizError("Please upload a study PDF first.");
      return;
    }

    setQuizLoading(true);
    setQuizError("");
    setQuiz([]);
    setQuizAnswers({});
    setQuizSubmitted(false);

    const selectedLanguage =
      VOICE_LANGUAGES.find((item) => item.code === language)?.name ||
      "English";

    const prompt = `
You are an expert academic quiz generator.

Create exactly 5 multiple-choice questions using ONLY the study material below.

Write the quiz in ${selectedLanguage}.

Return ONLY a valid JSON array.
Do not include markdown or code fences.

Use exactly this format:

[
  {
    "question": "What is a computer?",
    "options": {
      "A": "An electronic device",
      "B": "A type of plant",
      "C": "A type of animal",
      "D": "A type of food"
    },
    "correctAnswer": "A",
    "explanation": "A computer is an electronic device that processes data."
  }
]

IMPORTANT RULES:
1. Create exactly 5 different questions.
2. Each question must have exactly 4 options.
3. Only one option must be correct.
4. correctAnswer must be A, B, C or D.
5. Provide a short explanation for each answer.
6. Use only the information from the study material.
7. Ensure the JSON is valid.

STUDY MATERIAL:
${pdfText.slice(0, 18000)}
`;

    try {
      const response = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("The AI could not generate your quiz.");
      }

      const data = await response.json();

      let output = (data.response || "")
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const start = output.indexOf("[");
      const end = output.lastIndexOf("]");

      if (start === -1 || end === -1) {
        throw new Error(
          "The AI did not return valid quiz data. Please try again."
        );
      }

      const parsed = JSON.parse(output.substring(start, end + 1));

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("No quiz questions were generated.");
      }

      const normalizedQuestions = parsed.slice(0, 5).map((item) => {
        const rawOptions = item.options || {};

        let options;

        if (Array.isArray(rawOptions)) {
          options = {
            A: rawOptions[0] || "",
            B: rawOptions[1] || "",
            C: rawOptions[2] || "",
            D: rawOptions[3] || "",
          };
        } else {
          options = {
            A: rawOptions.A || rawOptions.a || "",
            B: rawOptions.B || rawOptions.b || "",
            C: rawOptions.C || rawOptions.c || "",
            D: rawOptions.D || rawOptions.d || "",
          };
        }

        let correctAnswer = String(
          item.correctAnswer ||
          item.correct_answer ||
          item.answer ||
          ""
        ).trim().toUpperCase();

        const correctLetter = correctAnswer.match(/\b[ABCD]\b/);

        if (correctLetter) {
          correctAnswer = correctLetter[0];
        } else {
          const matchingOption = Object.keys(options).find(
            (key) =>
              options[key].toLowerCase() === correctAnswer.toLowerCase()
          );

          correctAnswer = matchingOption || "";
        }

        if (
          !item.question ||
          !options.A ||
          !options.B ||
          !options.C ||
          !options.D ||
          !["A", "B", "C", "D"].includes(correctAnswer)
        ) {
          throw new Error(
            "The AI generated an invalid question. Please generate the quiz again."
          );
        }

        return {
          question: item.question,
          options,
          correctAnswer,
          explanation:
            item.explanation || "Review the study document for this answer.",
        };
      });

      if (normalizedQuestions.length < 5) {
        throw new Error(
          "The AI generated fewer than five questions. Please try again."
        );
      }

      setQuiz(normalizedQuestions);
    } catch (err) {
      setQuizError(
        err.message || "Unable to generate the quiz. Please try again."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // Choose an answer
  const selectAnswer = (questionIndex, option) => {
    if (quizSubmitted) return;

    setQuizAnswers((previous) => ({
      ...previous,
      [questionIndex]: option,
    }));
  };

  // Calculate score
  const score = quiz.filter(
    (question, index) =>
      quizAnswers[index] === question.correctAnswer
  ).length;

  const submitQuiz = () => {
    if (Object.keys(quizAnswers).length !== quiz.length) {
      setQuizError("Please answer all five questions before submitting.");
      return;
    }

    setQuizError("");
    setQuizSubmitted(true);
  };

  // Restart quiz
  const retryQuiz = () => {
    setQuiz([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizError("");
  };

  // Send question to the Groq AI backend
  const sendQuestion = async (question) => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || loading) return;

    const userMessage = {
      role: "user",
      content: cleanQuestion,
    };

    const conversation = [...messages, userMessage];

    setMessages(conversation);
    setInput("");
    setLoading(true);
    setError("");
    stopSpeaking();

    const selectedLanguage =
      VOICE_LANGUAGES.find((item) => item.code === language)?.name ||
      "English";

    const documentInstructions = pdfText
      ? `
UPLOADED STUDY DOCUMENT: ${pdfName}

DOCUMENT CONTENT:
${pdfText.slice(0, 18000)}

Use this document as the main reference.
Do not invent information not present in the document.
If the answer is not present, say so clearly.
`
      : "No study PDF is uploaded.";

    const chatHistory = conversation
      .slice(-12)
      .map((message) => {
        const speaker =
          message.role === "user" ? "Student" : "Assistant";

        return `${speaker}: ${message.content}`;
      })
      .join("\n\n");

    const prompt = `
You are an intelligent and friendly AI Study Assistant.

Respond in ${selectedLanguage}.

Rules:
1. Explain concepts in simple language.
2. Give examples wherever useful.
3. Be friendly and conversational.
4. Keep answers accurate and educational.
5. Explain programming code step by step.
6. Answer the latest question directly.
7. Make answers suitable for speaking aloud.

${documentInstructions}

CONVERSATION:
${chatHistory}

Assistant:
`;

    try {
      const response = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("The AI model could not process your question.");
      }

      const data = await response.json();

      const answer = (data.response || "")
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();

      if (!answer) {
        throw new Error("The AI returned an empty answer.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: answer,
        },
      ]);

      if (voiceReplies) {
        speakAnswer(answer);
      }
    } catch (err) {
      setError(
        "Unable to connect to Groq. Make sure the AI backend is running with npm run ai:server."
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (event) => {
    event.preventDefault();
    sendQuestion(input);
  };

  // Voice recognition
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    if (loading || uploadingPdf || quizLoading) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    setError("");
    stopSpeaking();

    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setInput((finalTranscript + interimTranscript).trim());
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error === "not-allowed") {
        setError("Please allow microphone access in Chrome.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else {
        setError("Voice recognition failed. Please try again.");
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;

      const question = finalTranscript.trim();

      if (question) {
        setInput("");
        sendQuestion(question);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
      setError("Could not start the microphone. Please try again.");
      recognitionRef.current = null;
    }
  };

  // Download conversation as PDF
  const downloadChatPdf = () => {
    try {
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const maxWidth = pageWidth - margin * 2;

      let y = 22;

      const cleanText = (value) =>
        String(value ?? "")
          .replace(/\r\n/g, "\n")
          .replace(/[^\x09\x0A\x20-\x7E]/g, "");

      const addPageIfNeeded = () => {
        if (y > pageHeight - 18) {
          doc.addPage();
          y = 20;
        }
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 80, 180);
      doc.text("AI Study Assistant", margin, y);

      y += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text("Chat Conversation", margin, y);

      y += 12;

      messages.forEach((message) => {
        addPageIfNeeded();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(
          message.role === "user" ? 30 : 20,
          message.role === "user" ? 90 : 130,
          message.role === "user" ? 200 : 100
        );

        doc.text(
          message.role === "user" ? "YOU" : "AI ASSISTANT",
          margin,
          y
        );

        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(35, 35, 35);

        const paragraphs = cleanText(message.content).split("\n");

        paragraphs.forEach((paragraph) => {
          const lines = doc.splitTextToSize(
            paragraph || " ",
            maxWidth
          );

          lines.forEach((line) => {
            addPageIfNeeded();
            doc.text(line, margin, y);
            y += 6;
          });
        });

        y += 6;
      });

      const totalPages = doc.internal.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        doc.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        );
      }

      doc.save("AI-Study-Chat-History.pdf");
    } catch {
      setError("Unable to create your PDF. Please try again.");
    }
  };

  // Clear conversation
  const clearChat = () => {
    if (loading) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear your chat history?"
    );

    if (confirmed) {
      stopSpeaking();
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setListening(false);
      setMessages(initialMessages);
      setInput("");
      setError("");
    }
  };

  const suggestedQuestions = [
    "Summarize my uploaded PDF",
    "Explain the main concepts in this document",
    "Create five questions from this document",
    "Explain this topic in simple words",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-5 py-10">

        {/* Page heading */}
        <section className="text-center mb-8">
          <div className="text-5xl mb-4">🤖</div>

          <h1 className="text-4xl font-extrabold mb-3">
            AI Study Assistant
          </h1>

          <p className="text-gray-400">
            Talk to your AI tutor, upload notes and practise with quizzes.
          </p>
        </section>

        {/* PDF Upload */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 mb-6">
          <h2 className="font-bold text-lg mb-2">
            📄 Upload Your Study PDF
          </h2>

          <p className="text-sm text-gray-400 mb-4">
            Upload lecture notes or textbook PDFs to ask questions
            and generate practice quizzes.
          </p>

          <input
            type="file"
            accept=".pdf,application/pdf"
            disabled={uploadingPdf || loading || quizLoading}
            onChange={handlePdfUpload}
            className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-5 file:py-3 file:font-semibold file:text-white hover:file:bg-blue-700 disabled:opacity-50"
          />

          {uploadingPdf && (
            <p className="mt-4 text-blue-400 text-sm">
              Reading your PDF... Please wait.
            </p>
          )}

          {pdfName && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-800 bg-green-900/20 p-4">
              <div>
                <p className="text-green-400 font-semibold">
                  ✓ PDF attached
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  {pdfName}
                </p>
              </div>

              <button
                onClick={removePdf}
                disabled={loading || uploadingPdf || quizLoading}
                className="text-red-400 hover:text-red-300 font-semibold text-sm"
              >
                Remove PDF
              </button>
            </div>
          )}

          {uploadMessage && (
            <p className="text-sm text-green-400 mt-3">
              {uploadMessage}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Maximum size: 15 MB. Reads up to 30 pages and 30,000
            characters. Scanned image-only PDFs are not supported.
          </p>
        </section>

        {/* PDF Quiz Generator */}
        {pdfText && (
          <section className="rounded-2xl border border-purple-800/50 bg-gradient-to-br from-gray-900 to-purple-950/30 p-6 mb-6">

            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-purple-400 text-sm font-semibold mb-2">
                  AI POWERED PRACTICE
                </p>

                <h2 className="text-2xl font-bold">
                  📚 PDF Quiz Generator
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  Create five MCQs from your uploaded document.
                </p>
              </div>

              <button
                onClick={generateQuiz}
                disabled={quizLoading || uploadingPdf || loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition"
              >
                {quizLoading
                  ? "Generating Quiz..."
                  : quiz.length
                    ? "Generate New Quiz"
                    : "✨ Generate Quiz"}
              </button>
            </div>

            {quizLoading && (
              <div className="text-purple-300 bg-purple-900/20 rounded-xl p-4">
                AI is preparing your questions from the document...
              </div>
            )}

            {quizError && (
              <div className="text-red-300 bg-red-900/30 border border-red-800 rounded-xl p-4 mb-4 text-sm">
                {quizError}
              </div>
            )}

            {quiz.length > 0 && (
              <div className="space-y-6 mt-6">

                <div className="flex justify-between items-center gap-3">
                  <h3 className="text-xl font-bold">
                    Your Practice Quiz
                  </h3>

                  <span className="text-sm text-gray-400">
                    {Object.keys(quizAnswers).length}/{quiz.length} answered
                  </span>
                </div>

                {quiz.map((question, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-700 bg-gray-900 p-5"
                  >
                    <h4 className="font-bold leading-7 mb-4">
                      Q{index + 1}. {question.question}
                    </h4>

                    <div className="space-y-3">
                      {["A", "B", "C", "D"].map((option) => {
                        const selected =
                          quizAnswers[index] === option;

                        const correct =
                          question.correctAnswer === option;

                        let optionStyle =
                          "border-gray-700 bg-gray-800 hover:border-purple-500";

                        if (!quizSubmitted && selected) {
                          optionStyle =
                            "border-purple-500 bg-purple-900/40";
                        }

                        if (quizSubmitted && correct) {
                          optionStyle =
                            "border-green-500 bg-green-900/30";
                        } else if (
                          quizSubmitted &&
                          selected &&
                          !correct
                        ) {
                          optionStyle =
                            "border-red-500 bg-red-900/30";
                        }

                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => selectAnswer(index, option)}
                            className={`w-full text-left flex gap-3 items-center rounded-lg border p-3 transition ${optionStyle}`}
                          >
                            <span className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-gray-700 font-bold text-sm">
                              {option}
                            </span>

                            <span className="text-sm">
                              {question.options[option]}
                            </span>

                            {quizSubmitted && correct && (
                              <span className="ml-auto text-green-400 font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-4 rounded-lg bg-gray-800 p-4">
                        <p className={`font-bold text-sm mb-2 ${
                          quizAnswers[index] === question.correctAnswer
                            ? "text-green-400"
                            : "text-red-400"
                        }`}>
                          {quizAnswers[index] === question.correctAnswer
                            ? "Correct answer!"
                            : `Correct answer: ${question.correctAnswer}`}
                        </p>

                        <p className="text-sm text-gray-300 leading-6">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button
                    onClick={submitQuiz}
                    disabled={quizLoading}
                    className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-xl font-bold transition"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <div className="rounded-2xl border border-green-700 bg-green-900/20 p-6 text-center">
                    <div className="text-4xl mb-3">
                      {score >= 4 ? "🏆" : score >= 3 ? "👏" : "💪"}
                    </div>

                    <h3 className="text-2xl font-bold mb-2">
                      Quiz Completed!
                    </h3>

                    <p className="text-3xl text-green-400 font-extrabold mb-2">
                      {score} / {quiz.length}
                    </p>

                    <p className="text-gray-300 mb-5">
                      You scored {Math.round((score / quiz.length) * 100)}%.
                      {score === quiz.length
                        ? " Perfect score!"
                        : " Keep practising!"}
                    </p>

                    <button
                      onClick={retryQuiz}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold"
                    >
                      Try Another Quiz
                    </button>
                  </div>
                )}

              </div>
            )}

            {!quiz.length && !quizLoading && (
              <p className="text-sm text-gray-500">
                Upload your study document and click Generate Quiz
                to begin practising.
              </p>
            )}

          </section>
        )}

        {/* Voice Settings */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 mb-6">

          <h2 className="font-bold text-lg mb-4">
            🎙 Voice Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Choose Your Language
              </label>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                disabled={loading || listening}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
              >
                {VOICE_LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 bg-gray-800 rounded-xl p-4">
              <div>
                <p className="font-semibold">AI Voice Replies</p>
                <p className="text-xs text-gray-400">
                  Automatically speak AI answers
                </p>
              </div>

              <button
                onClick={() => setVoiceReplies((previous) => !previous)}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  voiceReplies
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {voiceReplies ? "ON" : "OFF"}
              </button>
            </div>

          </div>
        </section>

        {/* Chat Interface */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">

          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-800">

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-xl">
                🤖
              </div>

              <div>
                <h2 className="font-bold">Your AI Tutor</h2>
                <p className="text-xs text-green-400">
                  Ready to help you learn
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadChatPdf}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
              >
                ↓ PDF
              </button>

              <button
                onClick={clearChat}
                disabled={loading}
                className="text-sm text-red-400 hover:text-red-300 px-3 py-2"
              >
                Clear Chat
              </button>
            </div>

          </div>

          <div className="h-[450px] overflow-y-auto p-5 space-y-5">

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-800 text-gray-100 rounded-bl-sm"
                  }`}
                >
                  <p className="text-xs font-semibold mb-2 opacity-70">
                    {message.role === "user"
                      ? "YOU"
                      : "AI ASSISTANT"}
                  </p>

                  <p className="text-sm leading-7 whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="bg-gray-800 rounded-xl p-4 text-blue-300 w-fit">
                AI is thinking...
                <span className="animate-pulse"> ● ● ●</span>
              </div>
            )}

            <div ref={bottomRef} />

          </div>

          {error && (
            <div className="mx-5 mb-4 bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Voice and text controls */}
          <div className="p-5 border-t border-gray-800">

            <div className="flex flex-wrap justify-center gap-3 mb-5">

              <button
                onClick={startListening}
                disabled={loading || uploadingPdf || quizLoading}
                className={`px-7 py-4 rounded-xl font-bold transition disabled:opacity-50 ${
                  listening
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {listening
                  ? "🔴 Listening... Tap to stop"
                  : "🎙 Start Talking"}
              </button>

              <button
                onClick={() => {
                  if (speaking) {
                    stopSpeaking();
                  } else {
                    const lastAnswer = [...messages]
                      .reverse()
                      .find((message) => message.role === "assistant");

                    if (lastAnswer) {
                      speakAnswer(lastAnswer.content);
                    }
                  }
                }}
                className="px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition"
              >
                {speaking ? "⏹ Stop Speaking" : "🔊 Replay AI Answer"}
              </button>

            </div>

            <p className="text-center text-sm text-gray-400 mb-4">
              {listening
                ? "I'm listening. Speak your question now..."
                : speaking
                  ? "Your AI tutor is speaking..."
                  : "Tap Start Talking or type your question below."}
            </p>

            <p className="text-xs text-gray-400 mb-3">
              Suggested questions:
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={loading || listening}
                  onClick={() => setInput(question)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full px-3 py-2 text-gray-300 disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>

            <form onSubmit={sendMessage} className="flex gap-3">

              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendQuestion(input);
                  }
                }}
                placeholder="Ask something about your PDF or type a study question..."
                rows={2}
                className="flex-1 resize-none bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={loading || uploadingPdf || !input.trim()}
                className="self-end bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold"
              >
                {loading ? "..." : "Send ↑"}
              </button>

            </form>

          </div>

        </section>

        <p className="text-center text-gray-500 text-xs mt-5">
          Powered by Groq AI and Mozilla PDF.js.
          Quiz answers are generated from the uploaded document.
        </p>

      </main>
    </div>
  );
}

export default Chatbot;
