// frontend/app/hooks/use-storage.ts - UPDATED with limit checking

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchData, postData } from "@/lib/fetch-util";

export interface StorageUsage {
  totalSizeBytes: number;
  totalSizeMB: number;
  totalSizeGB: number;
  totalFiles: number;
  limitGB: number;
  usagePercentage: number;
  isOverLimit: boolean;
}

export const useStorageUsage = () => {
  return useQuery<{ usage: StorageUsage }>({
    queryKey: ["storage-usage"],
    queryFn: () => fetchData("/storage/usage"),
    refetchInterval: 30000, // ✅ Changed to 30 seconds to reduce load
    staleTime: 10000, // ✅ Consider data fresh for 10 seconds
    refetchOnWindowFocus: false, // ✅ Don't refetch on window focus
  });
};

// ✅ NEW: Hook to check if upload is allowed
export const useCheckStorageLimit = () => {
  return useMutation({
    mutationFn: (data: { fileSize: number; taskId: string }) =>
      postData("/storage/check-limit", data),
  });
};

export const useRecordFileUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
    }) =>
      postData(`/storage/record/${data.taskId}`, {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
      }),
    onSuccess: () => {
      // Refresh storage usage immediately after recording
      queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
    },
  });
};

// ✅ NEW: Utility function to check storage before upload
export const useStorageLimitChecker = () => {
  const { mutateAsync: checkLimit } = useCheckStorageLimit();

  const checkStorageBeforeUpload = async (fileSize: number, taskId: string) => {
    try {
      const result = await checkLimit({ fileSize, taskId });
      return { allowed: true, data: result };
    } catch (error: any) {
      if (error.response?.status === 413) {
        const errorData = error.response.data;
        return {
          allowed: false,
          error: errorData.message,
          availableMB: errorData.availableMB,
          requestedMB: errorData.requestedMB,
        };
      }
      throw error;
    }
  };

  return { checkStorageBeforeUpload };
};
