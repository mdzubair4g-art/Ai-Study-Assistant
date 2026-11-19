import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Simplify", path: "/simplify" },
  { name: "Summary", path: "/summary" },
  { name: "MCQ", path: "/mcq" },
  { name: "Flashcards", path: "/flashcards" },
  { name: "Podcast", path: "/podcast" },
  { name: "Planner", path: "/planner" },
  { name: "Chatbot", path: "/chatbot" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="developer-nav">
      <div className="nav-inner">
        <Link to="/" className="brand-link" onClick={closeMenu} aria-label="AI Notes Simplifier home">
          <span className="brand-icon" aria-hidden="true">
            <span>✳</span>
          </span>
          <span className="brand-copy">
            <span className="brand-title">AI Notes</span>
            <span className="brand-title brand-title-second">Simplifier</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <Link to="/simplify" className="nav-cta">
          Start simplifying <span aria-hidden="true">↗</span>
        </Link>

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

      <nav
        id="mobile-navigation"
        className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}
        aria-label="Mobile navigation"
      >
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
        <Link to="/simplify" className="mobile-nav-cta" onClick={closeMenu}>
          Start simplifying ↗
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;
