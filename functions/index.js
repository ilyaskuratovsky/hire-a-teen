/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.notifyTeensOnNewJob = functions.firestore
  .document("jobs/{jobId}")
  .onCreate(async (snap, context) => {
    try {
      const teensSnapshot = await db.collection("teens").get();

      const sendPromises = [];

      teensSnapshot.forEach((doc) => {
        const teen = doc.data();
        if (teen.phone) {
        }
      });

      await Promise.all(sendPromises);
      console.log(`Sent job message to ${sendPromises.length} teens`);
    } catch (error) {
      console.error("Error sending messages:", error);
    }
  });
