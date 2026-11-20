import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import QuickStart from "../components/QuickStart";

const features = [
  { number: "01", icon: "✳", title: "AI Notes Simplifier", description: "Turn dense lecture notes into clear, approachable explanations.", path: "/simplify", color: "#ff8a65", tag: "Understand", detail: "Plain-language explanations" },
  { number: "02", icon: "▤", title: "Summary Generator", description: "Pull the essential ideas into a focused, revision-ready summary.", path: "/summary", color: "#8a72df", tag: "Find the signal", detail: "Quick revision notes" },
  { number: "03", icon: "◎", title: "MCQ Generator", description: "Create practice questions, check your answers and see your score.", path: "/mcq", color: "#4aa98a", tag: "Test your recall", detail: "Answers and explanations" },
  { number: "04", icon: "▣", title: "Interactive Flashcards", description: "Build a deck from your material and revise one idea at a time.", path: "/flashcards", color: "#e77a9d", tag: "Remember", detail: "Flip and review cards" },
  { number: "05", icon: "♫", title: "AI Podcast", description: "Turn study material into a listening script with spoken playback.", path: "/podcast", color: "#4c94d7", tag: "Listen", detail: "Browser voice playback" },
  { number: "06", icon: "▦", title: "Study Planner", description: "Organize deadlines, daily tasks and focused study sessions.", path: "/planner", color: "#d49b32", tag: "Stay on track", detail: "Tasks and focus timer" },
  { number: "07", icon: "✧", title: "AI Study Chatbot", description: "Ask follow-up questions and chat with context from uploaded PDFs.", path: "/chatbot", color: "#7c91d7", tag: "Get unstuck", detail: "PDF-aware study chat" },
  { number: "08", icon: "↗", title: "Student Dashboard", description: "See your saved learning activity, tasks and review progress.", path: "/dashboard", color: "#d47c58", tag: "See your progress", detail: "Your learning overview" },
];

const workflow = [
  { number: "01", icon: "↥", title: "Bring your notes", description: "Start with class notes or study material.", path: "/simplify", tone: "peach" },
  { number: "02", icon: "✦", title: "Make it clear", description: "Simplify difficult ideas and create a summary.", path: "/summary", tone: "lilac" },
  { number: "03", icon: "◎", title: "Build practice", description: "Turn the topic into questions and flashcards.", path: "/mcq", tone: "mint" },
  { number: "04", icon: "▣", title: "Recall it", description: "Review cards and strengthen what you know.", path: "/flashcards", tone: "butter" },
  { number: "05", icon: "↗", title: "Keep moving", description: "Plan your next session and review activity.", path: "/dashboard", tone: "blue" },
];

function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white home-page">
      <Navbar />

      <main className="home-main max-w-7xl mx-auto px-6 py-12 md:py-16">
        <section className="creative-hero">
          <div className="hero-spark hero-spark-one" aria-hidden="true">✳</div>
          <div className="hero-spark hero-spark-two" aria-hidden="true">✦</div>

          <div className="hero-content">
            <div className="hero-kicker">
              <span className="hero-kicker-icon">✦</span>
              YOUR PERSONAL AI STUDY SPACE
            </div>

            <p className="hero-eyebrow">LESS DECIPHERING. MORE DISCOVERING.</p>
            <h1 className="hero-heading">
              Make complex
              <span className="hero-heading-highlight">notes feel simple.</span>
              <span className="hero-heading-last">Make learning stick.</span>
            </h1>

            <p className="hero-description">
              One thoughtful workspace to understand your notes, create study material,
              practise active recall and keep your learning moving.
            </p>

            <div className="hero-actions">
              <Link to="/simplify" className="hero-button-primary">
                Start with your notes <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/dashboard" className="hero-button-secondary">
                Open study workspace <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="hero-proof">
              <span className="proof-dot" aria-hidden="true">✳</span>
              <span>Eight focused tools. One calmer way to study.</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Illustrative preview of a study workspace">
            <div className="hero-art-label">A BETTER WAY TO STUDY <span>✦</span></div>
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />

            <div className="workspace-window">
              <div className="workspace-topbar">
                <div className="workspace-brand"><span>✳</span> Study workspace</div>
                <div className="workspace-window-dots"><i /><i /><i /></div>
              </div>
              <div className="workspace-content">
                <div className="workspace-sidebar">
                  <span className="sidebar-mark active">✦</span>
                  <span className="sidebar-mark">▤</span>
                  <span className="sidebar-mark">◎</span>
                  <span className="sidebar-mark">▣</span>
                </div>
                <div className="workspace-document">
                  <span className="document-label">SAMPLE STUDY SNAPSHOT</span>
                  <h3>Photosynthesis<span>.</span></h3>
                  <p className="document-intro">How plants turn light into energy</p>
                  <div className="document-lines"><i /><i /><i className="short" /></div>
                  <div className="document-callout">
                    <span>✦</span>
                    <div><strong>In simple words</strong><small>Plants use sunlight to make their own food.</small></div>
                  </div>
                  <div className="document-bottom"><span>✓ Clear explanation</span><span>•••</span></div>
                </div>
              </div>
              <div className="workspace-status"><span className="status-pulse" /> Your study space is ready</div>
            </div>

            <div className="floating-note note-left">
              <span className="mini-note-icon">✦</span>
              <span><strong>Summary ready</strong><small>Key ideas, made clear</small></span>
            </div>
            <div className="floating-note note-right">
              <span className="flash-icon">▣</span>
              <span><strong>Flashcards</strong><small>Ready for review</small></span>
            </div>
            <div className="sunburst" aria-hidden="true">✹</div>
            <div className="art-caption">A little more clarity. A lot more confidence.</div>
          </div>

          <div className="hero-bottom-line">
            <span>BUILT FOR THE “OH, NOW I GET IT” MOMENTS</span>
            <span className="bottom-line-star">✳</span>
          </div>
        </section>

        <QuickStart />

        <section className="home-tools developer-section" id="tools">
          <div className="tools-heading-row">
            <div>
              <p className="section-kicker">THE STUDY TOOLKIT</p>
              <h2 className="section-heading">Eight ways to get <span>unstuck.</span></h2>
              <p className="section-description">
                Choose the kind of help you need right now. Your next step is always close by.
              </p>
            </div>
            <div className="tools-heading-sticker" aria-hidden="true">less stress<br />more aha ✳</div>
          </div>

          <div className="developer-feature-grid">
            {features.map((feature, index) => (
              <Link
                to={feature.path}
                key={feature.path}
                className={"developer-feature-card feature-card-" + (index + 1)}
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
                  <span>{feature.detail}</span>
                  <span className="feature-arrow" aria-hidden="true">↗</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="flow-section" id="how-it-works">
          <div className="flow-heading">
            <div>
              <p className="section-kicker">A WORKFLOW THAT MAKES SENSE</p>
              <h2 className="section-heading">From raw notes to <span>real recall.</span></h2>
            </div>
            <p className="section-description">Move through a study loop that turns reading into doing.</p>
          </div>
          <div className="flow-grid">
            {workflow.map((step, index) => (
              <div className="flow-step-wrap" key={step.number}>
                <Link to={step.path} className={"flow-step flow-" + step.tone}>
                  <div className="flow-step-top"><span>{step.number}</span><span className="flow-step-icon">{step.icon}</span></div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <span className="flow-step-link">Explore step <b>↗</b></span>
                </Link>
                {index < workflow.length - 1 && <span className="flow-connector" aria-hidden="true">→</span>}
              </div>
            ))}
          </div>
          <div className="flow-note"><span>✳</span> Each step opens the tool you need. Use your notes as the thread connecting your study session.</div>
        </section>

        <section className="sample-section">
          <div className="sample-copy">
            <p className="section-kicker">A QUICK LOOK INSIDE</p>
            <h2 className="section-heading">One topic.<br /><span>More ways to learn it.</span></h2>
            <p className="section-description">
              Your material can become an explanation, a practice question or a flashcard.
              Start with a tool and shape the session around how you learn.
            </p>
            <Link to="/simplify" className="text-link">Try it with your own notes <span>↗</span></Link>
            <span className="sample-disclaimer">Illustrative sample content — not a live AI result.</span>
          </div>
          <div className="sample-board">
            <div className="sample-board-header"><span>✳ STUDY PREVIEW</span><span className="sample-pill">SAMPLE CONTENT</span></div>
            <div className="sample-topic">
              <span className="sample-topic-icon">🌱</span>
              <div><small>TOPIC</small><strong>Photosynthesis</strong></div>
              <span className="sample-topic-chip">Biology</span>
            </div>
            <div className="sample-output-grid">
              <article className="sample-output summary-output">
                <span className="output-icon">✦</span><small>01 / UNDERSTAND</small>
                <h3>The big idea</h3>
                <p>Plants use light energy to turn water and carbon dioxide into glucose.</p>
                <span className="output-foot">Simplified explanation</span>
              </article>
              <article className="sample-output quiz-output">
                <span className="output-icon">◎</span><small>02 / PRACTISE</small>
                <h3>Quick check</h3>
                <p>Which pigment helps plants absorb light?</p>
                <span className="sample-answer">A. Chlorophyll <b>✓</b></span>
                <span className="output-foot">Practice question preview</span>
              </article>
              <article className="sample-output card-output">
                <span className="output-icon">▣</span><small>03 / REMEMBER</small>
                <h3>Flashcard</h3>
                <p>What is the main energy source for photosynthesis?</p>
                <span className="sample-answer sample-answer-soft">Reveal answer →</span>
                <span className="output-foot">Active recall preview</span>
              </article>
            </div>
          </div>
        </section>

        <section className="capabilities-section">
          <div className="capabilities-heading">
            <p className="section-kicker">MADE TO FIT REAL STUDY DAYS</p>
            <h2 className="section-heading">Thoughtful tools.<br /><span>Useful little details.</span></h2>
          </div>
          <div className="capabilities-grid">
            <article className="capability-item">
              <span className="capability-number">01</span><span className="capability-icon peach">文</span>
              <h3>Study in your language</h3>
              <p>Generate notes and summaries in supported languages, including English, Hindi, Kannada, Tamil and Telugu.</p>
            </article>
            <article className="capability-item">
              <span className="capability-number">02</span><span className="capability-icon lavender">◉</span>
              <h3>Bring your PDFs</h3>
              <p>Upload a study PDF to the chatbot and ask questions with that document as context.</p>
            </article>
            <article className="capability-item">
              <span className="capability-number">03</span><span className="capability-icon mint">♫</span>
              <h3>Listen as you revise</h3>
              <p>Use your browser’s available speech voices to listen to generated study scripts and explanations.</p>
            </article>
          </div>
        </section>

        <section className="creative-cta">
          <div className="cta-confetti cta-confetti-left" aria-hidden="true">✳</div>
          <div className="cta-confetti cta-confetti-right" aria-hidden="true">✦</div>
          <p className="section-kicker">YOUR NEXT “I'VE GOT THIS” STARTS HERE</p>
          <h2>Bring the notes.<br /><span>Leave with a plan.</span></h2>
          <p>Start with one topic. Make it clearer, practise it and keep your momentum going.</p>
          <Link to="/simplify" className="hero-button-primary">
            Simplify my first topic <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>

      <footer className="creative-footer">
        <div className="footer-brand">
          <span className="footer-brand-mark">✳</span>
          <span>AI Study Assistant</span>
        </div>
        <p>Made for curious minds and late-night lightbulb moments.</p>
        <div className="footer-links"><Link to="/dashboard">Dashboard</Link><Link to="/planner">Planner</Link><Link to="/chatbot">AI tutor</Link></div>
        <span className="footer-year">© 2026 AI Study Assistant</span>
      </footer>
    </div>
  );
}

export default Home;
