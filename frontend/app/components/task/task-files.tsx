// frontend/app/components/task/task-files.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileIcon,
  ImageIcon,
  FileTextIcon,
  Download,
  Eye,
  Loader2,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { deleteData } from "@/lib/fetch-util"; // ✅ Use your existing fetch utility
import axios from "axios";
import { toast } from "sonner";

interface TaskFile {
  key: string;
  url: string;
}

interface TaskFilesProps {
  taskId: string;
  refreshKey?: number;
  isClient?: boolean;
}

export const TaskFiles: React.FC<TaskFilesProps> = ({
  taskId,
  refreshKey = 0,
  isClient = false,
}) => {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<TaskFile | null>(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://xyk0pby7sa.execute-api.eu-north-1.amazonaws.com/Stage1?taskId=${taskId}`
        );
        setFiles(res.data.files || []);
      } catch (error) {
        console.error("Error fetching files:", error);
        setFiles([]);
      }
      setLoading(false);
    };

    fetchFiles();
  }, [taskId, refreshKey]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop();

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
    ) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }

    if (["pdf"].includes(extension || "")) {
      return <FileTextIcon className="h-5 w-5 text-red-500" />;
    }

    if (["doc", "docx"].includes(extension || "")) {
      return <FileTextIcon className="h-5 w-5 text-blue-600" />;
    }

    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop()?.toUpperCase();
    return extension || "FILE";
  };

  const handleView = (file: TaskFile) => {
    const displayName = file.key.includes("$")
      ? file.key.split("$")[1]
      : file.key;
    const extension = displayName.toLowerCase().split(".").pop();

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf"].includes(
        extension || ""
      )
    ) {
      window.open(file.url, "_blank");
    } else {
      handleDownload(file);
    }
  };

  const handleDownload = async (file: TaskFile) => {
    try {
      const displayName = file.key.includes("$")
        ? file.key.split("$")[1]
        : file.key;

      const link = document.createElement("a");
      link.href = file.url;
      link.download = displayName;
      link.target = "_blank";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDeleteClick = (file: TaskFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
    setDeletingFile(null);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    setDeletingFile(fileToDelete.key);
    setDeleteDialogOpen(false); // ✅ Close dialog immediately

    try {
      // ✅ Use your existing deleteData utility which handles the base URL
      await deleteData(
        `/tasks/${taskId}/files/${encodeURIComponent(fileToDelete.key)}`
      );

      // ✅ Remove from local state for immediate UI update
      setFiles((prev) => prev.filter((f) => f.key !== fileToDelete.key));

      toast.success("File deleted successfully");

      // ✅ Refresh storage usage after a delay (non-blocking)
      queryClient.invalidateQueries({
        queryKey: ["storage-usage"],
        refetchType: "none", // Don't refetch immediately
      });

      // Trigger background refresh after 2 seconds
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["storage-usage"] });
      }, 2000);
    } catch (error: any) {
      console.error("Delete error:", error);

      if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this file");
      } else if (error.response?.status === 404) {
        toast.error("File not found");
      } else {
        toast.error(error.response?.data?.message || "Failed to delete file");
      }
    } finally {
      setDeletingFile(null);
      setFileToDelete(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            Attached Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading files...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!files.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            Attached Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No files attached</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileIcon className="h-5 w-5" />
              Attached Files
            </div>
            <Badge variant="secondary">{files.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {files.map((file) => {
            const displayName = file.key.includes("$")
              ? file.key.split("$")[1]
              : file.key;
            const fileType = getFileType(displayName);
            const isDeleting = deletingFile === file.key;

            return (
              <div
                key={file.key}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(displayName)}

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      title={displayName}
                    >
                      {displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {fileType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2">
                  {/* Quick actions for non-clients */}
                  {!isClient && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(file)}
                        className="h-8 w-8 p-0"
                        title="View file"
                        disabled={isDeleting}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        className="h-8 w-8 p-0"
                        title="Download file"
                        disabled={isDeleting}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* More options dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(file)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      {/* Delete option only for non-clients */}
                      {!isClient && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(file)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {fileToDelete?.key.includes("$")
                ? fileToDelete.key.split("$")[1]
                : fileToDelete?.key}
              "? This action cannot be undone and will permanently remove the
              file from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={!!deletingFile}
            >
              {deletingFile ? "Deleting..." : "Delete File"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
