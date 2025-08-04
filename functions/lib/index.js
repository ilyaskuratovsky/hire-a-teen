"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobInsert = exports.submitJob = void 0;
//import * as v1 from "firebase-functions/v1";
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-functions/v2/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const twilio_1 = __importDefault(require("twilio"));
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
exports.submitJob = functions.https.onRequest(async (req, res) => {
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
    logger.log("xyReceived request to add job:", req.body);
    const jobData = req.body;
    try {
        const dataWithTimestamp = Object.assign(Object.assign({}, jobData), { createdAt: new Date() });
        logger.info("Adding job to firstore", { jobData: dataWithTimestamp });
        const docRef = await db.collection("jobs").add(dataWithTimestamp);
        logger.info("New job created", { jobId: docRef.id });
        res.status(201).json({ success: true, jobId: docRef.id });
    }
    catch (error) {
        logger.error("Error creating job", error);
        res.status(500).send("Failed to create job");
    }
});
exports.jobInsert = (0, firestore_2.onDocumentCreated)({
    document: "jobs/{jobId}",
    secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"], // Include the defined secret here
}, async (event) => {
    var _a, _b;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
    const client = (0, twilio_1.default)(accountSid, authToken);
    const jobId = event.params.jobId;
    const jobData = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data()) !== null && _b !== void 0 ? _b : { type: "Empty" };
    console.log(`🚀 New job created! ID: ${jobId}`);
    console.log("📄 Job Data:", JSON.stringify(jobData, null, 2));
    console.log("twilio: ", JSON.stringify({
        accountSid,
        authToken,
        twilioNumber,
    }));
    try {
        const teensSnapshot = await db.collection("teens").get();
        if (teensSnapshot.empty) {
            console.log("No teens found.");
            return;
        }
        const sendPromises = [];
        teensSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.textMessagingStatus === "allowed" && data.phone) {
                const message = `New job posted: ${jobData.type || "Job"}.\nDetails: ${jobData.notes || ""}`;
                const to = data.phone;
                sendPromises.push(client.messages.create({
                    body: message,
                    from: twilioNumber,
                    to,
                }));
                console.log(`📲 Sending SMS to ${data.phone}`);
            }
            else {
                console.log(`❌ Skipping teen ${doc.id} - Text messaging not allowed or phone number missing.`);
            }
        });
        await Promise.all(sendPromises);
        console.log(`✅ Sent job message to ${sendPromises.length} teens`);
    }
    catch (err) {
        console.error("❌ Failed to fetch teens or send SMS:", err);
    }
    return;
});
//# sourceMappingURL=index.js.map