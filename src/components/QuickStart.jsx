import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveStudySource } from "../studyWorkflow";

const studyTools = [
  { path: "/simplify", icon: "✳", label: "Simplify", hint: "Understand it", tone: "peach" },
  { path: "/summary", icon: "▤", label: "Summarize", hint: "Find the key ideas", tone: "lilac" },
  { path: "/exam-answer", icon: "✍", label: "Exam answers", hint: "2, 5 or 10 marks", tone: "butter" },
  { path: "/mcq", icon: "◎", label: "Make a quiz", hint: "Test your knowledge", tone: "mint" },
  { path: "/flashcards", icon: "▣", label: "Flashcards", hint: "Remember more", tone: "butter" },
];

function QuickStart() {
  const [material, setMaterial] = useState("");
  const [selectedTool, setSelectedTool] = useState("/simplify");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const startStudying = (event) => {
    event.preventDefault();
    const source = material.trim();

    if (!source) {
      setError("Add a topic or paste a few notes to get started.");
      return;
    }

    saveStudySource(source);
    navigate(selectedTool);
  };

  return (
    <section className="quick-start-section" aria-labelledby="quick-start-title">
      <div className="quick-start-heading">
        <div>
          <p className="quick-start-kicker"><span aria-hidden="true">✦</span> YOUR NEXT STUDY SESSION</p>
          <h2 id="quick-start-title">What are we learning <span>today?</span></h2>
          <p>Drop in a topic or your class notes. Pick a study tool and get moving.</p>
        </div>
        <div className="quick-start-doodle" aria-hidden="true">little steps, big progress ↗</div>
      </div>

      <form className="quick-start-card" onSubmit={startStudying}>
        <div className="quick-start-input-wrap">
          <label htmlFor="quick-study-material">Your topic or study notes</label>
          <textarea
            id="quick-study-material"
            value={material}
            onChange={(event) => {
              setMaterial(event.target.value);
              if (error) setError("");
            }}
            placeholder="Try “Explain binary search trees” or paste a paragraph from your lecture notes…"
            rows={4}
            maxLength={12000}
          />
          <div className="quick-start-input-meta" aria-live="polite">
            <span className={error ? "quick-start-error" : ""}>{error || "Saved in this browser so you can reuse it across study tools on this device."}</span>
            <span>{material.length.toLocaleString()} / 12,000</span>
          </div>
        </div>

        <div className="quick-start-tools">
          <p className="quick-start-label">Choose your starting point</p>
          <div className="quick-start-tool-grid">
            {studyTools.map((tool) => (
              <button
                type="button"
                key={tool.path}
                className={selectedTool === tool.path
                  ? `quick-start-tool selected ${tool.tone}`
                  : `quick-start-tool ${tool.tone}`}
                onClick={() => setSelectedTool(tool.path)}
                aria-pressed={selectedTool === tool.path}
              >
                <span className="quick-start-tool-icon" aria-hidden="true">{tool.icon}</span>
                <span className="quick-start-tool-copy">
                  <strong>{tool.label}</strong>
                  <small>{tool.hint}</small>
                </span>
                <span className="quick-start-tool-check" aria-hidden="true">
                  {selectedTool === tool.path ? "✓" : "+"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="quick-start-submit-row">
          <p><span aria-hidden="true">✳</span> You can switch tools or edit your notes anytime.</p>
          <button type="submit" className="quick-start-submit">
            Start this session <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>
    </section>
  );
}

export default QuickStart;
