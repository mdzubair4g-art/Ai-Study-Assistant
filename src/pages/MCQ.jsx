
import { useState } from "react";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";

const LANGUAGES = [
  "English",
  "Hindi",
  "Kannada",
  "Tamil",
  "Telugu",
];

function MCQ() {
  const [notes, setNotes] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionCount, setQuestionCount] = useState("5");
  const [difficulty, setDifficulty] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Generate questions using Ollama
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
      "B": "A type of plant",
      "C": "A type of animal",
      "D": "A type of food"
    },
    "correctAnswer": "A",
    "explanation": "A computer is an electronic device that processes data."
  }
]

IMPORTANT RULES:
1. Generate exactly ${questionCount} questions.
2. Each question must have four options: A, B, C and D.
3. Only one option must be correct.
4. correctAnswer must contain only A, B, C or D.
5. Give a clear explanation for every answer.
6. Questions must be based on the supplied material.
7. Avoid duplicate questions.
8. Make questions appropriate for ${difficulty} difficulty.
9. Write all questions and explanations in ${language}.
10. Ensure valid JSON formatting.

STUDY MATERIAL:
${notes}
`;

    try {
      const response = await fetch(
        "http://127.0.0.1:11434/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen3:0.6b",
            prompt,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("The AI model could not generate questions.");
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
          "The AI returned an invalid response. Please try again."
        );
      }

      const parsed = JSON.parse(
        output.substring(start, end + 1)
      );

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid question format.");
      }

      const validQuestions = parsed.map((item) => {
        let options;

        if (Array.isArray(item.options)) {
          options = {
            A: item.options[0] || "",
            B: item.options[1] || "",
            C: item.options[2] || "",
            D: item.options[3] || "",
          };
        } else {
          const raw = item.options || {};

          options = {
            A: raw.A || raw.a || "",
            B: raw.B || raw.b || "",
            C: raw.C || raw.c || "",
            D: raw.D || raw.d || "",
          };
        }

        let correctAnswer = String(
          item.correctAnswer ||
          item.correct_answer ||
          item.answer ||
          ""
        ).trim();

        const letterMatch = correctAnswer.match(
          /\b([ABCD])\b/i
        );

        if (letterMatch) {
          correctAnswer = letterMatch[1].toUpperCase();
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
            "The AI returned an incomplete question. Please generate again."
          );
        }

        return {
          question: item.question,
          options,
          correctAnswer,
          explanation:
            item.explanation || "Review your study material for this answer.",
        };
      });

      if (validQuestions.length !== Number(questionCount)) {
        throw new Error(
          `The AI generated ${validQuestions.length} questions instead of ${questionCount}. Please try again.`
        );
      }

      setQuestions(validQuestions);
    } catch (err) {
      setError(
        err.message ||
        "Unable to generate questions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Select answer
  const selectAnswer = (questionIndex, option) => {
    if (submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: option,
    }));
  };

  // Calculate results
  const correctCount = questions.filter(
    (question, index) =>
      answers[index] === question.correctAnswer
  ).length;

  const wrongCount = questions.filter(
    (question, index) =>
      answers[index] &&
      answers[index] !== question.correctAnswer
  ).length;

  const scorePercentage = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0;

  // Submit exam
  const submitQuiz = () => {
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setError("");
    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Retake same quiz
  const retakeQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Generate a new quiz
  const resetQuiz = () => {
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setError("");
  };

  // Download exam results as PDF
  const downloadResultsPDF = () => {
    if (!submitted || !questions.length) return;

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

      const addPageIfNeeded = (space = 7) => {
        if (y + space > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
      };

      // PDF heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 80, 180);
      doc.text("AI Study Assistant", margin, y);

      y += 12;

      doc.setFontSize(15);
      doc.setTextColor(30, 30, 30);
      doc.text("MCQ Examination Report", margin, y);

      y += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Difficulty: ${difficulty}`, margin, y);

      y += 7;

      doc.text(`Language: ${language}`, margin, y);

      y += 7;

      doc.text(
        `Date: ${new Date().toLocaleDateString()}`,
        margin,
        y
      );

      y += 10;

      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, pageWidth - margin, y);

      y += 10;

      // Score summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 120, 70);
      doc.text(
        `Final Score: ${correctCount} / ${questions.length}`,
        margin,
        y
      );

      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);

      doc.text(
        `Percentage: ${scorePercentage}%`,
        margin,
        y
      );

      y += 7;

      doc.text(
        `Correct: ${correctCount}    Wrong: ${wrongCount}`,
        margin,
        y
      );

      y += 12;

      // Question report
      questions.forEach((question, index) => {
        addPageIfNeeded(22);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(35, 75, 150);

        const questionLines = doc.splitTextToSize(
          `Q${index + 1}. ${cleanText(question.question)}`,
          maxWidth
        );

        questionLines.forEach((line) => {
          addPageIfNeeded();
          doc.text(line, margin, y);
          y += 6;
        });

        y += 2;

        ["A", "B", "C", "D"].forEach((option) => {
          const optionText = `${option}. ${cleanText(question.options[option])}`;

          const optionLines = doc.splitTextToSize(
            optionText,
            maxWidth
          );

          optionLines.forEach((line) => {
            addPageIfNeeded();
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(40, 40, 40);
            doc.text(line, margin + 3, y);
            y += 5;
          });
        });

        addPageIfNeeded(15);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(20, 130, 80);

        doc.text(
          `Correct Answer: ${question.correctAnswer}`,
          margin + 3,
          y
        );

        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);

        const explanationLines = doc.splitTextToSize(
          `Explanation: ${cleanText(question.explanation)}`,
          maxWidth
        );

        explanationLines.forEach((line) => {
          addPageIfNeeded();
          doc.text(line, margin + 3, y);
          y += 5;
        });

        y += 7;
      });

      // Page numbers
      const totalPages = doc.internal.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        doc.text(
          `AI Study Assistant | Page ${page} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        );
      }

      doc.save("AI-MCQ-Exam-Results.pdf");
    } catch {
      setError("Unable to create the exam PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* Page heading */}
        <section className="text-center mb-10">
          <div className="text-5xl mb-4">🎯</div>

          <h1 className="text-4xl font-extrabold mb-4">
            AI MCQ Generator
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Turn your study materials into interactive practice
            examinations and test your knowledge with AI.
          </p>
        </section>

        {/* Input area */}
        {!questions.length && (
          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">

            <h2 className="text-2xl font-bold mb-5">
              Create Your Practice Exam
            </h2>

            <label className="block text-sm text-gray-300 mb-2">
              Paste your study material
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Paste your textbook content, lecture notes or important study topics here..."
              className="w-full min-h-64 bg-gray-800 border border-gray-700 rounded-xl p-5 text-white outline-none focus:border-blue-500 resize-y"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Number of Questions
                </label>

                <select
                  value={questionCount}
                  onChange={(event) =>
                    setQuestionCount(event.target.value)
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value)
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Language
                </label>

                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                >
                  {LANGUAGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <button
              onClick={generateMCQs}
              disabled={loading || !notes.trim()}
              className="w-full mt-7 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl p-4 font-bold transition"
            >
              {loading
                ? "Generating Your Exam..."
                : "✨ Generate My MCQ Exam"}
            </button>

            {loading && (
              <p className="text-center text-blue-300 mt-4">
                Your AI is preparing your examination. Please wait...
              </p>
            )}

          </section>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-900/30 border border-red-800 text-red-300">
            {error}
          </div>
        )}

        {/* Generated examination */}
        {questions.length > 0 && (
          <section className="mt-8">

            {!submitted && (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 mb-6">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Your Practice Examination
                    </h2>

                    <p className="text-gray-400 text-sm mt-2">
                      {difficulty} Level · {language} · {questions.length} Questions
                    </p>
                  </div>

                  <div className="text-blue-400 font-bold">
                    {Object.keys(answers).length}/{questions.length} Answered
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-800 rounded-full mt-5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${
                        (Object.keys(answers).length / questions.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {submitted && (
              <div className="rounded-2xl border border-blue-800 bg-gradient-to-br from-blue-950 to-gray-900 p-8 mb-8 text-center">

                <div className="text-5xl mb-4">
                  {scorePercentage >= 80
                    ? "🏆"
                    : scorePercentage >= 50
                      ? "👏"
                      : "💪"}
                </div>

                <p className="text-blue-300 font-semibold mb-2">
                  EXAM COMPLETED
                </p>

                <h2 className="text-3xl font-extrabold mb-3">
                  Your Exam Results
                </h2>

                <div className="text-6xl text-blue-400 font-extrabold my-6">
                  {scorePercentage}%
                </div>

                <p className="text-xl text-white mb-7">
                  {correctCount} out of {questions.length} correct answers
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">

                  <div className="bg-gray-900 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Total Questions</p>
                    <p className="text-3xl font-bold mt-2">
                      {questions.length}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Correct Answers</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">
                      {correctCount}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Wrong Answers</p>
                    <p className="text-3xl font-bold text-red-400 mt-2">
                      {wrongCount}
                    </p>
                  </div>

                </div>

                <p className="text-gray-300 mt-7">
                  {scorePercentage === 100
                    ? "Excellent! You got every question correct!"
                    : scorePercentage >= 80
                      ? "Great work! You have a strong understanding."
                      : scorePercentage >= 50
                        ? "Good effort! Keep practising to improve."
                        : "Keep learning! Review your notes and try again."}
                </p>

              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">

              {questions.map((question, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
                >

                  <div className="flex justify-between items-start gap-3 mb-5">

                    <h3 className="text-lg font-bold leading-7">
                      <span className="text-blue-400">
                        Q{index + 1}.
                      </span>{" "}
                      {question.question}
                    </h3>

                    {submitted && (
                      <span
                        className={`text-xs font-bold px-3 py-2 rounded-full ${
                          answers[index] === question.correctAnswer
                            ? "bg-green-900/40 text-green-400"
                            : "bg-red-900/40 text-red-400"
                        }`}
                      >
                        {answers[index] === question.correctAnswer
                          ? "Correct"
                          : "Incorrect"}
                      </span>
                    )}

                  </div>

                  <div className="space-y-3">

                    {["A", "B", "C", "D"].map((option) => {

                      const selected = answers[index] === option;
                      const correct = question.correctAnswer === option;

                      let style =
                        "border-gray-700 bg-gray-800 hover:border-blue-500";

                      if (!submitted && selected) {
                        style = "border-blue-500 bg-blue-900/30";
                      }

                      if (submitted && correct) {
                        style = "border-green-500 bg-green-900/30";
                      } else if (
                        submitted &&
                        selected &&
                        !correct
                      ) {
                        style = "border-red-500 bg-red-900/30";
                      }

                      return (
                        <button
                          type="button"
                          key={option}
                          disabled={submitted}
                          onClick={() => selectAnswer(index, option)}
                          className={`w-full flex items-center gap-4 text-left rounded-xl border p-4 transition ${style}`}
                        >

                          <span className="w-9 h-9 shrink-0 rounded-full bg-gray-700 flex items-center justify-center font-bold">
                            {option}
                          </span>

                          <span className="flex-1 text-sm">
                            {question.options[option]}
                          </span>

                          {submitted && correct && (
                            <span className="text-green-400 font-bold">
                              ✓
                            </span>
                          )}

                          {submitted && selected && !correct && (
                            <span className="text-red-400 font-bold">
                              ✕
                            </span>
                          )}

                        </button>
                      );
                    })}

                  </div>

                  {submitted && (
                    <div className="mt-5 rounded-xl bg-gray-800 p-4">

                      <p className="text-green-400 font-bold text-sm mb-2">
                        Correct Answer: {question.correctAnswer}
                      </p>

                      <p className="text-gray-300 text-sm leading-7">
                        {question.explanation}
                      </p>

                    </div>
                  )}

                </div>
              ))}

            </div>

            {/* Exam actions */}
            {!submitted ? (
              <button
                onClick={submitQuiz}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 p-4 rounded-xl font-bold transition"
              >
                Submit My Examination
              </button>
            ) : (
              <div className="flex flex-wrap gap-4 mt-8">

                <button
                  onClick={downloadResultsPDF}
                  className="flex-1 min-w-48 bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-bold transition"
                >
                  ↓ Download Exam Results PDF
                </button>

                <button
                  onClick={retakeQuiz}
                  className="flex-1 min-w-48 bg-green-600 hover:bg-green-700 p-4 rounded-xl font-bold transition"
                >
                  ↻ Retake Examination
                </button>

                <button
                  onClick={resetQuiz}
                  className="flex-1 min-w-48 bg-gray-700 hover:bg-gray-600 p-4 rounded-xl font-bold transition"
                >
                  + Create New Exam
                </button>

              </div>
            )}

          </section>
        )}

      </main>

      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © 2026 AI Study Assistant. Learn smarter, every day.
      </footer>
    </div>
  );
}

export default MCQ;
