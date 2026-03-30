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

        const rows = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            school: data.school || "",
            interests: data.interests || "",
            approvedInterests: Array.isArray(data.interest_tags)
              ? data.interest_tags.join(", ")
              : "",
            textMessagingStatus: data.textMessagingStatus || "",
            createdAt: data.createdAt || null,
          };
        });

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
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>School</th>
              <th style={thStyle}>Interests</th>
              <th style={thStyle}>Approved Interests</th>
              <th style={thStyle}>Text OK?</th>
              <th style={thStyle}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {teens.length === 0 ? (
              <tr>
                <td style={tdStyle} colSpan={9}>
                  No teens found
                </td>
              </tr>
            ) : (
              teens.map((teen) => {
                const isAllowed = teen.textMessagingStatus === "allowed";

                return (
                  <tr
                    key={teen.id}
                    style={{
                      backgroundColor: isAllowed ? "#d4edda" : "transparent",
                    }}
                  >
                    <td style={tdStyle}>{teen.id}</td>
                    <td style={tdStyle}>{teen.name}</td>
                    <td style={tdStyle}>{teen.email}</td>
                    <td style={tdStyle}>{teen.phone}</td>
                    <td style={tdStyle}>{teen.school}</td>
                    <td style={tdStyle}>{teen.interests}</td>
                    <td style={tdStyle}>{teen.approvedInterests}</td>
                    <td style={tdStyle}>{teen.textMessagingStatus}</td>
                    <td style={tdStyle}>
                      {formatFirestoreDate(teen.createdAt)}
                    </td>
                  </tr>
                );
              })
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
