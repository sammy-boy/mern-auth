import { mailtrapClient, sender } from "./config.mailtrap.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js";

// Constants
const EMAIL_VERIFICATION_SUBJECT = "Verify your email";
const PASSWORD_RESET_SUBJECT = "Reset your password";
const PASSWORD_RESET_SUCCESS_SUBJECT = "Password reset successful";
const EMAIL_VERIFICATION_CATEGORY = "Email Verification";
const PASSWORD_RESET_CATEGORY = "Password Reset";
const WELCOME_EMAIL_TEMPLATE_UUID = "d7155e06-923e-455d-b902-418de6ee5525";

const COMPANY_NAME = "Auth Tutorial";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipients = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: EMAIL_VERIFICATION_SUBJECT,
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationToken}", verificationToken),
      category: EMAIL_VERIFICATION_CATEGORY,
    });
    console.log("Verification email sent successfully:", response);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipients = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: PASSWORD_RESET_SUBJECT,
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: PASSWORD_RESET_CATEGORY,
    });
    console.log("Password reset email sent successfully:", response);
  } catch (error) {
    console.error(`Error sending password reset email to ${email}:`, error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipients = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      template_uuid: WELCOME_EMAIL_TEMPLATE_UUID,
      template_variables: {
        name: name,
        company_info_name: COMPANY_NAME,
      },
    });
    console.log("Welcome email sent successfully:", response);
  } catch (error) {
    console.error(`Error sending welcome email to ${email}:`, error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email, loginURL) => {
  const recipients = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: PASSWORD_RESET_SUCCESS_SUBJECT,
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{loginURL}", loginURL),
      category: PASSWORD_RESET_CATEGORY,
    });
    console.log("Password reset successfully:", response);
  } catch (error) {
    console.error(`Error sending success password reset email to ${email}:`, error);
    throw new Error(`Failed to send success password reset email: ${error.message}`);
  }
};