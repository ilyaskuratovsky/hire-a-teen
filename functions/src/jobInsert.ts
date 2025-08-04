//import * as v1 from "firebase-functions/v1";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import twilio from "twilio";

const db = getFirestore();

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
