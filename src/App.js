import {
  HashRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Main from "./Main";
import JobResponse from "./JobResponse";
import JobAdminResponse from "./JobAdminResponse";
import ProtectedRoute from "./ProtectedRoute";
import AdminContent from "./AdminContent"; // Import the Admin component
import Login from "./Login"; // Import the Login component
function App() {
  // Read query param from URL
  const searchParams = new URLSearchParams(window.location.search);
  const doNotSend = ["true", "1", "yes"].includes(
    (searchParams.get("donotsend") || "").toLowerCase(),
  );
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main doNotSend={doNotSend} />} />
        <Route path="/job/:jobid/:respondentId" element={<JobResponse />} />
        <Route path="/adminjob/:jobid" element={<JobAdminResponse />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminContent />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
