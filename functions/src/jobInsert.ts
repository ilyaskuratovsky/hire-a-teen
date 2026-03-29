//import * as v1 from "firebase-functions/v1";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import twilio from "twilio";

const db = getFirestore();

/* fires when a new job is created by a customer */
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
      }),
    );

    /** sends text messages to potential teen workers */
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
          const address = removeHouseNumber(jobData.address || "N/A");
          const message = `New TeenHelper Job Request (${jobData.type || "N/A"})\n\nAddress:${address}\nDescription:\n${jobData.notes || ""}\n\nClick Link to Respond: https://www.teenhelper.com/#/job/${jobId}/${doc.id}`;
          const to = data.phone;
          sendPromises.push(
            client.messages.create({
              body: message,
              from: twilioNumber,
              to,
            }),
          );
          console.log(`📲 Sending SMS to ${data.phone}`);
        } else {
          console.log(
            `❌ Skipping teen ${doc.id} - Text messaging not allowed or phone number missing.`,
          );
        }
      });

      await Promise.all(sendPromises);
      console.log(`✅ Sent job message to ${sendPromises.length} teens`);
    } catch (err) {
      console.error("❌ Failed to fetch teens or send SMS:", err);
    }
    return;
  },
);

function removeHouseNumber(address: string): string {
  const words = address.split(" ");
  let result = "";

  for (let i = 0; i < words.length; i++) {
    if (words[i].match(/^[0-9]+$/)) {
      // check if word is a house number
      result += "* ".repeat(words[i].length); // replace with asterisks
    } else {
      result += words[i] + " ";
    }
  }

  return result.trim();
}
