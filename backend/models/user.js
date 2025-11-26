// import mongoose, { Schema } from 'mongoose';

// const userSchema = new Schema({

//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,
//     },
//     password: {
//         type: String,
//         required: true,
//         select: false
//     },
//     name: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     profilePicture: {
//         type: String,
//     },
//     isEmailVerified: {
//         type: Boolean,
//         default: false,
//     },
//     lastLogin: {
//         type: Date,
//     },
//     is2FAEnabled: {
//         type: Boolean,
//         default: false,
//     },
//     twoFAOtp: {
//         type: String,
//         select: false,
//     },
//     twoFAOtpExpires: {
//         type: Date,
//         select: false,
//     },
// },{timestamps: true});

// const User = mongoose.model('User', userSchema);

// export default User;
// backend/models/user.js - UPDATED with Google Drive tokens
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    is2FAEnabled: {
      type: Boolean,
      default: false,
    },
    twoFAOtp: {
      type: String,
      select: false,
    },
    twoFAOtpExpires: {
      type: Date,
      select: false,
    },
    // ✅ NEW: Google Drive Integration
    googleDrive: {
      connected: {
        type: Boolean,
        default: false,
      },
      accessToken: {
        type: String,
        select: false, // Don't include by default in queries
      },
      refreshToken: {
        type: String,
        select: false,
      },
      tokenExpiry: {
        type: Date,
        select: false,
      },
      email: {
        type: String, // Google account email (might differ from app email)
      },
      connectedAt: {
        type: Date,
      },
    },
    // ✅ Track total storage used (calculated periodically)
    storageUsed: {
      bytes: { type: Number, default: 0 },
      lastCalculated: { type: Date },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
