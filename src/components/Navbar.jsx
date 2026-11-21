import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Simplify", path: "/simplify" },
  { name: "Summary", path: "/summary" },
  { name: "Exam Answer Generator", path: "/exam-answer" },
  { name: "MCQ Generator", path: "/mcq" },
  { name: "Flashcards", path: "/flashcards" },
  { name: "AI Podcast", path: "/podcast" },
  { name: "Study Planner", path: "/planner" },
  { name: "AI Chatbot", path: "/chatbot" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const commandInput = useRef(null);

  const closeMenu = () => setMenuOpen(false);
  const closeCommand = () => {
    setCommandOpen(false);
    setCommandQuery("");
  };

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
        setMenuOpen(false);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (commandOpen) commandInput.current?.focus();
  }, [commandOpen]);

  const filteredItems = navItems.filter((item) =>
    item.name.toLowerCase().includes(commandQuery.trim().toLowerCase())
  );

  return (
    <>
      <header className="developer-nav">
        <div className="nav-inner">
          <Link to="/" className="brand-link" onClick={closeMenu} aria-label="AI Study Assistant home">
            <span className="brand-icon" aria-hidden="true"><span>✳</span></span>
            <span className="brand-copy">
              <span className="brand-title">AI Study</span>
              <span className="brand-title brand-title-second">Assistant</span>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            {navItems.slice(0, 3).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                {item.name}
              </NavLink>
            ))}
            <a className="nav-link nav-tools-link" href="/#tools">Tools <span>⌄</span></a>
          </nav>

          <div className="nav-actions">
            <button type="button" className="nav-command-trigger" onClick={() => setCommandOpen(true)} aria-label="Open quick navigation">
              <span aria-hidden="true">⌕</span><span className="command-trigger-label">Quick find</span><kbd>Ctrl K</kbd>
            </button>
            <Link to="/simplify" className="nav-cta">Start simplifying <span aria-hidden="true">↗</span></Link>
            <button
              type="button"
              className="nav-mobile-button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        <nav id="mobile-navigation" className={menuOpen ? "nav-mobile-menu open" : "nav-mobile-menu"} aria-label="Mobile navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={closeMenu}
            >
              {item.name}
            </NavLink>
          ))}
          <button type="button" className="mobile-command-cta" onClick={() => { closeMenu(); setCommandOpen(true); }}>
            ⌕ Search all tools <kbd>Ctrl K</kbd>
          </button>
          <Link to="/simplify" className="mobile-nav-cta" onClick={closeMenu}>Start simplifying ↗</Link>
        </nav>
      </header>

      {commandOpen && (
        <div
          className="command-overlay"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeCommand(); }}
        >
          <section className="command-panel" role="dialog" aria-modal="true" aria-labelledby="command-title">
            <div className="command-panel-top">
              <span className="command-mark">⌕</span>
              <div><p id="command-title">QUICK NAVIGATION</p><span>Jump to any part of your study space</span></div>
              <button type="button" className="command-close" onClick={closeCommand} aria-label="Close quick navigation">Esc</button>
            </div>
            <label className="command-search">
              <span aria-hidden="true">⌕</span>
              <input
                ref={commandInput}
                type="search"
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Search tools and pages..."
                aria-label="Search tools and pages"
              />
              <kbd>ESC</kbd>
            </label>
            <div className="command-results">
              <p className="command-results-label">PAGES & TOOLS</p>
              {filteredItems.length ? filteredItems.map((item, index) => (
                <Link key={item.path} to={item.path} className="command-result" onClick={closeCommand}>
                  <span className="command-result-icon">{["⌂", "▦", "✳", "▤", "✍", "◎", "▣", "♫", "◷", "✧"][navItems.indexOf(item)]}</span>
                  <span>{item.name}</span>
                  <kbd>{index === 0 ? "↵" : "↗"}</kbd>
                </Link>
              )) : <p className="command-empty">No matching pages. Try “flashcards” or “planner”.</p>}
            </div>
            <div className="command-panel-footer"><span>TIP</span> Press <kbd>Ctrl</kbd> + <kbd>K</kbd> anytime to open this menu.</div>
          </section>
        </div>
      )}
    </>
  );
}

export default Navbar;
