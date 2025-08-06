import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Formatter from "@/pages/Formatter";
import Diff from "@/pages/Diff";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Formatter />} />
        <Route path="/formatter" element={<Formatter />} />
        <Route path="/diff" element={<Diff />} />
      </Routes>
    </Router>
  );
}
