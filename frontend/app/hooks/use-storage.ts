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
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

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
