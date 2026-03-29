import React, { useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Main from "./Main";
import JobResponse from "./JobResponse";
import ProtectedRoute from "./ProtectedRoute";
import AdminContent from "./AdminContent"; // Import the Admin component
import Login from "./Login"; // Import the Login component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/job/:jobid/:respondentId" element={<JobResponse />} />
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
