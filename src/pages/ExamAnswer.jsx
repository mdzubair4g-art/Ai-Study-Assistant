import { useState } from "react";
import Navbar from "../components/Navbar";
import { readStudySource, saveStudySource } from "../studyWorkflow";

const MARK_OPTIONS = [
  { value: "2", label: "2 marks", detail: "Short definition and key points" },
  { value: "5", label: "5 marks", detail: "Structured explanation with main points" },
  { value: "10", label: "10 marks", detail: "Detailed answer with headings and examples" },
];

const LANGUAGES = ["English", "Hindi", "Kannada", "Tamil", "Telugu"];

function ExamAnswer() {
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState(() => readStudySource());
  const [marks, setMarks] = useState("5");
  const [language, setLanguage] = useState("English");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const generateAnswer = async (event) => {
    event.preventDefault();

    if (!question.trim()) {
      setError("Enter the exam question you want answered.");
      return;
    }

    if (!notes.trim()) {
      setError("Add your textbook, class notes or question-bank material first.");
      return;
    }

    setLoading(true);
    setError("");
    setCopyMessage("");
    setAnswer("");

    const markGuidance = {
      "2": "Write a concise answer suitable for 2 marks: give the direct definition or core idea and 1–2 essential supporting points. Avoid unnecessary detail.",
      "5": "Write a medium-length answer suitable for 5 marks: start with a clear definition or introduction, explain 4–6 important points in an organized order, and include an example only when the source supports it.",
      "10": "Write a detailed answer suitable for 10 marks: use a short introduction, clear subheadings, well-explained main points, relevant examples or a text description of a diagram only when supported by the source, and a brief conclusion. Cover the important source material without padding.",
    }[marks];

    const prompt = `
You are a careful engineering-exam answer writer.

Answer the exact question using the supplied study material as your source.

QUESTION:
${question.trim()}

MARKS:
${marks}

OUTPUT LANGUAGE:
${language}

ANSWER LENGTH AND STRUCTURE:
${markGuidance}

STRICT SOURCE RULES:
1. Use only facts, definitions, terminology and examples supported by the supplied study material.
2. Do not invent details, formulas, steps, advantages, disadvantages, diagrams or examples.
3. Preserve important technical terms used in the study material.
4. If the source does not contain enough information for a complete answer, clearly say so and write only the parts that are supported.
5. Do not claim that the answer is guaranteed to receive full marks.
6. Use simple, clear language suitable for an engineering student.
7. Keep the answer focused on the exact question.
8. Respond entirely in ${language}.
9. Use readable headings and numbered points where they make the answer clearer.
10. Do not add an opening chat message or mention these instructions.

SUPPLIED STUDY MATERIAL:
${notes}
`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, stream: false }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `AI request failed (HTTP ${response.status}).`);
      }

      const result = String(data.response || data.text || "")
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();

      if (!result) {
        throw new Error("The AI returned an empty answer. Please try again.");
      }

      setAnswer(result);
    } catch (requestError) {
      setError(
        requestError?.message ||
        "Unable to generate the answer. Check your AI connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = async () => {
    if (!answer) return;

    try {
      await navigator.clipboard.writeText(answer);
      setCopyMessage("Answer copied.");
    } catch {
      setError("Clipboard access was blocked. Select the answer and copy it manually.");
    }
  };

  const downloadAnswer = () => {
    if (!answer) return;

    const safeQuestion = question
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 45) || "exam-answer";
    const fileContent = [
      "AI STUDY ASSISTANT",
      `Question: ${question.trim()}`,
      `Marks: ${marks}`,
      `Language: ${language}`,
      "",
      answer,
      "",
      "Generated from the study material provided by the learner.",
    ].join("\n");

    const blob = new Blob(["\uFEFF", fileContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeQuestion}-${marks}-marks.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const clearForm = () => {
    setQuestion("");
    setNotes("");
    saveStudySource("");
    setAnswer("");
    setError("");
    setCopyMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white tool-page tool-page-exam-answer">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="text-center mb-9">
          <div className="text-5xl mb-4" aria-hidden="true">✍️</div>
          <p className="text-orange-400 text-xs font-bold tracking-[.2em] mb-3">
            BUILT FOR ENGINEERING EXAM REVISION
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Exam Answer Generator
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-7">
            Turn your own study material into focused answers for 2, 5 or 10 marks.
            Choose the length, ask your question and revise with confidence.
          </p>
        </section>

        <form
          onSubmit={generateAnswer}
          className="rounded-3xl border border-purple-800/40 bg-gray-900/90 p-5 md:p-8 shadow-2xl shadow-purple-950/20"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-purple-300 text-sm font-bold mb-2">01 / SET UP YOUR ANSWER</p>
              <h2 className="text-2xl font-bold">What question are you preparing for?</h2>
              <p className="text-sm text-gray-400 mt-2">
                Add the exact question, then provide the relevant notes or textbook content.
              </p>
            </div>
            <button
              type="button"
              onClick={clearForm}
              disabled={loading}
              className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Clear form
            </button>
          </div>

          <div className="mb-6">
            <label htmlFor="exam-question" className="block text-sm font-semibold text-gray-200 mb-2">
              Exam question
            </label>
            <textarea
              id="exam-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: Explain collision resolution by chaining."
              rows={2}
              maxLength={500}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 p-4 text-white placeholder:text-gray-500 resize-y"
            />
            <p className="text-xs text-gray-500 mt-2 text-right">{question.length}/500</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <label htmlFor="exam-marks" className="block text-sm font-semibold text-gray-200 mb-2">
                Answer length
              </label>
              <select
                id="exam-marks"
                value={marks}
                onChange={(event) => setMarks(event.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 text-white"
              >
                {MARK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} — {option.detail}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="exam-language" className="block text-sm font-semibold text-gray-200 mb-2">
                Output language
              </label>
              <select
                id="exam-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 text-white"
              >
                {LANGUAGES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label htmlFor="exam-notes" className="block text-sm font-semibold text-gray-200">
                Your study material
              </label>
              <span className="text-xs text-gray-500">{notes.length.toLocaleString()} characters</span>
            </div>
            <textarea
              id="exam-notes"
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                saveStudySource(event.target.value);
              }}
              placeholder="Paste the relevant textbook page, class notes or question-bank content here…"
              rows={9}
              maxLength={47000}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 p-4 text-white placeholder:text-gray-500 resize-y"
            />
            <p className="text-xs text-gray-500 mt-2">
              Material is saved in this browser so the other study tools can reuse it.
              Only the material you submit is sent to the AI service.
            </p>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-200 mb-5">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-500 max-w-lg">
              Answers are based on the material you provide. Check your course notes before using them in an exam.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-900/25 hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Preparing your answer…" : "Generate exam answer ↗"}
            </button>
          </div>
        </form>

        {answer && (
          <section className="mt-7 rounded-3xl border border-purple-700/40 bg-gray-900 p-5 md:p-8" aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-800 pb-5 mb-5">
              <div>
                <p className="text-emerald-400 text-xs font-bold tracking-[.18em] mb-2">
                  YOUR REVISION ANSWER
                </p>
                <h2 className="text-2xl font-bold">{marks}-Mark Answer</h2>
                <p className="text-sm text-gray-400 mt-1">{question}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyAnswer}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold hover:bg-gray-800"
                >
                  Copy answer
                </button>
                <button
                  type="button"
                  onClick={downloadAnswer}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500"
                >
                  Download .txt
                </button>
              </div>
            </div>
            <div className="whitespace-pre-wrap break-words text-sm md:text-base leading-8 text-gray-100">
              {answer}
            </div>
            {copyMessage && <p className="mt-4 text-sm text-emerald-300" role="status">{copyMessage}</p>}
            <p className="mt-6 border-t border-gray-800 pt-4 text-xs text-gray-500">
              Generated using the selected mark length and the study material above.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default ExamAnswer;
