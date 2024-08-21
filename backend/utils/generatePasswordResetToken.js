import crypto from "crypto";
export const generatePasswordResetToken = () => crypto.randomBytes(20).toString("hex");