import emailjs from "emailjs-com";

const SERVICE_ID = "service_9jynhfj";
const TEMPLATE_ID = "template_7c6kzgr";
const USER_ID = "fbF9XXilrLgIe1NID";

const EMAIL_ENABLED = process.env.REACT_APP_EMAIL_ENABLED === "true";

// Wrapper function that returns the emailjs.send promise
export function sendEmail(templateParams) {
  if (!EMAIL_ENABLED) {
    return Promise.resolve("Email sending is disabled.");
  }
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
}
