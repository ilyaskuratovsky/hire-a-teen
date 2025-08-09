import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import db from "./firebase.js"; // Import your Firestore instance

function Job() {
  const { jobid } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const docRef = doc(db, "jobs", jobid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setJob(docSnap.data());
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
    </div>
  );
}

export default Job;
