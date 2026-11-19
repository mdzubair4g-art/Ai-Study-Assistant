
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

function Summary() {
  const [notes, setNotes] = useState("");
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
4. Use bullet points for important information.
5. Preserve important definitions and technical terms.
6. Do not invent facts.
7. Make the summary useful for exam revision.
8. Respond entirely in ${language}.
9. Match the requested ${length.toLowerCase()} summary length.

STUDY MATERIAL:
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

      if (!response.ok) {
        throw new Error("The AI model could not generate the summary.");
      }

      const data = await response.json();

      const result = (data.response || "")
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();

      if (!result) {
        throw new Error("The AI returned an empty summary.");
      }

      setSummary(result);
    } catch (err) {
      setError(
        "Unable to connect to Groq. Make sure the AI backend is running with npm run ai:server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Copy summary
  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      alert("Summary copied successfully!");
    } catch {
      setError("Unable to copy the summary. Please try again.");
    }
  };

  // Download summary as PDF
  const downloadPDF = () => {
    if (!summary.trim()) return;

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
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
      };

      // Heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 80, 180);
      doc.text("AI Study Assistant", margin, y);

      y += 12;

      doc.setFontSize(15);
      doc.setTextColor(30, 30, 30);
      doc.text("Study Summary", margin, y);

      y += 10;

      // Summary information
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);

      doc.text(`Language: ${language}`, margin, y);
      y += 6;

      doc.text(`Summary Type: ${length}`, margin, y);
      y += 6;

      doc.text(
        `Downloaded: ${new Date().toLocaleDateString()}`,
        margin,
        y
      );

      y += 9;

      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, pageWidth - margin, y);

      y += 10;

      // Summary content
      doc.setFontSize(11);
      doc.setTextColor(35, 35, 35);

      const paragraphs = cleanText(summary).split("\n");

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

      doc.save("AI-Study-Summary.pdf");
    } catch {
      setError("Unable to generate PDF. Please try again.");
    }
  };

  // Read summary aloud
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

    const selectedLanguage = LANGUAGES.find(
      (item) => item.name === language
    );

    const utterance = new SpeechSynthesisUtterance(summary);

    utterance.lang = selectedLanguage?.code || "en-US";
    utterance.rate = 0.95;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Clear everything
  const clearAll = () => {
    window.speechSynthesis?.cancel();
    setNotes("");
    setSummary("");
    setError("");
    setSpeaking(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <section className="text-center mb-10">
          <div className="text-5xl mb-4">📝</div>

          <h1 className="text-4xl font-extrabold mb-4">
            AI Summary Generator
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Turn lengthy study materials into clear, organized
            summaries using artificial intelligence.
          </p>
        </section>

        {/* Input section */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">

          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <h2 className="text-xl font-bold">
              Enter Your Study Material
            </h2>

            <span className="text-sm text-gray-400">
              {notes.length} characters
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Paste your textbook content, class notes or study material here..."
            className="w-full min-h-64 rounded-xl bg-gray-800 border border-gray-700 p-5 text-white outline-none focus:border-blue-500 resize-y"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Output Language
              </label>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
              >
                {LANGUAGES.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Summary Length
              </label>

              <select
                value={length}
                onChange={(event) => setLength(event.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none"
              >
                <option value="Short">Short Summary</option>
                <option value="Medium">Medium Summary</option>
                <option value="Detailed">Detailed Summary</option>
              </select>
            </div>

          </div>

          <div className="flex flex-wrap gap-3 mt-6">

            <button
              onClick={generateSummary}
              disabled={loading || !notes.trim()}
              className="flex-1 min-w-48 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Generating Summary..." : "✨ Generate Summary"}
            </button>

            <button
              onClick={clearAll}
              disabled={loading}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition"
            >
              Clear All
            </button>

          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-red-900/30 border border-red-800 p-4 text-red-300">
              {error}
            </div>
          )}

        </section>

        {/* Generated summary */}
        {summary && (
          <section className="mt-10 rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">

            <div className="mb-6">
              <p className="text-blue-400 text-sm font-semibold mb-2">
                YOUR AI-GENERATED RESULT
              </p>

              <h2 className="text-2xl font-bold">
                Your Study Summary 📖
              </h2>

              <p className="text-gray-400 text-sm mt-2">
                {length} summary · {language}
              </p>
            </div>

            <div className="rounded-xl bg-gray-800 p-6 leading-8 text-gray-200 whitespace-pre-wrap">
              {summary}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">

              <button
                onClick={downloadPDF}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-semibold transition"
              >
                ↓ Download PDF
              </button>

              <button
                onClick={copySummary}
                className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-lg font-semibold transition"
              >
                📋 Copy Summary
              </button>

              <button
                onClick={readAloud}
                className="bg-green-700 hover:bg-green-600 px-5 py-3 rounded-lg font-semibold transition"
              >
                {speaking ? "⏹ Stop Reading" : "🔊 Read Aloud"}
              </button>

            </div>

            <p className="text-xs text-gray-500 mt-5">
              AI-generated summaries should be checked against
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

export default Summary;
