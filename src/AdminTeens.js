import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "./firebase";

export default function AdminTeens() {
  const [teens, setTeens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    async function fetchTeens() {
      try {
        const teensRef = collection(db, "teens");
        const q = query(teensRef);
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
            notes: data.notes || "",
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

  function handleSort(key) {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  }

  function getSortableValue(teen, key) {
    const value = teen[key];

    if (key === "createdAt") {
      if (!value) return 0;
      if (typeof value?.toDate === "function") return value.toDate().getTime();
      if (value?.seconds) return value.seconds * 1000;
      return 0;
    }

    if (key === "textMessagingStatus") {
      return String(value || "").toLowerCase();
    }

    return String(value || "").toLowerCase();
  }

  const sortedTeens = useMemo(() => {
    const sorted = [...teens].sort((a, b) => {
      const aValue = getSortableValue(a, sortConfig.key);
      const bValue = getSortableValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [teens, sortConfig]);

  function renderSortArrow(key) {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  }

  if (loading) return <div>Loading teens...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Teens</h2>
      <Link to="/admin/teens/new">Create New Teen</Link>
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
              <SortableTh label="ID" column="id" onSort={handleSort} renderSortArrow={renderSortArrow} />
              <SortableTh label="Name" column="name" onSort={handleSort} renderSortArrow={renderSortArrow} />
              <SortableTh label="Email" column="email" onSort={handleSort} renderSortArrow={renderSortArrow} />
              <SortableTh label="Phone" column="phone" onSort={handleSort} renderSortArrow={renderSortArrow} />
              <SortableTh label="School" column="school" onSort={handleSort} renderSortArrow={renderSortArrow} />
              <SortableTh label="Interests" column="interests" onSort={handleSort} renderSortArrow={renderSortArrow} />
              <SortableTh
                label="Approved Interests"
                column="approvedInterests"
                onSort={handleSort}
                renderSortArrow={renderSortArrow}
              />
              <SortableTh
                label="Text OK?"
                column="textMessagingStatus"
                onSort={handleSort}
                renderSortArrow={renderSortArrow}
              />
              <SortableTh label="Notes" column="notes" onSort={handleSort} renderSortArrow={renderSortArrow} />
              <SortableTh
                label="Created At"
                column="createdAt"
                onSort={handleSort}
                renderSortArrow={renderSortArrow}
              />
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeens.length === 0 ? (
              <tr>
                <td style={tdStyle} colSpan={11}>
                  No teens found
                </td>
              </tr>
            ) : (
              sortedTeens.map((teen) => {
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
                    <td style={tdStyle}>{teen.notes}</td>
                    <td style={tdStyle}>{formatFirestoreDate(teen.createdAt)}</td>
                    <td style={tdStyle}>
                      <Link
                        to={`/admin/teens/${teen.id}`}
                        style={buttonLinkStyle}
                      >
                        Edit
                      </Link>
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

function SortableTh({ label, column, onSort, renderSortArrow }) {
  return (
    <th
      style={{ ...thStyle, cursor: "pointer", userSelect: "none" }}
      onClick={() => onSort(column)}
    >
      {label} {renderSortArrow(column)}
    </th>
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

const buttonLinkStyle = {
  display: "inline-block",
  padding: "6px 10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  textDecoration: "none",
  color: "#000",
  background: "#f5f5f5",
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