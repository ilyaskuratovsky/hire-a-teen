//import * as emailjs from "emailjs-com";

// import * as functions from "firebase-functions";
// import * as logger from "firebase-functions/logger";

/*
const emailjs = require("emailjs-com");
const db = getFirestore();

export const sendEmailToAdmins = functions.https.onRequest(async (req, res) => {
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

  try {
    const snapshot = await db.collection("admins").get();
    if (snapshot.empty) {
      res.status(404).send("No admins found");
      return;
    }

    const templateParams = {
      message: req.body.message || "Hello Admins!",
    };
    // Loop through all admins and send
    const sendPromises = snapshot.docs.map((doc) => {
      const data = doc.data();
      if (!data.email) return Promise.resolve();
      return emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_GENERIC_TEMPLATE_ID,
        {
          ...templateParams,
          to_email: data.email,
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY, // optional if using server-to-server
        }
      );
    });

    await Promise.all(sendPromises);

    //res.status(200).send("Emails sent to all admins");
    res.send("ok");
  } catch (err) {
    console.error("Error sending emails:", err);
    res.status(500).send("Internal server error");
  }
});
*/
import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
const { defineSecret } = require("firebase-functions/params");
const EMAILJS_SERVICE_ID = defineSecret("EMAILJS_SERVICE_ID");
const EMAILJS_GENERIC_TEMPLATE_ID = defineSecret("EMAILJS_GENERIC_TEMPLATE_ID");
const EMAILJS_PUBLIC_KEY = defineSecret("EMAILJS_PUBLIC_KEY");
const EMAILJS_PRIVATE_KEY = defineSecret("EMAILJS_PRIVATE_KEY");

export const sendEmailToAdmins = functions.https.onRequest(
  {
    secrets: [
      EMAILJS_SERVICE_ID,
      EMAILJS_GENERIC_TEMPLATE_ID,
      EMAILJS_PUBLIC_KEY,
      EMAILJS_PRIVATE_KEY,
    ],
  },
  async (req, res) => {
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

    logger.log("sendEmailToAdmins Received request", req.body);
    // const emailjs = require("emailjs-com");
    logger.log("1 email js keys:", {
      EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
      EMAILJS_GENERIC_TEMPLATE_ID: process.env.EMAILJS_GENERIC_TEMPLATE_ID,
      EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
      EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY,
    });

    try {
      const templateParams = {
        message: req.body.message || "Hello Admins!",
      };
      /*
      emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_GENERIC_TEMPLATE_ID,
        {
          ...templateParams,
          to_email: "ilyaskuratovsky@gmail.com",
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY, // optional if using server-to-server
        }
      );
      */
      const emailOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_GENERIC_TEMPLATE_ID,
          user_id: "user_" + process.env.EMAILJS_PUBLIC_KEY, // This must be your PUBLIC key
          accessToken: process.env.EMAILJS_PRIVATE_KEY, // This must be your PRIVATE key
          template_params: templateParams,
        }),
      };

      const emailjsres = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        emailOptions
      );
      logger.log("emailOptions: ", emailOptions);

      if (!emailjsres.ok) {
        throw new Error(`EmailJS API error: ${await emailjsres.text()}`);
      }

      res.status(201).json({
        success: true,
        message:
          "response from sendEmailToAdmins 4, key: " +
          process.env.EMAILJS_SERVICE_ID +
          "," +
          process.env.EMAILJS_GENERIC_TEMPLATE_ID +
          "," +
          process.env.EMAILJS_PUBLIC_KEY +
          "," +
          process.env.EMAILJS_PRIVATE_KEY +
          ", " +
          JSON.stringify(templateParams),
        key: process.env.EMAILJS_PUBLIC_KEY,
      });
    } catch (error) {
      logger.error("Error creating job", error);
      res.status(500).send("Failed to send emails");
    }

    res.send("Test email function is running 2"); // must respond
  }
);

/*
export const sendEmailToAdmins = functions.https.onRequest(async (req, res) => {
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

  logger.log("sendEmailToAdmins Received request", req.body);

  try {
    res
      .status(201)
      .json({ success: true, message: "response from sendEmailToAdmins" });
  } catch (error) {
    logger.error("Error creating job", error);
    res.status(500).send("Failed to create teen_job");
  }
});
*/
