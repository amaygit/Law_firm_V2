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
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface TaskFile {
  key: string;
  url: string;
}

interface TaskFilesProps {
  taskId: string;
  refreshKey?: number;
}

export const TaskFiles: React.FC<TaskFilesProps> = ({
  taskId,
  refreshKey = 0,
}) => {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(false);

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

  const getFileSize = (fileName: string) => {
    // This is a placeholder - you might want to store file size in your backend
    return "Unknown size";
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
      // Open in new tab for images and PDFs
      window.open(file.url, "_blank");
    } else {
      // For other files, trigger download
      handleDownload(file);
    }
  };

  const handleDownload = async (file: TaskFile) => {
    try {
      const displayName = file.key.includes("$")
        ? file.key.split("$")[1]
        : file.key;

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = file.url;
      link.download = displayName;
      link.target = "_blank";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
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
                    <span className="text-xs text-muted-foreground">
                      {getFileSize(displayName)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleView(file)}
                  className="h-8 w-8 p-0"
                  title="View file"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="h-8 w-8 p-0"
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
