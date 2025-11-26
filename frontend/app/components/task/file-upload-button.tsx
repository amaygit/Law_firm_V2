// frontend/app/components/task/file-upload-button.tsx - Updated for Google Drive
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Cloud, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useUploadToGoogleDrive,
  useGoogleDriveStatus,
  useGetGoogleAuthUrl,
} from "@/hooks/use-google-drive";

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
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: driveStatus } = useGoogleDriveStatus();
  const { mutate: uploadFile, isPending: uploading } = useUploadToGoogleDrive();
  const { mutate: getAuthUrl, isPending: gettingUrl } = useGetGoogleAuthUrl();

  const isConnected = driveStatus?.connected;

  const handleClick = () => {
    if (!isConnected) {
      setShowConnectDialog(true);
      return;
    }
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 50MB.");
      return;
    }

    uploadFile(
      { taskId, file },
      {
        onSuccess: () => {
          toast.success("File uploaded to Google Drive!");
          onUploadSuccess();
        },
        onError: (error: any) => {
          if (error.requiresGoogleAuth) {
            setShowConnectDialog(true);
          } else {
            toast.error(error.message || "Failed to upload file");
          }
        },
      }
    );

    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleConnectDrive = () => {
    getAuthUrl(undefined, {
      onSuccess: (data: any) => {
        window.location.href = data.authUrl;
      },
      onError: () => {
        toast.error("Failed to start Google authentication");
      },
    });
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx"
        disabled={uploading || disabled}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={uploading || disabled}
        className="w-fit"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </>
        )}
      </Button>

      {/* Connect Google Drive Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Connect Google Drive
            </DialogTitle>
            <DialogDescription>
              To upload files, you need to connect your Google Drive account
              first.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Why Google Drive?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your files are stored in YOUR Google Drive</li>
                <li>• 15GB free storage</li>
                <li>• You maintain full control of your data</li>
                <li>• Access files from anywhere</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConnectDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnectDrive}
                disabled={gettingUrl}
                className="flex-1"
              >
                {gettingUrl ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Cloud className="mr-2 h-4 w-4" />
                )}
                Connect Drive
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
