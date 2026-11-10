
import "./aiProxy";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Simplify from "./pages/Simplify";
import Summary from "./pages/Summary";
import MCQ from "./pages/MCQ";
import Flashcards from "./pages/Flashcards";
import Podcast from "./pages/Podcast";
import Planner from "./pages/Planner";
import Chatbot from "./pages/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/simplify" element={<Simplify />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/mcq" element={<MCQ />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
