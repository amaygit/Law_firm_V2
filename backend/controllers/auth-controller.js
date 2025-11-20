import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Verification from '../models/verification.js';
import { sendEmail } from '../libs/send-email.js';
import aj from '../libs/arcjet.js';

// ---- EMAIL HTML TEMPLATES ----

// Email verification
const emailVerificationTemplate = (userName, link) => `
  <div style="max-width:540px;margin:40px auto 16px auto;padding:28px 32px 36px 32px;font-family:'Segoe UI',Arial,sans-serif;background:#f7faff;border-radius:12px;border:1px solid #e0e7ef;box-shadow:0 4px 32px #1a6ee017">
    <h2 style="color:#2361d0;font-size:1.42rem;font-weight:900;margin-bottom:16px;letter-spacing:.5px">Welcome to SAAJNA Legal Network</h2>
    <div style="padding:18px 24px;background:#f0f5fe;border-radius:10px;">
      <p style="color:#222;font-size:16px;margin:0 0 13px 0;">Hi <strong style="color:#1c3a78;">${userName}</strong>,</p>
      <p style="color:#333;font-size:15px;margin:0 0 18px 0;">
        Thank you for registering.<br>
        Please verify your email address below to activate your profile and proceed with your application:
      </p>
      <a href="${link}" 
        style="box-shadow:0 2px 10px #2361d035;background:#2666f5;color:white;text-decoration:none;font-size:17px;font-weight:700;
        border-radius:7px;padding:13px 37px;display:inline-block;letter-spacing:.03em;transition:background .16s;margin-bottom:10px;">
        Verify Lawyer Account
      </a>
      <p style="color:#6b7280;margin:18px 0 0 0;font-size:13px;">
        If you didn't sign up, you can ignore this email.
      </p>
    </div>
    <div style="padding:12px 0 0 0;color:#7e8891;font-size:12.8px;margin-top:34px;border-top:1px solid #e1e7f0;text-align:center;">
      SAAJNA &mdash; Secure Legal Workspace | Top-tier lawyer network
    </div>
  </div>
`;

// Password reset
const passwordResetTemplate = (userName, link) => `
  <div style="max-width:500px;margin:36px auto;padding:32px 28px;font-family:Segoe UI,sans-serif;background:#fffbe9;border-radius:12px;border:1px solid #faeab0;box-shadow:0 2px 16px #d9770617">
    <h2 style="color:#d97706;font-weight:800;font-size:1.18rem;margin-bottom:10px">Password Reset Requested</h2>
    <p style="font-size:16px;color:#222;margin-top:12px">Hi <b>${userName}</b>,</p>
    <p style="margin-bottom:14px;color:#884f12">
      You requested to reset your SAAJNA account password.
      Click below to proceed (link valid for 15 minutes):
    </p>
    <a href="${link}"
      style="background:#d97706;color:#fff;text-decoration:none;font-weight:600;border-radius:7px;
        padding:13px 33px;display:inline-block;font-size:15px;box-shadow:0 2px 5px #ea580c10;margin-bottom:14px;margin-top:7px;">
      Reset Password
    </a>
    <p style="color:#b09e6b;font-size:13px;margin-top:28px">
      If you didn't request this, you can ignore this email.<br>
      <span style="color:#c7b08d;">SAAJNA &mdash; Secure Legal Workspace</span>
    </p>
  </div>
`;

// ---- CONTROLLER FUNCTIONS ----

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Email security (ArcJet)
    const decision = await aj.protect(req, { email });
    if (decision.isDenied()) {
      return res.status(403).json({ message: "Invalid email address" });
    }

    // Unique email check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email address already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      isEmailVerified: false
    });

    // Create verification token & save
    const verificationToken = jwt.sign(
      { userId: newUser._id, purpose: "email-verification" },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    await Verification.create({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000)
    });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailSubject = "Verify your email address";
    const emailBody = emailVerificationTemplate(newUser.name, verificationLink);
    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      // Rollback user if email not sent
      await User.findByIdAndDelete(newUser._id);
      await Verification.deleteMany({ userId: newUser._id });
      return res.status(500).json({ message: "Failed to send verification email. Please try again later." });
    }

    res.status(201).json({
      message: "Verification email sent to your email. Please check and verify your account.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.isEmailVerified) {
      const existingVerification = await Verification.findOne({ userId: user._id });
      if (existingVerification && existingVerification.expiresAt > new Date()) {
        return res.status(400).json({
          message: "Email not verified. Please check your email for the verification link"
        });
      } else if (existingVerification) {
        await Verification.findByIdAndDelete(existingVerification._id);
      }
      // Resend verification
      const verificationToken = jwt.sign(
        { userId: user._id, purpose: "email-verification" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      await Verification.create({
        userId: user._id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      });
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const emailSubject = "Verify your email address";
      const emailBody = emailVerificationTemplate(user.name, verificationLink);
      const isEmailSent = await sendEmail(email, emailSubject, emailBody);
      if (!isEmailSent) {
        return res.status(500).json({ message: "Failed to send verification email. Please try again later." });
      }
      return res.status(201).json({
        message: "Verification email sent to your email. Please check and verify your account",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    user.lastLogin = new Date();
    await user.save();

    const userData = user.toObject();
    delete userData.password;
    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) return res.status(401).json({ message: "Unauthorized" });

    const { userId, purpose } = payload;
    if (purpose !== "email-verification") return res.status(401).json({ message: "Unauthorized" });

    const verification = await Verification.findOne({ userId, token });
    if (!verification) return res.status(401).json({ message: "Unauthorized" });
    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) return res.status(401).json({ message: "Token expired" });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (user.isEmailVerified) return res.status(400).json({ message: "Email already verified" });
    user.isEmailVerified = true;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.isEmailVerified) return res.status(400).json({ message: "Please verify your email first" });
    const existingVerification = await Verification.findOne({ userId: user._id });
    if (existingVerification && existingVerification.expiresAt > new Date()) {
      return res.status(400).json({ message: "Reset password request already sent" });
    }
    if (existingVerification && existingVerification.expiresAt < new Date()) {
      await Verification.findByIdAndDelete(existingVerification._id);
    }

    const resetPasswordToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    await Verification.create({
      userId: user._id,
      token: resetPasswordToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    const emailSubject = "Reset your password";
    const emailBody = passwordResetTemplate(user.name, resetPasswordLink);
    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({ message: "Failed to send reset password email" });
    }
    res.status(200).json({ message: "Reset password email sent" });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) return res.status(401).json({ message: "Unauthorized" });

    const { userId, purpose } = payload;
    if (purpose !== "reset-password") return res.status(401).json({ message: "Unauthorized" });

    const verification = await Verification.findOne({ userId, token });
    if (!verification) return res.status(401).json({ message: "Unauthorized" });
    const isTokenExpired = verification.expiresAt < new Date();
    if (isTokenExpired) return res.status(401).json({ message: "Token expired" });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);
    res.status(200).json({ message: "Password reset successful" });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  registerUser,
  loginUser,
  verifyEmail,
  resetPasswordRequest,
  verifyResetPasswordTokenAndResetPassword
};
