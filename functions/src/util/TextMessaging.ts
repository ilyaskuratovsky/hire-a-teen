import twilio from "twilio";

export async function sendTextMessages(
  messages: Array<{ body: string; to: string }>,
  config: {
    accountSid: string;
    authToken: string;
    twilioNumber: string;
  },
): Promise<void> {
  const client = twilio(config.accountSid, config.authToken);

  const sendPromises = messages.map((message) => {
    console.log(`✅ Sending SMS to phone: ${message.to}`);
    return client.messages.create({
      body: message.body,
      from: config.twilioNumber,
      to: message.to,
    });
  });

  await Promise.all(sendPromises);
  console.log(`✅ Sent job message to ${sendPromises.length} numbers`);
}
