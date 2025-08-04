//import * as v1 from "firebase-functions/v1";
import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

initializeApp();

const db = getFirestore();

export const submitJob = functions.https.onRequest(async (req, res) => {
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

  logger.log("xyReceived request to add job:", req.body);
  const jobData = req.body;

  try {
    const dataWithTimestamp = {
      ...jobData,
      createdAt: new Date(),
    };

    logger.info("Adding job to firstore", { jobData: dataWithTimestamp });
    const docRef = await db.collection("jobs").add(dataWithTimestamp);
    logger.info("New job created", { jobId: docRef.id });
    res.status(201).json({ success: true, jobId: docRef.id });
  } catch (error) {
    logger.error("Error creating job", error);
    res.status(500).send("Failed to create job");
  }
});

export const jobInsert = onDocumentCreated("jobs/{jobId}", async (event) => {
  const jobId = event.params.jobId;
  const jobData = event.data?.data();

  console.log(`🚀 New job created! ID: ${jobId}`);
  console.log("📄 Job Data:", JSON.stringify(jobData, null, 2));

  try {
    const teensSnapshot = await db.collection("teens").get();

    if (teensSnapshot.empty) {
      console.log("No teens found.");
      return;
    }

    teensSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`👤 Teen ID: ${doc.id}`, data);
    });
  } catch (err) {
    console.error("❌ Failed to fetch teens:", err);
  }

  return;
});
