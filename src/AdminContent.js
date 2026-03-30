import React from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import AdminTeens from "./AdminTeens";
import AdminTeenEdit from "./AdminTeenEdit";

export default function AdminContent() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <Link to="/admin/teens">Teens</Link>
      </div>

      <Routes>
        <Route index element={<Navigate to="teens" replace />} />
        <Route path="teens" element={<AdminTeens />} />
        <Route path="teens/:teenId" element={<AdminTeenEdit />} />{" "}
      </Routes>
    </div>
  );
}
