// // backend/services/googleDrive.js
// import { google } from "googleapis";

// // ✅ Create OAuth2 client with explicit configuration
// const oauth2Client = new google.auth.OAuth2({
//   clientId: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   redirectUri: process.env.GOOGLE_REDIRECT_URI,
// });

// /**
//  * Create authenticated Drive client for a user
//  */
// export const createDriveClient = (tokens) => {
//   const auth = new google.auth.OAuth2({
//     clientId: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     redirectUri: process.env.GOOGLE_REDIRECT_URI,
//   });
//   auth.setCredentials(tokens);
//   return google.drive({ version: "v3", auth });
// };

// /**
//  * Get or create the app's root folder in user's Drive
//  */
// export const getOrCreateAppFolder = async (drive) => {
//   const folderName = "CaseMaster";

//   // Search for existing folder
//   const res = await drive.files.list({
//     q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//     fields: "files(id, name)",
//     spaces: "drive",
//   });

//   if (res.data.files.length > 0) {
//     return res.data.files[0].id;
//   }

//   // Create folder if not exists
//   const folder = await drive.files.create({
//     requestBody: {
//       name: folderName,
//       mimeType: "application/vnd.google-apps.folder",
//     },
//     fields: "id",
//   });

//   return folder.data.id;
// };

// /**
//  * Get or create task-specific folder
//  */
// export const getOrCreateTaskFolder = async (drive, appFolderId, taskId) => {
//   const taskFolderName = `tasks`;

//   // Get or create 'tasks' folder
//   let tasksFolderRes = await drive.files.list({
//     q: `name='${taskFolderName}' and '${appFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//     fields: "files(id)",
//   });

//   let tasksFolderId;
//   if (tasksFolderRes.data.files.length > 0) {
//     tasksFolderId = tasksFolderRes.data.files[0].id;
//   } else {
//     const folder = await drive.files.create({
//       requestBody: {
//         name: taskFolderName,
//         mimeType: "application/vnd.google-apps.folder",
//         parents: [appFolderId],
//       },
//       fields: "id",
//     });
//     tasksFolderId = folder.data.id;
//   }

//   // Get or create specific task folder
//   const specificTaskFolderRes = await drive.files.list({
//     q: `name='${taskId}' and '${tasksFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//     fields: "files(id)",
//   });

//   if (specificTaskFolderRes.data.files.length > 0) {
//     return specificTaskFolderRes.data.files[0].id;
//   }

//   const specificFolder = await drive.files.create({
//     requestBody: {
//       name: taskId,
//       mimeType: "application/vnd.google-apps.folder",
//       parents: [tasksFolderId],
//     },
//     fields: "id",
//   });

//   return specificFolder.data.id;
// };

// /**
//  * Upload file to Google Drive
//  */
// export const uploadFileToDrive = async (drive, file, taskId) => {
//   // Get app folder
//   const appFolderId = await getOrCreateAppFolder(drive);

//   // Get task folder
//   const taskFolderId = await getOrCreateTaskFolder(drive, appFolderId, taskId);

//   // ✅ FIX: Handle buffer from multer memory storage
//   const fileMetadata = {
//     name: file.originalname || file.filename,
//     parents: [taskFolderId],
//   };

//   const media = {
//     mimeType: file.mimetype,
//     body: require("stream").Readable.from(file.buffer), // ← Use buffer, not stream
//   };

//   // Upload file
//   const response = await drive.files.create({
//     requestBody: fileMetadata,
//     media: media,
//     fields: "id, name, mimeType, size, webViewLink, webContentLink",
//   });

//   // Make file accessible via link (anyone with link can view)
//   await drive.permissions.create({
//     fileId: response.data.id,
//     requestBody: {
//       role: "reader",
//       type: "anyone",
//     },
//   });

//   // Get updated file info with sharing link
//   const fileInfo = await drive.files.get({
//     fileId: response.data.id,
//     fields: "id, name, mimeType, size, webViewLink, webContentLink",
//   });

//   return fileInfo.data;
// };

// /**
//  * Delete file from Google Drive
//  */
// export const deleteFileFromDrive = async (drive, fileId) => {
//   await drive.files.delete({ fileId });
//   return true;
// };

// /**
//  * Get file info from Google Drive
//  */
// export const getFileInfo = async (drive, fileId) => {
//   const response = await drive.files.get({
//     fileId,
//     fields: "id, name, mimeType, size, webViewLink, webContentLink",
//   });
//   return response.data;
// };

// /**
//  * Calculate total storage used by user in CaseMaster folder
//  */
// export const calculateUserStorage = async (drive) => {
//   try {
//     const appFolderId = await getOrCreateAppFolder(drive);

//     let totalSize = 0;
//     let pageToken = null;

//     do {
//       const res = await drive.files.list({
//         q: `'${appFolderId}' in parents or mimeType != 'application/vnd.google-apps.folder'`,
//         fields: "nextPageToken, files(size)",
//         pageToken,
//         spaces: "drive",
//       });

//       for (const file of res.data.files) {
//         totalSize += parseInt(file.size || 0);
//       }

//       pageToken = res.data.nextPageToken;
//     } while (pageToken);

//     return totalSize;
//   } catch (error) {
//     console.error("Error calculating storage:", error);
//     return 0;
//   }
// };

// export { oauth2Client };
// backend/services/googleDrive.js
import { google } from "googleapis";
import { Readable } from "stream"; // 👈 1. Import this here

// ✅ Create OAuth2 client with explicit configuration
const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

/**
 * Create authenticated Drive client for a user
 */
export const createDriveClient = (tokens) => {
  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });
  auth.setCredentials(tokens);
  return google.drive({ version: "v3", auth });
};

/**
 * Get or create the app's root folder in user's Drive
 */
export const getOrCreateAppFolder = async (drive) => {
  const folderName = "CaseMaster";

  // Search for existing folder
  const res = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  // Create folder if not exists
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return folder.data.id;
};

/**
 * Get or create task-specific folder
 */
export const getOrCreateTaskFolder = async (drive, appFolderId, taskId) => {
  const taskFolderName = `tasks`;

  // Get or create 'tasks' folder
  let tasksFolderRes = await drive.files.list({
    q: `name='${taskFolderName}' and '${appFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });

  let tasksFolderId;
  if (tasksFolderRes.data.files.length > 0) {
    tasksFolderId = tasksFolderRes.data.files[0].id;
  } else {
    const folder = await drive.files.create({
      requestBody: {
        name: taskFolderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [appFolderId],
      },
      fields: "id",
    });
    tasksFolderId = folder.data.id;
  }

  // Get or create specific task folder
  const specificTaskFolderRes = await drive.files.list({
    q: `name='${taskId}' and '${tasksFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });

  if (specificTaskFolderRes.data.files.length > 0) {
    return specificTaskFolderRes.data.files[0].id;
  }

  const specificFolder = await drive.files.create({
    requestBody: {
      name: taskId,
      mimeType: "application/vnd.google-apps.folder",
      parents: [tasksFolderId],
    },
    fields: "id",
  });

  return specificFolder.data.id;
};

/**
 * Upload file to Google Drive
 */
export const uploadFileToDrive = async (drive, file, taskId) => {
  // Get app folder
  const appFolderId = await getOrCreateAppFolder(drive);

  // Get task folder
  const taskFolderId = await getOrCreateTaskFolder(drive, appFolderId, taskId);

  // ✅ FIX: Handle buffer from multer memory storage
  const fileMetadata = {
    name: file.originalname || file.filename,
    parents: [taskFolderId],
  };

  const media = {
    mimeType: file.mimetype,
    // 👇 2. UPDATED: Use the imported Readable class
    body: Readable.from(file.buffer),
  };

  // Upload file
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, name, mimeType, size, webViewLink, webContentLink",
  });

  // Make file accessible via link (anyone with link can view)
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  // Get updated file info with sharing link
  const fileInfo = await drive.files.get({
    fileId: response.data.id,
    fields: "id, name, mimeType, size, webViewLink, webContentLink",
  });

  return fileInfo.data;
};

/**
 * Delete file from Google Drive
 */
export const deleteFileFromDrive = async (drive, fileId) => {
  await drive.files.delete({ fileId });
  return true;
};

/**
 * Get file info from Google Drive
 */
export const getFileInfo = async (drive, fileId) => {
  const response = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, size, webViewLink, webContentLink",
  });
  return response.data;
};

/**
 * Calculate total storage used by user in CaseMaster folder
 */
export const calculateUserStorage = async (drive) => {
  try {
    const appFolderId = await getOrCreateAppFolder(drive);

    let totalSize = 0;
    let pageToken = null;

    do {
      const res = await drive.files.list({
        q: `'${appFolderId}' in parents or mimeType != 'application/vnd.google-apps.folder'`,
        fields: "nextPageToken, files(size)",
        pageToken,
        spaces: "drive",
      });

      for (const file of res.data.files) {
        totalSize += parseInt(file.size || 0);
      }

      pageToken = res.data.nextPageToken;
    } while (pageToken);

    return totalSize;
  } catch (error) {
    console.error("Error calculating storage:", error);
    return 0;
  }
};

export { oauth2Client };
