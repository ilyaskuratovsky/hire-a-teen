import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export default function AdminJobRequests() {
  const [jobRequests, setJobRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobRequests() {
      try {
        console.log("fetchJobRequests");
        const jobsRef = collection(db, "jobs");
        const q = query(jobsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const rows = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            notes: data.notes || "",
            type: data.type || "",
            preferredContact: Array.isArray(data.preferred_contact)
              ? data.preferred_contact.join(", ")
              : data.preferred_contact || "",
            createdAt: data.createdAt || null,
          };
        });

        rows.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });

        setJobRequests(rows);
      } catch (err) {
        console.error(err);
        setError("Failed to load job requests");
      } finally {
        setLoading(false);
      }
    }

    fetchJobRequests();
  }, []);

  if (loading) return <div>Loading job requests...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Job Requests</h2>
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
              <th style={thStyle}>Created At</th>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Address</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Preferred Contact</th>
              <th style={thStyle}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {jobRequests.length === 0 ? (
              <tr>
                <td style={tdStyle} colSpan={9}>
                  No job requests found
                </td>
              </tr>
            ) : (
              jobRequests.map((job) => (
                <tr key={job.id}>
                  <td style={tdStyle}>{formatFirestoreDate(job.createdAt)}</td>
                  <td style={tdStyle}>{job.id}</td>
                  <td style={tdStyle}>{job.name}</td>
                  <td style={tdStyle}>{job.email}</td>
                  <td style={tdStyle}>{job.phone}</td>
                  <td style={tdStyle}>{job.address}</td>
                  <td style={tdStyle}>{job.type}</td>
                  <td style={tdStyle}>{job.preferredContact}</td>
                  <td style={tdStyle}>{job.notes}</td>
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
