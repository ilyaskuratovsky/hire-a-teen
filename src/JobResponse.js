import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import db from "./firebase.js"; // Import your Firestore instance

function JobResponse() {
  const { jobid, respondentId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

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

  async function submitResponse(status) {
    setSubmitting(true);
    setConfirmation(null);
    setError(null);

    alert(
      "Submitting your response..." +
        process.env.REACT_APP_SUBMIT_TEEN_JOB_RESPONSE_URL
    );
    try {
      const response = await fetch(
        process.env.REACT_APP_SUBMIT_TEEN_JOB_RESPONSE_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId: jobid,
            teenId: respondentId,
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setConfirmation(`Response recorded successfully (ID: ${data.teenJobId})`);
    } catch (err) {
      setError("Failed to submit response: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading job data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{JSON.stringify(job)}</h1>
      <h2>Respondent: {respondentId}</h2>

      {confirmation && (
        <p style={{ color: "green", marginBottom: 10 }}>{confirmation}</p>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          disabled={submitting}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: 8,
            backgroundColor: "#28a745",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
          onClick={() => submitResponse("available")}
        >
          I'm available for this job
        </button>

        <button
          disabled={submitting}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: 8,
            backgroundColor: "#dc3545",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
          onClick={() => submitResponse("not available")}
        >
          I am NOT available
        </button>
      </div>
    </div>
  );
}

export default JobResponse;
