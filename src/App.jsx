import "./App.css";

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

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

function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-3xl border border-purple-800/40 bg-gray-900 p-8 text-center shadow-2xl shadow-purple-950/30">
        <p className="mb-3 text-xs font-bold tracking-[.22em] text-purple-300">404 / PAGE NOT FOUND</p>
        <h1 className="mb-3 text-3xl font-extrabold md:text-4xl">This page isn’t in your study space.</h1>
        <p className="mb-7 leading-7 text-gray-400">
          The link may be outdated or the page may have moved. Your study material is still safe in this browser.
        </p>
        <Link to="/" className="inline-flex rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-500">
          Back to home ↗
        </Link>
      </section>
    </main>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
