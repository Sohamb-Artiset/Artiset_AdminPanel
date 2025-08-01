require("dotenv").config();
const { EmailClient } = require("@azure/communication-email");
const emailTemplates = require("./emailTemplates.json");

const connectionString = process.env.AZURE_CONNECTION_STRING;
console.log("CONNECTED TO AZURE STRING",connectionString);
const senderEmail = process.env.SENDER_EMAIL;
console.log("CONNECTED TO AZURE EMAIL",senderEmail);

const emailClient = new EmailClient(connectionString);

// Define email templates

async function sendEmail({ recipientEmail, customSubject, customBody }) {
  if (!recipientEmail || !customSubject || !customBody) {
    throw new Error("Recipient email, subject, and body are required.");
  }

  // const template = emailTemplates[type.toLowerCase()];

  // if (!template) {
  //   throw new Error("Invalid email type provided.");
  // }

  // Convert single email to array if it's not already an array
  const recipients = Array.isArray(recipientEmail) 
    ? recipientEmail.map(email => ({ address: email }))
    : [{ address: recipientEmail }];

  const emailMessage = {
    senderAddress: senderEmail,
    content: {
      subject: customSubject, //admin can now add custom subject directly from frontend also if he wants to 
      html: customBody,
    },
    recipients: { to: recipients },
    // recipients: { to: [{ address: recipientEmail }] },
  };

  try {
    const poller = await emailClient.beginSend(emailMessage);
    const response = await poller.pollUntilDone();
    return { status: "Success", messageId: response.messageId };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = sendEmail;
