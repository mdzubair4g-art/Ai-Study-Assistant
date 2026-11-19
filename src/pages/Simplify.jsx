
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";

const LANGUAGES = [
  { name: "English", code: "en-US" },
  { name: "Hindi", code: "hi-IN" },
  { name: "Kannada", code: "kn-IN" },
  { name: "Tamil", code: "ta-IN" },
  { name: "Telugu", code: "te-IN" },
];

function Simplify() {
  const [notes, setNotes] = useState("");
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
4. Explain important technical terms.
5. Give simple examples wherever useful.
6. Keep all important information.
7. Do not invent facts.
8. Make the result easy to understand and revise.
9. Respond entirely in ${language}.

STUDY NOTES:
${notes}
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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
          `AI request failed (HTTP ${response.status}). Check the Groq backend terminal for details.`
        );
      }

      const result = (data.response || data.text || "")
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();

      if (!result) {
        throw new Error("The AI returned an empty response. Please try again with shorter notes.");
      }

      setSimplifiedText(result);
    } catch (err) {
      setError(
        err?.message ||
        "Could not reach Groq. Make sure the AI backend is running with npm run ai:server."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(simplifiedText);
      alert("Simplified notes copied successfully!");
    } catch {
      setError("Unable to copy the notes. Please try again.");
    }
  };

  const downloadPDF = () => {
    if (!simplifiedText.trim()) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const maxWidth = pageWidth - margin * 2;

      let y = 22;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 80, 180);
      doc.text("AI Study Assistant", margin, y);

      y += 10;

      doc.setFontSize(15);
      doc.setTextColor(30, 30, 30);
      doc.text("Simplified Study Notes", margin, y);

      y += 9;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Language: ${language}`, margin, y);

      y += 6;

      doc.text(
        `Downloaded: ${new Date().toLocaleDateString()}`,
        margin,
        y
      );

      y += 10;

      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, pageWidth - margin, y);

      y += 10;

      doc.setFontSize(11);
      doc.setTextColor(35, 35, 35);

      const paragraphs = simplifiedText.split("\n");

      paragraphs.forEach((paragraph) => {
        const lines = doc.splitTextToSize(
          paragraph || " ",
          maxWidth
        );

        lines.forEach((line) => {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }

          doc.text(line, margin, y);
          y += 6;
        });
      });

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

      doc.save("AI-Simplified-Notes.pdf");
    } catch (err) {
      setError("Unable to create the PDF. Please try again.");
    }
  };

  const readAloud = () => {
    if (!("speechSynthesis" in window)) {
      setError("Speech playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    if (speaking) {
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(simplifiedText);

    const selectedLanguage = LANGUAGES.find(
      (item) => item.name === language
    );

    utterance.lang = selectedLanguage?.code || "en-US";

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utterance.onstart = () => setSpeaking(true);

    window.speechSynthesis.speak(utterance);
  };

  const clearAll = () => {
    window.speechSynthesis?.cancel();
    setNotes("");
    setSimplifiedText("");
    setError("");
    setSpeaking(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">

        <section className="text-center mb-10">
          <div className="text-5xl mb-4">✨</div>

          <h1 className="text-4xl font-extrabold mb-4">
            AI Notes Simplifier
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Transform complicated study material into simple,
            understandable notes with your personal AI assistant.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">

          <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
            <h2 className="text-xl font-bold">
              Enter Your Study Notes
            </h2>

            <span className="text-sm text-gray-400">
              {notes.length} characters
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Paste your textbook content, class notes or difficult study material here..."
            className="w-full min-h-64 rounded-xl bg-gray-800 border border-gray-700 p-5 text-white outline-none focus:border-blue-500 resize-y"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Choose Output Language
              </label>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
              >
                {LANGUAGES.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={simplifyNotes}
                disabled={loading || !notes.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-3 rounded-lg font-semibold transition"
              >
                {loading ? "Simplifying..." : "✨ Simplify My Notes"}
              </button>

              <button
                onClick={clearAll}
                disabled={loading}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-5 py-3 rounded-lg font-semibold transition"
              >
                Clear
              </button>
            </div>

          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-red-900/30 border border-red-800 p-4 text-red-300">
              {error}
            </div>
          )}

        </section>

        {simplifiedText && (
          <section className="mt-10 rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">

            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div>
                <p className="text-blue-400 text-sm font-semibold mb-2">
                  YOUR AI-GENERATED RESULT
                </p>

                <h2 className="text-2xl font-bold">
                  Simplified Notes 📖
                </h2>
              </div>
            </div>

            <div className="rounded-xl bg-gray-800 p-6 leading-8 text-gray-200 whitespace-pre-wrap">
              {simplifiedText}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">

              <button
                onClick={downloadPDF}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-semibold transition"
              >
                ↓ Download PDF
              </button>

              <button
                onClick={copyNotes}
                className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-lg font-semibold transition"
              >
                📋 Copy Notes
              </button>

              <button
                onClick={readAloud}
                className="bg-green-700 hover:bg-green-600 px-5 py-3 rounded-lg font-semibold transition"
              >
                {speaking ? "⏹ Stop Reading" : "🔊 Read Aloud"}
              </button>

            </div>

            <p className="text-xs text-gray-500 mt-5">
              AI-generated explanations should be checked against
              your original study material.
            </p>

          </section>
        )}

      </main>

      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © 2026 AI Study Assistant. Learn smarter, every day.
      </footer>
    </div>
  );
}

export default Simplify;
