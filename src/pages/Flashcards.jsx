
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";
import { readStudySource, saveStudySource } from "../studyWorkflow";

const STORAGE_KEY = "ai-study-flashcards";

function Flashcards() {
  const [now] = useState(() => Date.now());
  const [notes, setNotes] = useState(() => readStudySource());
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [flipped, setFlipped] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [reviewMessage, setReviewMessage] = useState("");

  // Save flashcards automatically
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.warn("Unable to save flashcards in browser storage.", error);
    }
  }, [cards]);

  // Generate flashcards using the Groq AI backend
  const generateFlashcards = async () => {
    if (!notes.trim()) {
      setError("Please enter your study notes first.");
      return;
    }

    setLoading(true);
    setError("");
    setReviewMessage("");
    setCards([]);
    setFlipped({});

    const prompt = `
You are an expert AI study assistant.

Create exactly 8 useful flashcards from the study notes below.

Return ONLY a valid JSON array.
Do not include markdown or code fences.

Use this exact format:

[
  {
    "question": "What is a computer?",
    "answer": "A computer is an electronic device that processes data."
  },
  {
    "question": "What is hardware?",
    "answer": "Hardware refers to the physical parts of a computer."
  }
]

Rules:
1. Generate exactly 8 flashcards.
2. Every card must have a question and answer.
3. Keep questions clear and educational.
4. Give informative answers.
5. Use only information from the study notes.
6. Avoid duplicate questions.
7. Return valid JSON only.

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

      if (!response.ok) {
        throw new Error("Groq could not generate flashcards. Check the AI backend and try again.");
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

      const parsedCards = JSON.parse(
        output.substring(start, end + 1)
      );

      if (!Array.isArray(parsedCards)) {
        throw new Error("Invalid flashcard format.");
      }

      const validCards = parsedCards
        .filter(
          (card) =>
            typeof card.question === "string" &&
            typeof card.answer === "string" &&
            card.question.trim() &&
            card.answer.trim()
        )
        .map((card, index) => ({
          id: `${Date.now()}-${index}`,
          question: card.question.trim(),
          answer: card.answer.trim(),
          repetitions: 0,
          intervalDays: 0,
          dueAt: Date.now(),
          lastReviewedAt: null,
        }));

      if (validCards.length === 0) {
        throw new Error("No valid flashcards were generated.");
      }

      setCards(validCards);
      setFilter("All");

      setReviewMessage(
        `${validCards.length} flashcards generated successfully!`
      );
    } catch (err) {
      setError(
        err.message || "Unable to generate flashcards."
      );
    } finally {
      setLoading(false);
    }
  };

  // Flip a flashcard
  const toggleCard = (id) => {
    setFlipped((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  // Calculate next review interval
  const getNextInterval = (card, rating) => {
    const repetitions = card.repetitions || 0;
    const previousInterval = card.intervalDays || 0;

    if (rating === "Again") {
      return {
        repetitions: 0,
        intervalDays: 0,
        dueAt: Date.now() + 10 * 60 * 1000,
      };
    }

    let nextInterval = 1;

    if (rating === "Hard") {
      nextInterval =
        repetitions === 0
          ? 1
          : Math.max(1, Math.round(previousInterval * 1.2));
    }

    if (rating === "Good") {
      nextInterval =
        repetitions === 0
          ? 1
          : repetitions === 1
            ? 3
            : Math.max(1, Math.round(previousInterval * 2));
    }

    if (rating === "Easy") {
      nextInterval =
        repetitions === 0
          ? 4
          : Math.max(4, Math.round(previousInterval * 2.5));
    }

    return {
      repetitions: repetitions + 1,
      intervalDays: nextInterval,
      dueAt: Date.now() + nextInterval * 24 * 60 * 60 * 1000,
    };
  };

  // Rate a flashcard after reviewing the answer
  const rateCard = (id, rating) => {
    const card = cards.find((item) => item.id === id);

    if (!card) return;

    const schedule = getNextInterval(card, rating);

    setCards((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              ...schedule,
              lastReviewedAt: Date.now(),
            }
          : item
      )
    );

    setFlipped((previous) => ({
      ...previous,
      [id]: false,
    }));

    setReviewMessage(
      rating === "Again"
        ? "This card will appear for review again in 10 minutes."
        : `Great! Next review scheduled in ${schedule.intervalDays} day(s).`
    );
  };

  // Study statistics
  const reviewedCount = cards.filter(
    (card) => card.repetitions > 0
  ).length;

  const masteredCount = cards.filter(
    (card) => card.intervalDays >= 7
  ).length;

  const dueCount = cards.filter(
    (card) => !card.dueAt || card.dueAt <= now
  ).length;

  const progress = cards.length
    ? Math.round((reviewedCount / cards.length) * 100)
    : 0;

  // Filter cards
  const filteredCards = cards.filter((card) => {
    if (filter === "Due Now") {
      return !card.dueAt || card.dueAt <= Date.now();
    }

    if (filter === "Mastered") {
      return card.intervalDays >= 7;
    }

    return true;
  });

  // Download all flashcards as PDF
  const downloadPDF = () => {
    if (!cards.length) return;

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
          .split("")
          .filter((character) => {
            const code = character.charCodeAt(0);
            return code === 9 || code === 10 || (code >= 32 && code <= 126);
          })
          .join("");

      const addPageIfNeeded = (space = 7) => {
        if (y + space > pageHeight - 18) {
          doc.addPage();
          y = 20;
        }
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 80, 180);
      doc.text("AI Study Assistant", margin, y);

      y += 12;

      doc.setFontSize(15);
      doc.setTextColor(30, 30, 30);
      doc.text("Study Flashcards", margin, y);

      y += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);

      doc.text(
        `Total Flashcards: ${cards.length}`,
        margin,
        y
      );

      y += 7;

      doc.text(
        `Downloaded: ${new Date().toLocaleDateString()}`,
        margin,
        y
      );

      y += 10;

      cards.forEach((card, index) => {
        addPageIfNeeded(25);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 80, 180);

        const questionLines = doc.splitTextToSize(
          `Card ${index + 1}: ${cleanText(card.question)}`,
          maxWidth
        );

        questionLines.forEach((line) => {
          addPageIfNeeded();
          doc.text(line, margin, y);
          y += 6;
        });

        y += 3;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);

        const answerLines = doc.splitTextToSize(
          `Answer: ${cleanText(card.answer)}`,
          maxWidth
        );

        answerLines.forEach((line) => {
          addPageIfNeeded();
          doc.text(line, margin, y);
          y += 6;
        });

        y += 9;
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

      doc.save("AI-Study-Flashcards.pdf");
    } catch {
      setError("Unable to generate the flashcard PDF.");
    }
  };

  // Reset study progress
  const resetProgress = () => {
    const confirmed = window.confirm(
      "Reset the review progress for all flashcards?"
    );

    if (!confirmed) return;

    setCards((previous) =>
      previous.map((card) => ({
        ...card,
        repetitions: 0,
        intervalDays: 0,
        dueAt: Date.now(),
        lastReviewedAt: null,
      }))
    );

    setFlipped({});
    setReviewMessage("Your study progress has been reset.");
  };

  // Delete all flashcards
  const clearDeck = () => {
    const confirmed = window.confirm(
      "Delete all flashcards? This cannot be undone."
    );

    if (!confirmed) return;

    setCards([]);
    setFlipped({});
    setNotes("");
    saveStudySource("");
    setError("");
    setReviewMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white tool-page tool-page-flashcards">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <section className="text-center mb-10">
          <div className="text-5xl mb-4">🃏</div>

          <h1 className="text-4xl font-extrabold mb-4">
            AI Flashcard Generator
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Turn your study notes into interactive flashcards
            and remember important concepts using spaced repetition.
          </p>
        </section>

        {/* Input Section */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">

          <div className="flex justify-between items-center gap-3 mb-5">
            <h2 className="text-xl font-bold">
              Enter Your Study Notes
            </h2>

            <span className="text-sm text-gray-400">
              {notes.length} characters
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(event) => { setNotes(event.target.value); saveStudySource(event.target.value); }}
            placeholder="Paste your study notes here..."
            className="w-full min-h-56 rounded-xl bg-gray-800 border border-gray-700 p-5 text-white outline-none focus:border-blue-500 resize-y"
          />

          <div className="flex flex-wrap gap-3 mt-6">

            <button
              onClick={generateFlashcards}
              disabled={loading || !notes.trim()}
              className="flex-1 min-w-48 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition"
            >
              {loading
                ? "Generating Flashcards..."
                : "✨ Generate Flashcards"}
            </button>

            <button
              onClick={downloadPDF}
              disabled={!cards.length}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition"
            >
              ↓ Download PDF
            </button>

          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-red-900/30 border border-red-800 p-4 text-red-300">
              {error}
            </div>
          )}

          {reviewMessage && (
            <div className="mt-5 rounded-lg bg-blue-900/30 border border-blue-800 p-4 text-blue-300">
              {reviewMessage}
            </div>
          )}

        </section>

        {/* Progress Dashboard */}
        {cards.length > 0 && (
          <section className="mt-10">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                <p className="text-gray-400 mb-2">
                  Total Cards
                </p>
                <h2 className="text-3xl font-bold">
                  {cards.length}
                </h2>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                <p className="text-gray-400 mb-2">
                  Reviewed
                </p>
                <h2 className="text-3xl font-bold text-blue-400">
                  {reviewedCount}
                </h2>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                <p className="text-gray-400 mb-2">
                  Due Now
                </p>
                <h2 className="text-3xl font-bold text-yellow-400">
                  {dueCount}
                </h2>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                <p className="text-gray-400 mb-2">
                  Mastered
                </p>
                <h2 className="text-3xl font-bold text-green-400">
                  {masteredCount}
                </h2>
              </div>

            </div>

            {/* Progress bar */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 mb-8">

              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl">
                  Your Study Progress
                </h2>

                <span className="text-blue-400 font-bold">
                  {progress}%
                </span>
              </div>

              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-gray-400 text-sm mt-3">
                {reviewedCount} of {cards.length} cards reviewed.
              </p>

            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">

              <h2 className="text-2xl font-bold">
                Your Flashcards
              </h2>

              <div className="flex flex-wrap gap-2">
                {["All", "Due Now", "Mastered"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      filter === item
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>

            {/* Flashcard Grid */}
            {filteredCards.length === 0 ? (
              <div className="text-center rounded-2xl border border-gray-800 bg-gray-900 p-12">
                <div className="text-5xl mb-4">📚</div>

                <h3 className="text-xl font-bold mb-2">
                  No cards in this category
                </h3>

                <p className="text-gray-400">
                  Try another filter or review more cards.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {filteredCards.map((card, index) => (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-gray-800 bg-gray-900 p-5"
                  >

                    <button
                      type="button"
                      onClick={() => toggleCard(card.id)}
                      className="w-full min-h-48 text-left rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-750 p-6 transition"
                    >

                      <p className="text-sm text-blue-400 font-semibold mb-4">
                        FLASHCARD {index + 1}
                      </p>

                      <h3 className="font-bold text-lg mb-5">
                        {flipped[card.id] ? "Answer" : "Question"}
                      </h3>

                      <p className="text-gray-200 leading-7">
                        {flipped[card.id]
                          ? card.answer
                          : card.question}
                      </p>

                      <p className="text-sm text-blue-400 mt-6">
                        {flipped[card.id]
                          ? "Click to see question"
                          : "Click to reveal answer"}
                      </p>

                    </button>

                    <div className="flex flex-wrap justify-between items-center gap-3 mt-4">

                      <span className={`text-xs px-3 py-2 rounded-full ${
                        card.intervalDays >= 7
                          ? "bg-green-900/40 text-green-400"
                          : card.repetitions > 0
                            ? "bg-blue-900/40 text-blue-400"
                            : "bg-yellow-900/40 text-yellow-400"
                      }`}>
                        {card.intervalDays >= 7
                          ? "Mastered"
                          : card.repetitions > 0
                            ? "Learning"
                            : "Not reviewed"}
                      </span>

                      <span className="text-xs text-gray-400">
                        {card.dueAt <= Date.now()
                          ? "Ready to review"
                          : `Next: ${new Date(card.dueAt).toLocaleDateString()}`}
                      </span>

                    </div>

                    {/* Spaced repetition buttons */}
                    {flipped[card.id] && (
                      <div className="mt-5">
                        <p className="text-sm text-gray-400 mb-3">
                          How well did you remember this answer?
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                          <button
                            onClick={() => rateCard(card.id, "Again")}
                            className="bg-red-900/50 hover:bg-red-800 text-red-300 p-3 rounded-lg text-sm font-semibold"
                          >
                            Again
                          </button>

                          <button
                            onClick={() => rateCard(card.id, "Hard")}
                            className="bg-orange-900/50 hover:bg-orange-800 text-orange-300 p-3 rounded-lg text-sm font-semibold"
                          >
                            Hard
                          </button>

                          <button
                            onClick={() => rateCard(card.id, "Good")}
                            className="bg-blue-900/50 hover:bg-blue-800 text-blue-300 p-3 rounded-lg text-sm font-semibold"
                          >
                            Good
                          </button>

                          <button
                            onClick={() => rateCard(card.id, "Easy")}
                            className="bg-green-900/50 hover:bg-green-800 text-green-300 p-3 rounded-lg text-sm font-semibold"
                          >
                            Easy
                          </button>

                        </div>
                      </div>
                    )}

                  </div>
                ))}

              </div>
            )}

            {/* Deck actions */}
            <div className="flex flex-wrap gap-3 mt-10">

              <button
                onClick={resetProgress}
                className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-lg font-semibold transition"
              >
                Reset Progress
              </button>

              <button
                onClick={clearDeck}
                className="bg-red-900/50 hover:bg-red-800 text-red-300 px-5 py-3 rounded-lg font-semibold transition"
              >
                Delete Flashcards
              </button>

            </div>

          </section>
        )}

        {/* Empty state */}
        {cards.length === 0 && (
          <div className="mt-10 text-center rounded-2xl border border-gray-800 bg-gray-900 p-10">
            <div className="text-5xl mb-4">🃏</div>

            <h2 className="text-2xl font-bold mb-3">
              Ready to Start Learning?
            </h2>

            <p className="text-gray-400">
              Enter your notes above and generate your first
              set of interactive flashcards.
            </p>
          </div>
        )}

      </main>

      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © 2026 AI Study Assistant. Learn smarter, every day.
      </footer>
    </div>
  );
}

export default Flashcards;
