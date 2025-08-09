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

      setConfirmation(
        `Thank you! Your response has been recorded as "${status === "available" ? "Available" : "Not Available"}".`
      );
    } catch (err) {
      setError("Failed to submit response: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading job data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (confirmation) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 50,
        }}
      >
        <p style={{}}>{confirmation}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        //backgroundColor: "orange",
      }}
    >
      <div
        style={
          {
            //backgroundColor: "cyan"
          }
        }
      >
        <Job type={job.type} address={job.address} notes={job.notes} />
      </div>

      <div
        style={{
          //backgroundColor: "blue",
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            disabled={submitting}
            style={{
              flex: 1,
              padding: "16px",
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
    </div>
  );
}

export default JobResponse;

function Job({ type, notes, address, activityType }) {
  return (
    <div
      style={{
        width: "100%",
        //width: "95%", // take 90% of viewport width
        //margin: "20px auto",
        padding: "16px",
        boxSizing: "border-box", // include padding in width calculation        borderRadius: 12,
        //boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        //backgroundColor: "#fff",
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
