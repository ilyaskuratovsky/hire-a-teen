import * as functions from "firebase-functions";

export const twilioStatusCallback = functions.https.onRequest(
  async (req, res) => {
    // Twilio sends POST requests, so parse req.body
    const messageSid = req.body.MessageSid;
    const messageStatus = req.body.MessageStatus;
    const errorCode = req.body.ErrorCode;
    const errorMessage = req.body.ErrorMessage;

    console.log(`Message SID: ${messageSid}`);
    console.log(`Status: ${messageStatus}`);
    if (errorCode) {
      console.error(`Error Code: ${errorCode}`);
      console.error(`Error Message: ${errorMessage}`);
    }

    // Respond quickly with 200 OK to Twilio
    res.status(200).send("Status received");
  }
);
