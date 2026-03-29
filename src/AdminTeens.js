import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export default function AdminTeens() {
  const [teens, setTeens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTeens() {
      try {
        const teensRef = collection(db, "teens");
        const q = query(teensRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const rows = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTeens(rows);
      } catch (err) {
        console.error(err);
        setError("Failed to load teens");
      } finally {
        setLoading(false);
      }
    }

    fetchTeens();
  }, []);

  if (loading) return <div>Loading teens...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Teens</h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "12px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Message</th>
              <th style={thStyle}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {teens.length === 0 ? (
              <tr>
                <td style={tdStyle} colSpan={5}>
                  No teens found
                </td>
              </tr>
            ) : (
              teens.map((teen) => (
                <tr key={teen.id}>
                  <td style={tdStyle}>{teen.id}</td>
                  <td style={tdStyle}>{teen.name || ""}</td>
                  <td style={tdStyle}>{teen.email || ""}</td>
                  <td style={tdStyle}>{teen.message || ""}</td>
                  <td style={tdStyle}>{formatFirestoreDate(teen.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "left",
  background: "#f5f5f5",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  verticalAlign: "top",
};

function formatFirestoreDate(value) {
  if (!value) return "";

  if (value?.seconds) {
    return new Date(value.seconds * 1000).toLocaleString();
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  return String(value);
}
