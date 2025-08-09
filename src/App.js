import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./Main";
import Job from "./Job";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/job/:jobid" element={<Job />} />
      </Routes>
    </Router>
  );
}

export default App;
