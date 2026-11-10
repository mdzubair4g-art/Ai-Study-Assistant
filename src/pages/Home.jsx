import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FeatureCard from "../components/FeatureCard";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="text-center px-6 py-20">
        <h1 className="text-5xl font-bold text-gray-900">
          Study Smarter with
          <span className="text-blue-600"> AI</span>
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Simplify your notes, generate summaries, create MCQs,
          and learn faster with your personal AI study assistant.
        </p>

        <Link
          to="/simplify"
          className="inline-block mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
        >
          Start Studying 🚀
        </Link>
      </main>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Powerful Study Tools
        </h2>

        <p className="text-center text-gray-600 mt-3">
          Everything you need to study smarter and faster.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          <Link to="/simplify">
            <FeatureCard
              icon="📝"
              title="Simplify Notes"
              description="Convert difficult study notes into simple and easy language."
            />
          </Link>

          <FeatureCard
            icon="📄"
            title="Smart Summary"
            description="Turn long notes into short and important summaries."
          />

          <FeatureCard
            icon="❓"
            title="Generate MCQs"
            description="Create practice questions automatically from your notes."
          />

          <FeatureCard
            icon="🧠"
            title="Flashcards"
            description="Generate flashcards to help you revise quickly."
          />
        </div>
      </section>
    </div>
  );
}

export default Home;