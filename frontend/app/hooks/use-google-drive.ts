// frontend/app/hooks/use-google-drive.ts
// frontend/app/hooks/use-google-drive.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// 👇 Import uploadFile here
import { fetchData, postData, deleteData, uploadFile } from "@/lib/fetch-util";

interface GoogleDriveStatus {
  connected: boolean;
  email: string | null;
  connectedAt: string | null;
  storageUsed: {
    bytes: number;
    lastCalculated: string | null;
  };
}

interface StorageUsage {
  totalSizeBytes: number;
  totalSizeMB: number;
  totalSizeGB: number;
  totalFiles: number;
  connected: boolean;
}

interface TaskFile {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  uploaderEmail: string;
  uploadedAt: string;
  canDelete: boolean;
}

// Get Google Drive connection status
export const useGoogleDriveStatus = () => {
  return useQuery<{ success: boolean } & GoogleDriveStatus>({
    queryKey: ["google-drive-status"],
    queryFn: () => fetchData("/google-drive/auth/status"),
    staleTime: 30000,
  });
};

// Get Google OAuth URL
export const useGetGoogleAuthUrl = () => {
  return useMutation({
    mutationFn: () => fetchData("/google-drive/auth/url"),
  });
};

// Disconnect Google Drive
export const useDisconnectGoogleDrive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postData("/google-drive/auth/disconnect", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-drive-status"] });
      queryClient.invalidateQueries({ queryKey: ["google-drive-storage"] });
    },
  });
};

// Get storage usage
export const useGoogleDriveStorage = () => {
  return useQuery<{ success: boolean; usage: StorageUsage }>({
    queryKey: ["google-drive-storage"],
    queryFn: () => fetchData("/google-drive/storage"),
    refetchInterval: 60000,
    staleTime: 30000,
  });
};

// Get task files
export const useTaskFiles = (taskId: string) => {
  return useQuery<{ success: boolean; files: TaskFile[] }>({
    queryKey: ["task-files", taskId],
    queryFn: () => fetchData(`/google-drive/files/${taskId}`),
    enabled: !!taskId,
  });
};

// Upload file to Google Drive
export const useUploadToGoogleDrive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 👇 UPDATED: Use the helper that handles tokens correctly
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      return uploadFile(`/google-drive/upload/${taskId}`, file);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-files", variables.taskId],
      });
      queryClient.invalidateQueries({ queryKey: ["google-drive-storage"] });
    },
  });
};

// Delete file
export const useDeleteGoogleDriveFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      attachmentId,
    }: {
      taskId: string;
      attachmentId: string;
    }) => deleteData(`/google-drive/files/${taskId}/${attachmentId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-files", variables.taskId],
      });
      queryClient.invalidateQueries({ queryKey: ["google-drive-storage"] });
    },
  });
};
