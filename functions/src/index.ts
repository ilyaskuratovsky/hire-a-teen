//import * as v1 from "firebase-functions/v1";
import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import twilio from "twilio";

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

export const jobInsert = onDocumentCreated(
  {
    document: "jobs/{jobId}",
    secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"], // Include the defined secret here
  },
  async (event) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER!;
    const client = twilio(accountSid, authToken);
    const jobId = event.params.jobId;
    const jobData = event.data?.data() ?? { type: "Empty" };

    console.log(`🚀 New job created! ID: ${jobId}`);
    console.log("📄 Job Data:", JSON.stringify(jobData, null, 2));
    console.log(
      "twilio: ",
      JSON.stringify({
        accountSid,
        authToken,
        twilioNumber,
      })
    );
    try {
      const teensSnapshot = await db.collection("teens").get();

      if (teensSnapshot.empty) {
        console.log("No teens found.");
        return;
      }

      const sendPromises: Promise<any>[] = [];

      teensSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.textMessagingStatus === "allowed" && data.phone) {
          const message = `New job posted: ${jobData.type || "Job"}.\nDetails: ${jobData.notes || ""}`;
          const to = data.phone;
          sendPromises.push(
            client.messages.create({
              body: message,
              from: twilioNumber,
              to,
            })
          );
          console.log(`📲 Sending SMS to ${data.phone}`);
        } else {
          console.log(
            `❌ Skipping teen ${doc.id} - Text messaging not allowed or phone number missing.`
          );
        }
      });

      await Promise.all(sendPromises);
      console.log(`✅ Sent job message to ${sendPromises.length} teens`);
    } catch (err) {
      console.error("❌ Failed to fetch teens or send SMS:", err);
    }
    return;
  }
);
