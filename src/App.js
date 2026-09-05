import {
  HashRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Main from "./Main";
import JobResponse from "./JobResponse";
import ProtectedRoute from "./ProtectedRoute";
import AdminContent from "./AdminContent"; // Import the Admin component
import AdminLogin from "./AdminLogin"; // Import the Login component
import AuthPage from "./AuthPage.react"; // Import the AuthPage component
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
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminContent />
            </ProtectedRoute>
          }
        />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
