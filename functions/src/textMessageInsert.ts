import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import twilio from "twilio";

const db = getFirestore();

export const textMessageInsert = onDocumentCreated(
  {
    document: "text_messages/{textMessageId}",
    secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
  },
  async (event) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER!;
    const client = twilio(accountSid, authToken);

    const textMessageId = event.params.textMessageId;
    const textMessageData = event.data?.data() ?? {};

    const docRef = db.collection("text_messages").doc(textMessageId);

    console.log(`🚀 New text message created! ID: ${textMessageId}`);
    console.log("📄 Data:", textMessageData);

    try {
      const message = textMessageData.message;
      const to = textMessageData.to;

      if (!message || !to) {
        throw new Error("Missing 'message' or 'to' field");
      }

      // Send SMS
      const result = await client.messages.create({
        body: message,
        from: twilioNumber,
        to,
      });

      console.log("✅ SMS sent:", result.sid);

      // ✅ Update status to "sent"
      await docRef.update({
        status: "sent",
        sentAt: new Date(),
        twilioSid: result.sid,
      });

    } catch (err) {
      console.error("❌ Failed to send text message:", err);

      // ❌ Update status to "error"
      await docRef.update({
        status: "error",
        errorMessage: err instanceof Error ? err.message : String(err),
        failedAt: new Date(),
      });
    }
  }
);