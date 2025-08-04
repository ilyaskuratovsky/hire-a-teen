const twilio = require("twilio");

// Usage: node TwilioTest.js <accountSid> <authToken> <twilioNumber> <recipientPhone> <message>
const [
  ,
  ,
  accountSid,
  authToken,
  twilioNumber,
  recipientPhone,
  ...messageParts
] = process.argv;
const message = messageParts.join(" ") || "Test message from TwilioTest.js";

if (!accountSid || !authToken || !twilioNumber || !recipientPhone) {
  console.error(
    "Usage: node TwilioTest.js <accountSid> <authToken> <twilioNumber> <recipientPhone> <message>"
  );
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function sendTestSMS() {
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: recipientPhone,
    });
    console.log("✅ SMS sent! SID:", result.sid);
  } catch (err) {
    console.error("❌ Failed to send SMS:", err);
  }
}

sendTestSMS();
