import bcryptjs from "bcryptjs";

import { User } from "../models/user.model.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { generatePasswordResetToken } from '../utils/generatePasswordResetToken.js';
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken: verificationToken,
      verificationTokenExpiresAt: Date.now() + VERIFICATION_TOKEN_EXPIRY,
    });

    await user.save();

    //jwt auth token
    generateTokenAndSetCookie(res, user._id);

    //send email verification
    await sendVerificationEmail(user.email, verificationToken)

    return res.status(201).json({
      success: true,
      message: "User ceated successfully",
			user: {
				...user._doc,
				password: undefined
			}
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const login = async (req, res) => {
  const {email, password} = req.body
  
  try {
    const user = await User.findOne({ email })

    if(!user) {
      return res.status(400).json({success: false, message: "Invalid credentials"})
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if(!isPasswordValid) {
      return res.status(400).json({success: false, message: "Invalid credentials"})
    }

    generateTokenAndSetCookie(res, user._id)
    user.lastlogin = Date.now();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        ...user._doc,
        password: undefined
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }

};
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({success: true, message: "Logged out successfully"});
};
export const resendVerificationCode = async (req, res) => {
  const {email} = req.body;

  try {
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + VERIFICATION_TOKEN_EXPIRY;
    user.isVerified = false;
    await user.save();

    //send email verification
    const emailRes = await sendVerificationEmail(user.email, verificationToken)
    
    console.log(emailRes);

    return res.status(201).json({
      success: true,
      message: "Verification email resent",
			user: {
				...user._doc,
				password: undefined
			}
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  console.log(code);

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    const emailRes = await sendWelcomeEmail(user.email, user.name);

    console.log(emailRes);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined // Exclude the password from the response
      },
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during email verification",
    });
  }
};
export const forgotPassword = async (req, res) => {
  const {email} = req.body;

  try {
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const passwordResetToken = generatePasswordResetToken();
    user.resetPasswordToken = passwordResetToken;
    user.resetPasswordExpiresAt = Date.now() + PASSWORD_RESET_TOKEN_EXPIRY;
    await user.save();

    //send forgot password email
    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`
    await sendPasswordResetEmail(user.email, resetPasswordUrl)

    return res.status(201).json({
      success: true,
      message: "Verification email sent",
			user: {
				...user._doc,
				password: undefined
			}
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const resetPassword = async (req, res) => {
  const {token} = req.params;
  const {password} = req.body;

  try {
    
    const user = await User.findOne({ 
      resetPasswordToken : token,
      resetPasswordExpiresAt : {$gt: Date.now()}  
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    //send reset success email
    const loginUrl = `${process.env.CLIENT_URL}/login`
    await sendResetSuccessEmail(user.email, loginUrl)

    return res.status(201).json({
      success: true,
      message: "Password reset successfully",
			user: {
				...user._doc,
				password: undefined
			}
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const checkAuth = async (req, res) => {

  try {
    
    const user = await User.findById(req.userId).select("-password"); //avoid password: undefined in return

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
			user
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
