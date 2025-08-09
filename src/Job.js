import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import db from "./firebase.js"; // Import your Firestore instance

function Job() {
  const { jobid, respondentId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const docJobRef = doc(db, "jobs", jobid);
        const docJobSnap = await getDoc(docJobRef);

        if (docJobSnap.exists()) {
          setJob(docJobSnap.data());
        } else {
          setError("No such job found.");
        }
      } catch (err) {
        setError("Failed to fetch job: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobid]);

  if (loading) return <p>Loading job data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{JSON.stringify(job)}</h1>
      <h1>Respondent: {respondentId}</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: 8,
            backgroundColor: "#28a745",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => {}}
        >
          I'm available for this job
        </button>

        <button
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: 8,
            backgroundColor: "#dc3545",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => {}}
        >
          I am NOT available
        </button>
      </div>
    </div>
  );
}

export default Job;
