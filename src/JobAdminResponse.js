import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  documentId,
  where,
  addDoc,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";

import db from "./firebase.js";
import { getInterestsForJobType } from "./util/InterestUtils";
import { removeHouseNumber } from "./util/AddressUtils";

function JobAdminResponse() {
  const { jobid } = useParams();
  const [job, setJob] = useState(null);
  const [jobAdminResponse, setJobAdminResponse] = useState(null);
  const [teens, setTeens] = useState([]);
  const [selectedTeenIds, setSelectedTeenIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchJobAdminResponse = useCallback(async () => {
    const jobAdminResponseQuery = query(
      collection(db, "job_admin_responses"),
      where("jobId", "==", jobid),
    );

    const snapshot = await getDocs(jobAdminResponseQuery);
    const firstMatch = snapshot.docs[0];

    setJobAdminResponse(
      firstMatch ? { id: firstMatch.id, ...firstMatch.data() } : null,
    );
  }, [setJobAdminResponse, jobid]);

  useEffect(() => {
    async function fetchData() {
      try {
        const docJobRef = doc(db, "jobs", jobid);
        const docJobSnap = await getDoc(docJobRef);

        if (!docJobSnap.exists()) {
          setError("No such job found.");
          return;
        }

        const jobData = { id: docJobSnap.id, ...docJobSnap.data() };
        setJob(jobData);

        const teensSnapshot = await getDocs(collection(db, "teens"));
        const teensList = teensSnapshot.docs.map((teenDoc) => ({
          id: teenDoc.id,
          ...teenDoc.data(),
        }));
        setTeens(teensList);

        await fetchJobAdminResponse();
      } catch (err) {
        setError("Failed to fetch data: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [jobid, fetchJobAdminResponse]);

  function toggleTeenSelection(teenId) {
    setSelectedTeenIds((prev) => ({
      ...prev,
      [teenId]: !prev[teenId],
    }));
  }

  const handleNotifySelectedTeens = useCallback(async () => {
    const selectedTeenIdArray = Object.keys(selectedTeenIds).filter(
      (id) => selectedTeenIds[id],
    );

    console.log("Selected teen IDs: ", selectedTeenIdArray);

    if (selectedTeenIdArray.length === 0) {
      return;
    }

    const q = query(
      collection(db, "teens"),
      where(documentId(), "in", selectedTeenIdArray),
    );

    const teensSnapshot = await getDocs(q);

    if (teensSnapshot.empty) {
      console.log("No teens found.");
      return;
    }

    teensSnapshot.forEach(async (docSnap) => {
      const teen = docSnap.data();
      const teenId = docSnap.id;
      const address = removeHouseNumber(job.address || "N/A");

      const message = `New TeenHelper Job Request (${job.type || "N/A"})\n\nAddress:${address}\nDescription:\n${job.notes || ""}\n\nClick Link to Respond: https://www.teenhelper.com/#/job/${job.id}/${teenId}`;

      const to = teen.phone;

      try {
        const messageObject = {
          message,
          to,
          createdAt: new Date(),
        };

        // ✅ Create text_message and get ID
        const docRef = await addDoc(
          collection(db, "text_messages"),
          messageObject,
        );
        const textMessageId = docRef.id;

        // ✅ Update job_admin_responses actions array
        await updateDoc(doc(db, "job_admin_responses", jobAdminResponse.id), {
          actions: arrayUnion({
            teenId,
            type: "text_message",
            textMessageId,
          }),
        });
      } catch (error) {
        console.error("Error sending message to", to, ":", error);
      }
      await fetchJobAdminResponse();
      alert("Text messages sent successfully!");
    });
  }, [selectedTeenIds, job, jobAdminResponse, fetchJobAdminResponse]);

  function hasInterest(teen, jobType) {
    const teenTags = teen.interest_tags;
    const jobInterests = getInterestsForJobType(jobType || "");

    if (!Array.isArray(teenTags) || !Array.isArray(jobInterests)) {
      return false;
    }

    const normalizedTeenTags = teenTags.map((t) =>
      String(t).toLowerCase().trim(),
    );

    const normalizedJobInterests = jobInterests.map((t) =>
      String(t).toLowerCase().trim(),
    );

    return normalizedTeenTags.some((tag) =>
      normalizedJobInterests.includes(tag),
    );
  }

  const groupedTeens = useMemo(() => {
    if (!job) {
      return {
        allowedMatchingInterest: [],
        allowedNoMatchingInterest: [],
        textingNotAllowed: [],
      };
    }

    const allowedMatchingInterest = [];
    const allowedNoMatchingInterest = [];
    const textingNotAllowed = [];

    teens.forEach((teen) => {
      const textingAllowed = teen.textMessagingStatus === "allowed";
      const teenHasInterest = hasInterest(teen, job.type);

      if (textingAllowed && teenHasInterest) {
        allowedMatchingInterest.push(teen);
      } else if (textingAllowed && !teenHasInterest) {
        allowedNoMatchingInterest.push(teen);
      } else {
        textingNotAllowed.push(teen);
      }
    });

    return {
      allowedMatchingInterest,
      allowedNoMatchingInterest,
      textingNotAllowed,
    };
  }, [teens, job]);

  if (loading) return <p>Loading job data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const selectedCount = Object.values(selectedTeenIds).filter(Boolean).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div>
        <Job type={job.type} address={job.address} notes={job.notes} />
      </div>

      <div
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            marginBottom: 12,
            color: "#222",
          }}
        >
          Select Teens
        </h2>

        <TeenGroup
          title="1. Matching Interests"
          teens={groupedTeens.allowedMatchingInterest}
          selectedTeenIds={selectedTeenIds}
          jobAdminResponse={jobAdminResponse}
          onToggleTeen={toggleTeenSelection}
        />

        <TeenGroup
          title="2. Not Matching"
          teens={groupedTeens.allowedNoMatchingInterest}
          selectedTeenIds={selectedTeenIds}
          jobAdminResponse={jobAdminResponse}
          onToggleTeen={toggleTeenSelection}
        />

        <button
          onClick={handleNotifySelectedTeens}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 8,
            backgroundColor: "#007bff",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            marginTop: 20,
          }}
        >
          Notify Selected Teens ({selectedCount})
        </button>

        <TeenGroup
          title="3. Texting Not Allowed"
          teens={groupedTeens.textingNotAllowed}
          selectedTeenIds={selectedTeenIds}
          onToggleTeen={toggleTeenSelection}
          jobAdminResponse={jobAdminResponse}
        />
      </div>
    </div>
  );
}

export default JobAdminResponse;

function TeenGroup({
  title,
  teens,
  selectedTeenIds,
  onToggleTeen,
  jobAdminResponse,
}) {
  function getTeenActions(teenId) {
    const actions = jobAdminResponse?.actions;

    if (!Array.isArray(actions)) {
      return [];
    }

    return actions.filter((record) => record?.teenId === teenId);
  }
  function actionToString(action) {
    if (action === "text_message") {
      return "Text Message Sent";
    }
    return action;
  }
  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          fontSize: 18,
          marginBottom: 10,
          color: "#222",
        }}
      >
        {title} ({teens.length})
      </h3>

      {teens.length === 0 ? (
        <p style={{ color: "#666", marginTop: 0 }}>No teens in this group.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {teens.map((teen) => {
            const label =
              teen.name ||
              teen.fullName ||
              teen.firstName ||
              teen.phone ||
              teen.id;

            const teenActions = getTeenActions(teen.id);

            return (
              <label
                key={teen.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!selectedTeenIds[teen.id]}
                  onChange={() => onToggleTeen(teen.id)}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600 }}>{label}</span>
                  {teen.phone && (
                    <span style={{ fontSize: 14, color: "#666" }}>
                      {teen.phone}
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: "#888" }}>
                    textMessagingStatus:{" "}
                    {String(teen.textMessagingStatus || "")}
                  </span>
                  {Array.isArray(teen.interest_tags) && (
                    <span style={{ fontSize: 13, color: "#888" }}>
                      interest_tags: {teen.interest_tags.join(", ")}
                    </span>
                  )}
                  {teenActions.length > 0 ? (
                    <div style={{ marginTop: 4 }}>
                      {teenActions.map((action, index) => (
                        <span
                          key={`${teen.id}-${index}`}
                          style={{
                            fontSize: 13,
                            color: "#007bff",
                            fontWeight: 500,
                            display: "block",
                          }}
                        >
                          {actionToString(action.type)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: 13,
                        color: "#999",
                        fontWeight: 500,
                      }}
                    ></span>
                  )}{" "}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Job({ type, notes, address, activityType }) {
  return (
    <div
      style={{
        width: "100%",
        padding: "16px",
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 22,
          marginBottom: 20,
          color: "#222",
          textAlign: "left",
        }}
      >
        TeenHelper Job Request
      </h1>

      <div
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: "#111",
          textTransform: "capitalize",
          marginBottom: 16,
        }}
      >
        {type}
      </div>

      {activityType && (
        <div
          style={{
            marginBottom: 12,
            fontSize: 16,
            color: "#666",
            fontStyle: "italic",
          }}
        >
          <strong>Activity Type:</strong> {activityType}
        </div>
      )}

      <div
        style={{
          fontSize: 16,
          lineHeight: 1.5,
          color: "#555",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <strong>Address:</strong>
        <p style={{ marginTop: 4 }}>{address}</p>
      </div>

      <div
        style={{
          fontSize: 16,
          lineHeight: 1.5,
          color: "#555",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <strong>Notes:</strong>
        <p style={{ marginTop: 4 }}>{notes}</p>
      </div>
    </div>
  );
}
