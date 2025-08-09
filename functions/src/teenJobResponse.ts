import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

export const teenJobResponse = functions.https.onRequest(async (req, res) => {
  // --- CORS HEADERS ---
  res.set("Access-Control-Allow-Origin", "*"); // Or specify your domain
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed. Use POST.");
    return;
  }

  logger.log("Received teen job response:", req.body);
  const data = req.body;
  const { jobId, teenId, status } = data;

  try {
    const dataWithTimestamp = {
      jobId,
      teenId,
      status,
      createdAt: new Date(),
    };

    logger.info("Inserting teen_job_response", { data: dataWithTimestamp });
    const docRef = await db
      .collection("teen_job_response")
      .add(dataWithTimestamp);
    res.status(201).json({ success: true, teenJobId: docRef.id });
  } catch (error) {
    logger.error("Error creating job", error);
    res.status(500).send("Failed to create teen_job");
  }
});
