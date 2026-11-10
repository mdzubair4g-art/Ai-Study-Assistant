
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const links = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Simplify", path: "/simplify" },
  { name: "Summary", path: "/summary" },
  { name: "MCQs", path: "/mcq" },
  { name: "Flashcards", path: "/flashcards" },
  { name: "Podcast", path: "/podcast" },
  { name: "Planner", path: "/planner" },
  { name: "AI Chatbot", path: "/chatbot" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `nav-link ${isActive ? "active" : ""}`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="developer-nav">
      <div className="nav-inner">

        <Link
          to="/"
          className="brand-link"
          onClick={closeMenu}
        >
          <div className="brand-icon">
            🧠
          </div>

          <div>
            <div className="brand-title">
              AI Study Assistant
            </div>

            <div className="brand-subtitle">
              Intelligent Learning Platform
            </div>
          </div>
        </Link>

        <div className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={navClass}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          className="nav-mobile-button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>

      <div className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={navClass}
            onClick={closeMenu}
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
