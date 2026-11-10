import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Simplify from "./pages/Simplify";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/simplify" element={<Simplify />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;