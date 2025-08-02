import emailjs from "emailjs-com";

const EMAIL_ENABLED = process.env.REACT_APP_EMAIL_ENABLED === "true";
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const USER_ID = process.env.REACT_APP_EMAILJS_USER_ID;

// Wrapper function that returns the emailjs.send promise
export function sendEmail(templateParams) {
  if (!EMAIL_ENABLED) {
    return Promise.resolve("Email sending is disabled.");
  }
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
}
