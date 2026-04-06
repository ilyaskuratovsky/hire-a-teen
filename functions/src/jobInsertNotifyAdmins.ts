import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { sendTextMessages } from "./util/TextMessaging";
import {
  FirestoreAdminConverter,
  FirestoreJobRequest,
  toFirestoreJobRequest,
} from "./util/FirestoreTypes";

const db = getFirestore();

const TWILIO_ACCOUNT_SID = defineSecret("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = defineSecret("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = defineSecret("TWILIO_PHONE_NUMBER");

export const jobInsertNotifyAdmins = onDocumentCreated(
  {
    document: "jobs/{jobId}",
    secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER],
  },
  async (event) => {
    console.log("jobInsertNotifyAdmins here");
    const jobId = event.params.jobId;
    const jobRequest = toFirestoreJobRequest(jobId, event.data?.data());

    if (!jobRequest) {
      console.error("❌ Could not parse job request", event.data?.data());
      return;
    }

    try {
      await sendNewJobRequestToAdmins(jobRequest);
    } catch (err) {
      console.error("❌ Failed to fetch admins or send SMS:", err);
      throw err;
    }
  },
);

async function sendNewJobRequestToAdmins(
  jobData: FirestoreJobRequest,
): Promise<void> {
  const address = jobData.address || "N/A";
  const message = `Admin: New TeenHelper Job Request (${jobData.type || "N/A"})\n\nAddress:${address}\nDescription:\n${jobData.notes || ""}\n\nhttps://www.teenhelper.com/#/admin/adminjob/${jobData.id}`;

  const adminsSnapshot = await db
    .collection("admins")
    .withConverter(FirestoreAdminConverter)
    .get();

  if (adminsSnapshot.empty) {
    console.log("No admins found.");
    return;
  }

  const messages: Array<{ body: string; to: string }> = [];

  adminsSnapshot.forEach((doc) => {
    const admin = doc.data();
    const phone = admin.phone;
    const textMessagingStatus = admin.textMessagingStatus;
    if (phone && textMessagingStatus === "allowed") {
      messages.push({ body: message, to: phone });
    } else {
      console.log("Not sending message to ${phone}, textMessagingStatus: ${textMessagingStatus}")
    }
  });

  await sendTextMessages(messages, {
    accountSid: TWILIO_ACCOUNT_SID.value(),
    authToken: TWILIO_AUTH_TOKEN.value(),
    twilioNumber: TWILIO_PHONE_NUMBER.value(),
  });
}
