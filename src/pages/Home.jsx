
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const features = [
  {
    number: "01",
    icon: "✨",
    title: "AI Notes Simplifier",
    description: "Transform complicated study material into simple explanations.",
    path: "/simplify",
    color: "#60a5fa",
  },
  {
    number: "02",
    icon: "📝",
    title: "Summary Generator",
    description: "Create organized summaries for faster exam preparation.",
    path: "/summary",
    color: "#c4b5fd",
  },
  {
    number: "03",
    icon: "🎯",
    title: "MCQ Generator",
    description: "Generate practice questions and check your knowledge.",
    path: "/mcq",
    color: "#4ade80",
  },
  {
    number: "04",
    icon: "🃏",
    title: "Interactive Flashcards",
    description: "Learn concepts using active recall and spaced repetition.",
    path: "/flashcards",
    color: "#f9a8d4",
  },
  {
    number: "05",
    icon: "🎧",
    title: "AI Podcast",
    description: "Turn your learning material into an audio experience.",
    path: "/podcast",
    color: "#fdba74",
  },
  {
    number: "06",
    icon: "📅",
    title: "Study Planner",
    description: "Organize tasks, deadlines and focused study sessions.",
    path: "/planner",
    color: "#67e8f9",
  },
  {
    number: "07",
    icon: "🤖",
    title: "AI Study Chatbot",
    description: "Ask questions, talk with AI and understand difficult topics.",
    path: "/chatbot",
    color: "#a78bfa",
  },
  {
    number: "08",
    icon: "📊",
    title: "Student Dashboard",
    description: "Monitor your study progress and manage your learning.",
    path: "/dashboard",
    color: "#facc15",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">

        {/* Developer-style Hero */}
        <section className="developer-hero">

          <div className="hero-content">

            <div className="hero-kicker">
              <span className="hero-status-dot" />
              AI LEARNING PLATFORM · SYSTEM ONLINE
            </div>

            <h1 className="hero-heading">
              Your Ideas.
              <span className="hero-gradient-text">
                Your Learning.
              </span>
              Your AI.
            </h1>

            <p className="hero-description">
              A smarter workspace for students. Simplify notes,
              generate quizzes, create flashcards, plan your
              studies and talk with your own AI tutor.
            </p>

            <div className="hero-actions">

              <Link
                to="/dashboard"
                className="hero-button-primary"
              >
                Explore Dashboard →
              </Link>

              <Link
                to="/chatbot"
                className="hero-button-secondary"
              >
                Talk to AI Assistant
              </Link>

            </div>

            <div className="hero-meta">
              <span>✦ 8 Learning Sections</span>
              <span>✦ Local AI Powered</span>
              <span>✦ Built for Students</span>
            </div>

          </div>

          {/* Developer Terminal */}
          <div className="terminal-window">

            <div className="terminal-header">
              <span
                className="terminal-dot"
                style={{ background: "#fb7185" }}
              />

              <span
                className="terminal-dot"
                style={{ background: "#fbbf24" }}
              />

              <span
                className="terminal-dot"
                style={{ background: "#34d399" }}
              />

              <span className="terminal-filename">
                student-workspace.jsx
              </span>
            </div>

            <div className="terminal-body">

              <div className="terminal-line terminal-muted">
                // Welcome to your AI-powered learning workspace
              </div>

              <div className="terminal-line">
                <span className="terminal-purple">const</span>{" "}
                <span className="terminal-blue">student</span> = {"{"}
              </div>

              <div className="terminal-line">
                &nbsp;&nbsp;name:{" "}
                <span className="terminal-green">"Future Developer"</span>,
              </div>

              <div className="terminal-line">
                &nbsp;&nbsp;workspace:{" "}
                <span className="terminal-green">"AI Study Assistant"</span>,
              </div>

              <div className="terminal-line">
                &nbsp;&nbsp;learningMode:{" "}
                <span className="terminal-pink">"Smart"</span>,
              </div>

              <div className="terminal-line">
                &nbsp;&nbsp;tools:{" "}
                <span className="terminal-blue">8</span>,
              </div>

              <div className="terminal-line">
                &nbsp;&nbsp;aiPowered:{" "}
                <span className="terminal-purple">true</span>
              </div>

              <div className="terminal-line">{"};"}</div>

              <br />

              <div className="terminal-line">
                <span className="terminal-purple">function</span>{" "}
                <span className="terminal-blue">startLearning</span>() {"{"}
              </div>

              <div className="terminal-line">
                &nbsp;&nbsp;<span className="terminal-pink">return</span>{" "}
                <span className="terminal-green">"Let's grow! 🚀"</span>;
              </div>

              <div className="terminal-line">{"}"}</div>

              <br />

              <div className="terminal-line terminal-prompt">
                $ npm run learn
              </div>

              <div className="terminal-line terminal-green">
                ✓ AI assistant ready
              </div>

              <div className="terminal-line terminal-green">
                ✓ Learning tools loaded
              </div>

              <div className="terminal-line terminal-green">
                ✓ Your workspace is ready
              </div>

            </div>

            <div className="terminal-footer">
              <span>● LOCAL AI ENVIRONMENT</span>
              <span>READY_</span>
            </div>

          </div>

        </section>

        {/* Learning Tools */}
        <section className="developer-section">

          <div className="text-center">

            <p className="section-kicker">
              YOUR DIGITAL TOOLKIT
            </p>

            <h2 className="section-heading">
              Everything You Need to Learn Better
            </h2>

            <p className="section-description">
              Eight connected tools. One intelligent learning workspace.
            </p>

          </div>

          <div className="developer-feature-grid">

            {features.map((feature) => (
              <Link
                to={feature.path}
                key={feature.path}
                className="developer-feature-card"
                style={{
                  "--accent": feature.color,
                }}
              >

                <div className="feature-topline">

                  <div className="feature-icon">
                    {feature.icon}
                  </div>

                  <span className="feature-number">
                    /{feature.number}
                  </span>

                </div>

                <h3 className="feature-title">
                  {feature.title}
                </h3>

                <p className="feature-description">
                  {feature.description}
                </p>

                <div className="feature-action">
                  <span>EXPLORE TOOL</span>
                  <span>↗</span>
                </div>

              </Link>
            ))}

          </div>

        </section>

        {/* Bottom Call to Action */}
        <section className="developer-cta">

          <div className="text-5xl mb-5">
            🚀
          </div>

          <h2>
            Ready to Upgrade Your Learning?
          </h2>

          <p>
            Take control of your study schedule, explore your AI tools
            and make every learning session count.
          </p>

          <Link
            to="/dashboard"
            className="hero-button-primary"
          >
            Open Your Dashboard →
          </Link>

        </section>

      </main>

      <footer className="border-t border-gray-800 py-7 text-center text-sm">
        <p className="font-bold text-gray-300 mb-2">
          AI STUDY ASSISTANT
        </p>

        <p>
          Designed for smarter learning · Powered by local AI
        </p>

        <p className="mt-2 text-xs">
          © 2026 AI Study Assistant. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default Home;
