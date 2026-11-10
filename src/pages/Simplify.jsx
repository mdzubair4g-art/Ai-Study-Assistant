import { useState } from "react";
import Navbar from "../components/Navbar";

function Simplify() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSimplify = () => {
    if (notes.trim() === "") {
      alert("Please enter some notes first!");
      return;
    }

    setLoading(true);
    setResult("");

    // Temporary demo result
    setTimeout(() => {
      setResult(
        "Simplified Notes:\n\n" +
        notes +
        "\n\nThis content will later be processed by a real AI model to provide a simpler and easier explanation."
      );

      setLoading(false);
    }, 1500);
  };

  const handleClear = () => {
    setNotes("");
    setResult("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-900">
          Simplify Your Notes 📝
        </h1>

        <p className="text-center text-gray-600 mt-4">
          Paste your difficult notes and get an easier explanation.
        </p>

        {/* Input Section */}
        <div className="bg-white mt-10 p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">
              Your Notes
            </h2>

            <span className="text-sm text-gray-500">
              {notes.length} characters
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here..."
            className="w-full h-64 border border-gray-300 rounded-lg p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div className="flex gap-4 mt-5">
            <button
              onClick={handleSimplify}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "🤖 AI is thinking..." : "✨ Simplify with AI"}
            </button>

            <button
              onClick={handleClear}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="bg-white mt-8 p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🤖 Simplified Result
            </h2>

            <div className="bg-blue-50 p-5 rounded-lg text-gray-700 whitespace-pre-line">
              {result}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Simplify;