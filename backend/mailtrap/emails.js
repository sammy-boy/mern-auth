import { mailtrapClient, sender } from "./config.mailtrap.js"
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"

export  const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{email}]

  try {
    const response = await mailtrapClient.send({
      from:sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationToken}", verificationToken),
      category : "Email Verification"
    })
    console.log("Email sent", response);
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email: ${error}`);  
  }
}