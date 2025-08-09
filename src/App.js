import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./Main";
import JobResponse from "./JobResponse";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/job/:jobid/:respondentId" element={<JobResponse />} />
      </Routes>
    </Router>
  );
}

export default App;
