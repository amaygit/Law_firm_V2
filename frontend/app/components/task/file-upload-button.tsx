import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  useRecordFileUpload,
  useStorageLimitChecker,
} from "@/hooks/use-storage";
import { toast } from "sonner";
import axios from "axios";
import { Upload } from "lucide-react";

interface FileUploadButtonProps {
  taskId: string;
  onUploadSuccess: () => void;
  disabled?: boolean;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  taskId,
  onUploadSuccess,
  disabled,
}) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { mutate: recordUpload } = useRecordFileUpload();
  const { checkStorageBeforeUpload } = useStorageLimitChecker();
  const queryClient = useQueryClient();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // ✅ Step 1: Check storage limit BEFORE upload
      console.log(
        `Checking storage for file: ${file.name} (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );

      const storageCheck = await checkStorageBeforeUpload(file.size, taskId);

      if (!storageCheck.allowed) {
        toast.error(
          `Storage limit exceeded! Available: ${storageCheck.availableMB?.toFixed(
            1
          )} MB, ` + `Requested: ${storageCheck.requestedMB?.toFixed(1)} MB`
        );
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      console.log("✅ Storage check passed, proceeding with upload");

      // Step 2: Get S3 upload URL
      const response = await axios.post(
        "https://6g14bisq5c.execute-api.eu-north-1.amazonaws.com/upload",
        {
          taskId,
          fileName: file.name,
          fileType: file.type,
        }
      );

      const { uploadURL } = response.data;

      // Step 3: Upload to S3
      await axios.put(uploadURL, file, {
        headers: { "Content-Type": file.type },
      });

      // Step 4: Record in database with workspace owner tracking
      recordUpload({
        taskId,
        fileName: file.name,
        fileUrl: uploadURL.split("?")[0],
        fileType: file.type,
        fileSize: file.size,
      });

      toast.success("File uploaded successfully!");
      onUploadSuccess();

      // Force refresh storage usage
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
      }, 1000);
    } catch (err: any) {
      console.error("Upload error:", err);

      if (err.response?.status === 413) {
        const errorData = err.response.data;
        toast.error(
          `Storage limit exceeded! Available: ${errorData.availableMB?.toFixed(
            1
          )} MB, ` + `Requested: ${errorData.requestedMB?.toFixed(1)} MB`
        );
      } else {
        toast.error("File upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*,application/pdf,.doc,.docx,.txt"
        disabled={uploading || disabled}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || disabled}
        className="w-fit"
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Upload File"}
      </Button>
    </>
  );
};
