// frontend/app/components/task/task-files.tsx - Updated for Google Drive
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileIcon,
  ImageIcon,
  FileTextIcon,
  Download,
  Eye,
  Loader2,
  Trash2,
  MoreHorizontal,
  Cloud,
  User,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useTaskFiles,
  useDeleteGoogleDriveFile,
} from "@/hooks/use-google-drive";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<any>(null);

  const { data, isLoading, refetch } = useTaskFiles(taskId);
  const { mutate: deleteFile, isPending: deleting } =
    useDeleteGoogleDriveFile();

  // Refetch when refreshKey changes
  React.useEffect(() => {
    if (refreshKey > 0) refetch();
  }, [refreshKey, refetch]);

  const files = data?.files || [];

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || ""))
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (["pdf"].includes(ext || ""))
      return <FileTextIcon className="h-5 w-5 text-red-500" />;
    if (["doc", "docx"].includes(ext || ""))
      return <FileTextIcon className="h-5 w-5 text-blue-600" />;
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleView = (file: any) => {
    window.open(file.fileUrl, "_blank");
  };

  const handleDownload = (file: any) => {
    // Google Drive view link - append export param for download
    const downloadUrl = file.fileUrl.replace("/view", "/view?usp=download");
    window.open(downloadUrl, "_blank");
    toast.success("Opening download...");
  };

  const handleDeleteClick = (file: any) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!fileToDelete) return;

    deleteFile(
      { taskId, attachmentId: fileToDelete._id },
      {
        onSuccess: () => {
          toast.success("File deleted");
          setDeleteDialogOpen(false);
          setFileToDelete(null);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to delete file");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
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
              <Cloud className="h-5 w-5 text-green-500" />
              Google Drive Files
            </div>
            {files.length > 0 && (
              <Badge variant="secondary">{files.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No files uploaded</p>
              <p className="text-xs text-muted-foreground mt-1">
                Files will be stored in your Google Drive
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.fileName)}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(file.fileSize)}
                        </Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage
                                    src={file.uploadedBy?.profilePicture}
                                  />
                                  <AvatarFallback className="text-[8px]">
                                    {file.uploadedBy?.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline">
                                  {file.uploadedBy?.name?.split(" ")[0]}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Uploaded by {file.uploadedBy?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.uploaderEmail}
                              </p>
                              <p className="text-xs">
                                {formatDistanceToNow(
                                  new Date(file.uploadedAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(file)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View in Drive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      {file.canDelete && !isClient && (
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.fileName}"? This
              will remove it from Google Drive permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
