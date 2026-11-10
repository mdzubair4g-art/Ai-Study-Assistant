
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
  { name: "Chatbot", path: "/chatbot" }
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="developer-nav">
      <div className="nav-inner">
        <Link to="/" className="brand-link">
          <span className="brand-icon">Z</span>

          <span>
            <span className="brand-title">Zubair AI Hub</span>
            <span className="brand-subtitle">
              Learn Smarter. Achieve More.
            </span>
          </span>
        </Link>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className="nav-link"
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <button
          className="nav-mobile-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <nav className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
