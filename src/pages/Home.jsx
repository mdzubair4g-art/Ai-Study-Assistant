import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const features = [
  {
    number: "01",
    icon: "✦",
    title: "AI Notes Simplifier",
    description: "Turn dense class notes into clear explanations you can actually remember.",
    path: "/simplify",
    color: "#ffb52e",
    tag: "Make it simple",
  },
  {
    number: "02",
    icon: "▤",
    title: "Summary Generator",
    description: "Get the important ideas first, with summaries made for quick revision.",
    path: "/summary",
    color: "#a78bfa",
    tag: "Find the gist",
  },
  {
    number: "03",
    icon: "◎",
    title: "MCQ Generator",
    description: "Test what stuck with smart practice questions and clear explanations.",
    path: "/mcq",
    color: "#64d9b4",
    tag: "Check yourself",
  },
  {
    number: "04",
    icon: "▣",
    title: "Interactive Flashcards",
    description: "Flip through bite-sized prompts and build stronger active recall.",
    path: "/flashcards",
    color: "#ff8e70",
    tag: "Remember more",
  },
  {
    number: "05",
    icon: "♫",
    title: "AI Podcast",
    description: "Give your eyes a break and turn study material into something to listen to.",
    path: "/podcast",
    color: "#73c8ff",
    tag: "Listen & learn",
  },
  {
    number: "06",
    icon: "▦",
    title: "Study Planner",
    description: "Make room for deep work with tasks, deadlines and focused sessions.",
    path: "/planner",
    color: "#f3cf59",
    tag: "Find your rhythm",
  },
  {
    number: "07",
    icon: "✳",
    title: "AI Study Chatbot",
    description: "Ask the questions you were saving for later. Your AI tutor is right here.",
    path: "/chatbot",
    color: "#c69cff",
    tag: "Get unstuck",
  },
  {
    number: "08",
    icon: "↗",
    title: "Student Dashboard",
    description: "See your progress, pick up where you left off and keep moving forward.",
    path: "/dashboard",
    color: "#ff9bc4",
    tag: "Your big picture",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white home-page">
      <Navbar />

      <main className="home-main max-w-7xl mx-auto px-6 py-12 md:py-16">
        <section className="creative-hero">
          <div className="hero-spark hero-spark-one">✳</div>
          <div className="hero-spark hero-spark-two">✦</div>

          <div className="hero-content">
            <div className="hero-kicker">
              <span className="hero-kicker-icon">✦</span>
              YOUR STUDY SIDEKICK, POWERED BY AI
            </div>

            <h1 className="hero-heading">
              Big ideas.
              <span className="hero-heading-highlight">Clear notes.</span>
              <span className="hero-heading-last">Better you.</span>
            </h1>

            <p className="hero-description">
              Less time untangling notes, more time understanding the good stuff.
              Simplify, revise and get back to learning your way.
            </p>

            <div className="hero-actions">
              <Link to="/simplify" className="hero-button-primary">
                Simplify my notes <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/dashboard" className="hero-button-secondary">
                Explore workspace <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="hero-proof">
              <div className="proof-avatars" aria-hidden="true">
                <span>✎</span><span>✦</span><span>⌁</span>
              </div>
              <span>Your all-in-one space to study smarter</span>
            </div>
          </div>

          <div className="hero-art" aria-label="A playful preview of AI-generated study notes">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />

            <div className="floating-note note-left">
              <span className="mini-note-icon">✦</span>
              <span><strong>AI summary</strong><small>Key ideas, made clear</small></span>
            </div>

            <div className="study-sheet">
              <div className="sheet-topline">
                <span className="sheet-label">YOUR STUDY SNAPSHOT</span>
                <span className="sheet-dots">•••</span>
              </div>
              <div className="sheet-title">Today's big idea<span>.</span></div>
              <div className="sheet-line sheet-line-long" />
              <div className="sheet-line sheet-line-mid" />
              <div className="sheet-highlight"><span>✦</span> The simple explanation</div>
              <div className="sheet-line sheet-line-long" />
              <div className="sheet-line sheet-line-short" />
              <div className="sheet-bottom">
                <span className="sheet-check">✓</span>
                <span>Looking good. Keep going!</span>
              </div>
            </div>

            <div className="floating-note note-right">
              <span className="flash-icon">▣</span>
              <span><strong>Flashcard ready</strong><small>One idea at a time</small></span>
            </div>

            <div className="sunburst">✹</div>
            <div className="art-caption">A little more clarity, a lot more confidence.</div>
          </div>

          <div className="hero-bottom-line">
            <span>MAKE SPACE FOR THE “OH, I GET IT!” MOMENTS</span>
            <span className="bottom-line-star">✳</span>
          </div>
        </section>

        <section className="home-tools developer-section" id="tools">
          <div className="tools-heading-row">
            <div>
              <p className="section-kicker">THE STUDY TOOLKIT</p>
              <h2 className="section-heading">Everything clicks, <span>in one place.</span></h2>
              <p className="section-description">
                Eight thoughtful tools to help you go from “where do I start?” to “I've got this.”
              </p>
            </div>
            <div className="tools-heading-sticker" aria-hidden="true">study<br />happy ✳</div>
          </div>

          <div className="developer-feature-grid">
            {features.map((feature) => (
              <Link
                to={feature.path}
                key={feature.path}
                className="developer-feature-card"
                style={{ "--accent": feature.color }}
              >
                <div className="feature-topline">
                  <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                  <span className="feature-number">/{feature.number}</span>
                </div>
                <span className="feature-tag">{feature.tag}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-action">
                  <span>EXPLORE TOOL</span>
                  <span className="feature-arrow" aria-hidden="true">↗</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="creative-cta">
          <div className="cta-confetti cta-confetti-left" aria-hidden="true">✳</div>
          <div className="cta-confetti cta-confetti-right" aria-hidden="true">✦</div>
          <p className="section-kicker">YOUR NEXT “I'VE GOT THIS” STARTS HERE</p>
          <h2>Make studying feel<br /><span>a little more you.</span></h2>
          <p>Pick a tool, bring your notes and let’s make the hard stuff feel lighter.</p>
          <Link to="/dashboard" className="hero-button-primary">
            Open my workspace <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>

      <footer className="creative-footer">
        <div className="footer-brand">
          <span className="footer-brand-mark">✳</span>
          <span>AI Notes Simplifier</span>
        </div>
        <p>Made for curious minds and late-night lightbulb moments.</p>
        <span className="footer-year">© 2026 AI Notes Simplifier</span>
      </footer>
    </div>
  );
}

export default Home;
