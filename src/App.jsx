import "./App.css";

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Load each study workspace only when the learner opens that route.
// This keeps heavier tools such as PDF support out of the homepage bundle.
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Simplify = lazy(() => import("./pages/Simplify"));
const Summary = lazy(() => import("./pages/Summary"));
const ExamAnswer = lazy(() => import("./pages/ExamAnswer"));
const MCQ = lazy(() => import("./pages/MCQ"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const Podcast = lazy(() => import("./pages/Podcast"));
const Planner = lazy(() => import("./pages/Planner"));
const Chatbot = lazy(() => import("./pages/Chatbot"));

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading-mark" aria-hidden="true">✳</span>
      <span className="route-loading-spinner" aria-hidden="true" />
      <p>Preparing your study space…</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simplify" element={<Simplify />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/exam-answer" element={<ExamAnswer />} />
          <Route path="/mcq" element={<MCQ />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
