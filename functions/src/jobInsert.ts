import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import twilio from "twilio";
import { getInterestsForJobType } from "./util/InterestUtils";

const db = getFirestore();

/* fires when a new job is created by a customer */
export const jobInsert = onDocumentCreated(
  {
    document: "jobs/{jobId}",
    secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
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
      const jobInterests = getInterestsForJobType(jobData.type || "");

      teensSnapshot.forEach((doc) => {
        const data = doc.data();
        const teenApprovedInterests: string[] = Array.isArray(
          data.interest_tags,
        )
          ? data.interest_tags
          : [];

        const hasMatchingInterest =
          jobInterests.length > 0 &&
          teenApprovedInterests.some((interest) =>
            jobInterests.includes(String(interest).toLowerCase()),
          );
        const approvedForAll = teenApprovedInterests.includes("all");
        if (
          data.textMessagingStatus === "allowed" &&
          data.phone &&
          (hasMatchingInterest || approvedForAll)
        ) {
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

          console.log(
            `✅ Sending SMS to phone: ${to}, message: ${message} teen ${doc.id} - textMessagingStatus: ${data.textMessagingStatus}, phone: ${data.phone}, teenApprovedInterests: ${teenApprovedInterests}, jobInterests: ${jobInterests}`,
          );
        } else {
          console.log(
            `❌ Skipping teen ${doc.id} - textMessagingStatus: ${data.textMessagingStatus}, phone: ${data.phone}, teenApprovedInterests: ${teenApprovedInterests}, jobInterests: ${jobInterests}`,
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
      continue;
    } else {
      result += words[i] + " ";
    }
  }

  return result.trim();
}
