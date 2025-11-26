// // backend/libs/encryption.js
// import CryptoJS from "crypto-js";

// const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// if (!ENCRYPTION_KEY) {
//   console.error("❌ ENCRYPTION_KEY is not set in .env file!");
//   console.error(
//     "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
//   );
//   throw new Error("ENCRYPTION_KEY is required");
// }

// if (ENCRYPTION_KEY.length < 32) {
//   console.warn(
//     "⚠️  WARNING: ENCRYPTION_KEY should be at least 32 characters for better security"
//   );
//   console.warn("Current length:", ENCRYPTION_KEY.length);
// }

// console.log("🔐 Encryption configured with key length:", ENCRYPTION_KEY.length);

// /**
//  * Encrypt sensitive data (like Google Drive links)
//  */
// export const encrypt = (text) => {
//   if (!text) return null;

//   try {
//     // Convert key to proper WordArray format
//     const key = CryptoJS.enc.Utf8.parse(
//       ENCRYPTION_KEY.padEnd(32, "0").substring(0, 32)
//     );
//     const encrypted = CryptoJS.AES.encrypt(text, key, {
//       mode: CryptoJS.mode.ECB,
//       padding: CryptoJS.pad.Pkcs7,
//     }).toString();

//     return encrypted;
//   } catch (error) {
//     console.error("Encryption error:", error);
//     console.error("Key length:", ENCRYPTION_KEY?.length);
//     console.error("Text to encrypt:", text?.substring(0, 50));
//     throw new Error("Failed to encrypt data");
//   }
// };

// /**
//  * Decrypt sensitive data
//  */
// export const decrypt = (encryptedText) => {
//   if (!encryptedText) return null;
//   try {
//     const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
//     const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//     if (!decrypted) {
//       throw new Error("Decryption resulted in empty string");
//     }
//     return decrypted;
//   } catch (error) {
//     console.error("Decryption error:", error);
//     throw new Error("Failed to decrypt data");
//   }
// };

// /**
//  * Encrypt file metadata object
//  */
// export const encryptFileMetadata = (metadata) => {
//   return {
//     ...metadata,
//     fileUrl: encrypt(metadata.fileUrl),
//     driveFileId: encrypt(metadata.driveFileId),
//   };
// };

// /**
//  * Decrypt file metadata object
//  */
// export const decryptFileMetadata = (metadata) => {
//   return {
//     ...metadata,
//     fileUrl: decrypt(metadata.fileUrl),
//     driveFileId: decrypt(metadata.driveFileId),
//   };
// };
// backend/libs/encryption.js
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.error("❌ ENCRYPTION_KEY is not set in .env file!");
  throw new Error("ENCRYPTION_KEY is required");
}

console.log("🔐 Encryption configured");

// ✅ Helper to generate the exact same key format for both encrypt/decrypt
const getKey = () => {
  // Pad the key to 32 chars (256 bits) or cut it if too long
  return CryptoJS.enc.Utf8.parse(
    ENCRYPTION_KEY.padEnd(32, "0").substring(0, 32)
  );
};

/**
 * Encrypt sensitive data
 */
export const encrypt = (text) => {
  if (!text) return null;

  try {
    const key = getKey();
    // ✅ Encrypt using ECB mode (matches your previous intent)
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();

    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return null; // Return null instead of crashing
  }
};

/**
 * Decrypt sensitive data
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;

  try {
    const key = getKey();

    // ✅ FIXED: Use the exact same configuration as encrypt
    const bytes = CryptoJS.AES.decrypt(encryptedText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      // This happens if the key doesn't match the data
      console.warn("⚠️ Decryption produced empty string (Key mismatch?)");
      return null;
    }

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error.message);
    // Return null so the app doesn't crash, allowing the user to re-auth
    return null;
  }
};
