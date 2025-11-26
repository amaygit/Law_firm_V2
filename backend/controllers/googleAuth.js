// // backend/controllers/googleAuth.js - COMPLETE FIXED VERSION
// import { google } from "googleapis";
// import User from "../models/user.js";
// import { encrypt, decrypt } from "../libs/encryption.js";

// // ✅ Validate configuration on startup
// console.log("🔑 Google OAuth Config:");
// console.log(
//   "Client ID:",
//   process.env.GOOGLE_CLIENT_ID
//     ? `✓ Set (${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...)`
//     : "✗ Missing"
// );
// console.log(
//   "Client Secret:",
//   process.env.GOOGLE_CLIENT_SECRET ? "✓ Set" : "✗ Missing"
// );
// console.log("Redirect URI:", process.env.GOOGLE_REDIRECT_URI || "✗ Missing");

// if (
//   !process.env.GOOGLE_CLIENT_ID ||
//   !process.env.GOOGLE_CLIENT_SECRET ||
//   !process.env.GOOGLE_REDIRECT_URI
// ) {
//   console.error("⚠️  ERROR: Google OAuth credentials not configured!");
//   console.error(
//     "Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in .env file"
//   );
// }

// // Scopes required for Google Drive access
// const SCOPES = [
//   "https://www.googleapis.com/auth/drive.file",
//   "https://www.googleapis.com/auth/userinfo.email",
//   "https://www.googleapis.com/auth/userinfo.profile",
// ];

// /**
//  * Generate Google OAuth URL for user to connect their Drive
//  */
// export const getGoogleAuthUrl = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // Validate environment variables
//     if (
//       !process.env.GOOGLE_CLIENT_ID ||
//       !process.env.GOOGLE_CLIENT_SECRET ||
//       !process.env.GOOGLE_REDIRECT_URI
//     ) {
//       console.error("❌ Missing Google OAuth configuration");
//       return res.status(500).json({
//         success: false,
//         message: "Google OAuth not configured. Please contact administrator.",
//       });
//     }

//     console.log(
//       "🔗 Generating auth URL with redirect:",
//       process.env.GOOGLE_REDIRECT_URI
//     );

//     // Create OAuth2 client
//     const oauth2Client = new google.auth.OAuth2({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       redirectUri: process.env.GOOGLE_REDIRECT_URI,
//     });

//     // Generate auth URL with state parameter containing user ID
//     const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

//     const authUrl = oauth2Client.generateAuthUrl({
//       access_type: "offline", // Get refresh token
//       scope: SCOPES,
//       state,
//       prompt: "consent", // Force consent to get refresh token
//       redirect_uri: process.env.GOOGLE_REDIRECT_URI,
//     });

//     console.log("✅ Generated auth URL:", authUrl.substring(0, 100) + "...");

//     res.json({ success: true, authUrl });
//   } catch (error) {
//     console.error("Error generating auth URL:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to generate auth URL" });
//   }
// };

// /**
//  * Handle Google OAuth callback
//  */
// export const googleAuthCallback = async (req, res) => {
//   try {
//     const { code, state } = req.query;

//     console.log("📥 Received OAuth callback");
//     console.log("Code:", code ? "✓ Present" : "✗ Missing");
//     console.log("State:", state ? "✓ Present" : "✗ Missing");

//     if (!code) {
//       console.error("❌ No authorization code received");
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/user/profile?google_error=no_code`
//       );
//     }

//     // Decode state to get user ID
//     let userId;
//     try {
//       const stateData = JSON.parse(Buffer.from(state, "base64").toString());
//       userId = stateData.userId;
//       console.log("✅ User ID from state:", userId);
//     } catch (e) {
//       console.error("❌ Failed to decode state:", e);
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/user/profile?google_error=invalid_state`
//       );
//     }

//     // Create OAuth2 client for token exchange
//     const tokenClient = new google.auth.OAuth2({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       redirectUri: process.env.GOOGLE_REDIRECT_URI,
//     });

//     console.log("🔄 Exchanging code for tokens...");

//     // Exchange code for tokens
//     const { tokens } = await tokenClient.getToken(code);
//     tokenClient.setCredentials(tokens);

//     console.log("✅ Tokens received");
//     console.log("Access token:", tokens.access_token ? "✓" : "✗");
//     console.log("Refresh token:", tokens.refresh_token ? "✓" : "✗");

//     // Get user's Google profile info
//     const oauth2 = google.oauth2({ version: "v2", auth: tokenClient });
//     const { data: profile } = await oauth2.userinfo.get();

//     console.log("✅ Google profile retrieved:", profile.email);

//     // Update user with encrypted tokens
//     await User.findByIdAndUpdate(userId, {
//       "googleDrive.connected": true,
//       "googleDrive.accessToken": encrypt(tokens.access_token),
//       "googleDrive.refreshToken": encrypt(tokens.refresh_token),
//       "googleDrive.tokenExpiry": new Date(tokens.expiry_date),
//       "googleDrive.email": profile.email,
//       "googleDrive.connectedAt": new Date(),
//     });

//     console.log("✅ User updated successfully");

//     // Redirect back to frontend with success
//     res.redirect(
//       `${process.env.FRONTEND_URL}/user/profile?google_connected=true`
//     );
//   } catch (error) {
//     console.error("❌ Google OAuth callback error:", error);
//     console.error("Error details:", error.message);
//     res.redirect(
//       `${process.env.FRONTEND_URL}/user/profile?google_error=auth_failed`
//     );
//   }
// };

// /**
//  * Disconnect Google Drive
//  */
// export const disconnectGoogleDrive = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     await User.findByIdAndUpdate(userId, {
//       "googleDrive.connected": false,
//       "googleDrive.accessToken": null,
//       "googleDrive.refreshToken": null,
//       "googleDrive.tokenExpiry": null,
//       "googleDrive.email": null,
//       "googleDrive.connectedAt": null,
//     });

//     res.json({ success: true, message: "Google Drive disconnected" });
//   } catch (error) {
//     console.error("Error disconnecting Google Drive:", error);
//     res.status(500).json({ success: false, message: "Failed to disconnect" });
//   }
// };

// /**
//  * Check Google Drive connection status
//  */
// export const getGoogleDriveStatus = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const user = await User.findById(userId).select(
//       "googleDrive.connected googleDrive.email googleDrive.connectedAt storageUsed"
//     );

//     res.json({
//       success: true,
//       connected: user.googleDrive?.connected || false,
//       email: user.googleDrive?.email || null,
//       connectedAt: user.googleDrive?.connectedAt || null,
//       storageUsed: user.storageUsed || { bytes: 0 },
//     });
//   } catch (error) {
//     console.error("Error getting Google Drive status:", error);
//     res.status(500).json({ success: false, message: "Failed to get status" });
//   }
// };

// /**
//  * Get valid tokens for a user (refreshes if expired)
//  */
// export const getValidTokens = async (userId) => {
//   const user = await User.findById(userId).select(
//     "+googleDrive.accessToken +googleDrive.refreshToken +googleDrive.tokenExpiry"
//   );

//   if (!user?.googleDrive?.connected) {
//     throw new Error("Google Drive not connected");
//   }

//   const accessToken = decrypt(user.googleDrive.accessToken);
//   const refreshToken = decrypt(user.googleDrive.refreshToken);
//   const tokenExpiry = user.googleDrive.tokenExpiry;

//   // Check if token is expired or will expire in next 5 minutes
//   const isExpired =
//     !tokenExpiry ||
//     new Date(tokenExpiry) < new Date(Date.now() + 5 * 60 * 1000);

//   if (isExpired && refreshToken) {
//     // Create OAuth2 client for token refresh
//     const refreshClient = new google.auth.OAuth2({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       redirectUri: process.env.GOOGLE_REDIRECT_URI,
//     });

//     refreshClient.setCredentials({ refresh_token: refreshToken });

//     try {
//       const { credentials } = await refreshClient.refreshAccessToken();

//       // Update stored tokens
//       await User.findByIdAndUpdate(userId, {
//         "googleDrive.accessToken": encrypt(credentials.access_token),
//         "googleDrive.tokenExpiry": new Date(credentials.expiry_date),
//       });

//       return {
//         access_token: credentials.access_token,
//         refresh_token: refreshToken,
//       };
//     } catch (error) {
//       console.error("Token refresh failed:", error);
//       throw new Error("Failed to refresh Google token");
//     }
//   }

//   return { access_token: accessToken, refresh_token: refreshToken };
// };
// backend/controllers/googleAuth.js - COMPLETE FIXED VERSION
import { google } from "googleapis";
import User from "../models/user.js";
import { encrypt, decrypt } from "../libs/encryption.js";

// ✅ Validate configuration on startup
console.log("🔑 Google OAuth Config:");
console.log(
  "Client ID:",
  process.env.GOOGLE_CLIENT_ID
    ? `✓ Set (${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...)`
    : "✗ Missing"
);
console.log(
  "Client Secret:",
  process.env.GOOGLE_CLIENT_SECRET ? "✓ Set" : "✗ Missing"
);
console.log("Redirect URI:", process.env.GOOGLE_REDIRECT_URI || "✗ Missing");

if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.GOOGLE_REDIRECT_URI
) {
  console.error("⚠️  ERROR: Google OAuth credentials not configured!");
  console.error(
    "Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in .env file"
  );
}

// Scopes required for Google Drive access
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

/**
 * Generate Google OAuth URL for user to connect their Drive
 */
export const getGoogleAuthUrl = async (req, res) => {
  try {
    const userId = req.user._id;

    // Validate environment variables
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REDIRECT_URI
    ) {
      console.error("❌ Missing Google OAuth configuration");
      return res.status(500).json({
        success: false,
        message: "Google OAuth not configured. Please contact administrator.",
      });
    }

    console.log(
      "🔗 Generating auth URL with redirect:",
      process.env.GOOGLE_REDIRECT_URI
    );

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    // Generate auth URL with state parameter containing user ID
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Get refresh token
      scope: SCOPES,
      state,
      prompt: "consent", // Force consent to get refresh token
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    console.log("✅ Generated auth URL:", authUrl.substring(0, 100) + "...");

    res.json({ success: true, authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate auth URL" });
  }
};

/**
 * Handle Google OAuth callback
 */
export const googleAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    console.log("📥 Received OAuth callback");
    console.log("Code:", code ? "✓ Present" : "✗ Missing");
    console.log("State:", state ? "✓ Present" : "✗ Missing");

    if (!code) {
      console.error("❌ No authorization code received");
      return res.redirect(
        `${process.env.FRONTEND_URL}/user/profile?google_error=no_code`
      );
    }

    // Decode state to get user ID
    let userId;
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      userId = stateData.userId;
      console.log("✅ User ID from state:", userId);
    } catch (e) {
      console.error("❌ Failed to decode state:", e);
      return res.redirect(
        `${process.env.FRONTEND_URL}/user/profile?google_error=invalid_state`
      );
    }

    // Create OAuth2 client for token exchange
    const tokenClient = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    console.log("🔄 Exchanging code for tokens...");

    // Exchange code for tokens
    const { tokens } = await tokenClient.getToken(code);
    tokenClient.setCredentials(tokens);

    console.log("✅ Tokens received");
    console.log("Access token:", tokens.access_token ? "✓" : "✗");
    console.log("Refresh token:", tokens.refresh_token ? "✓" : "✗");

    // Get user's Google profile info
    const oauth2 = google.oauth2({ version: "v2", auth: tokenClient });
    const { data: profile } = await oauth2.userinfo.get();

    console.log("✅ Google profile retrieved:", profile.email);

    // Update user with encrypted tokens
    await User.findByIdAndUpdate(userId, {
      "googleDrive.connected": true,
      "googleDrive.accessToken": encrypt(tokens.access_token),
      "googleDrive.refreshToken": encrypt(tokens.refresh_token),
      "googleDrive.tokenExpiry": new Date(tokens.expiry_date),
      "googleDrive.email": profile.email,
      "googleDrive.connectedAt": new Date(),
    });

    console.log("✅ User updated successfully");

    // Redirect back to frontend profile page with success
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?google_connected=true`;
    console.log("🔄 Redirecting to:", redirectUrl);

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Google OAuth callback error:", error);
    console.error("Error details:", error.message);
    res.redirect(
      `${process.env.FRONTEND_URL}/user/profile?google_error=auth_failed`
    );
  }
};

/**
 * Disconnect Google Drive
 */
export const disconnectGoogleDrive = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      "googleDrive.connected": false,
      "googleDrive.accessToken": null,
      "googleDrive.refreshToken": null,
      "googleDrive.tokenExpiry": null,
      "googleDrive.email": null,
      "googleDrive.connectedAt": null,
    });

    res.json({ success: true, message: "Google Drive disconnected" });
  } catch (error) {
    console.error("Error disconnecting Google Drive:", error);
    res.status(500).json({ success: false, message: "Failed to disconnect" });
  }
};

/**
 * Check Google Drive connection status
 */
export const getGoogleDriveStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "googleDrive.connected googleDrive.email googleDrive.connectedAt storageUsed"
    );

    res.json({
      success: true,
      connected: user.googleDrive?.connected || false,
      email: user.googleDrive?.email || null,
      connectedAt: user.googleDrive?.connectedAt || null,
      storageUsed: user.storageUsed || { bytes: 0 },
    });
  } catch (error) {
    console.error("Error getting Google Drive status:", error);
    res.status(500).json({ success: false, message: "Failed to get status" });
  }
};

/**
 * Get valid tokens for a user (refreshes if expired)
 */
export const getValidTokens = async (userId) => {
  const user = await User.findById(userId).select(
    "+googleDrive.accessToken +googleDrive.refreshToken +googleDrive.tokenExpiry"
  );

  if (!user?.googleDrive?.connected) {
    throw new Error("Google Drive not connected");
  }

  const accessToken = decrypt(user.googleDrive.accessToken);
  const refreshToken = decrypt(user.googleDrive.refreshToken);
  const tokenExpiry = user.googleDrive.tokenExpiry;

  if (!accessToken || !refreshToken) {
    console.log(
      "⚠️ Tokens invalid or decryption failed. User needs to reconnect."
    );
    // Return null connected status so UI prompts user to connect again
    await User.findByIdAndUpdate(userId, { "googleDrive.connected": false });
    throw new Error("Google Drive connection invalid - Please reconnect");
  }
  // Check if token is expired or will expire in next 5 minutes
  const isExpired =
    !tokenExpiry ||
    new Date(tokenExpiry) < new Date(Date.now() + 5 * 60 * 1000);

  if (isExpired && refreshToken) {
    // Create OAuth2 client for token refresh
    const refreshClient = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    refreshClient.setCredentials({ refresh_token: refreshToken });

    try {
      const { credentials } = await refreshClient.refreshAccessToken();

      // Update stored tokens
      await User.findByIdAndUpdate(userId, {
        "googleDrive.accessToken": encrypt(credentials.access_token),
        "googleDrive.tokenExpiry": new Date(credentials.expiry_date),
      });

      return {
        access_token: credentials.access_token,
        refresh_token: refreshToken,
      };
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw new Error("Failed to refresh Google token");
    }
  }

  return { access_token: accessToken, refresh_token: refreshToken };
};
