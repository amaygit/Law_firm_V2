import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CommentSection } from "@/components/task/comment-section";
import { SubTasksDetails } from "@/components/task/sub-tasks";
import { TaskActivity } from "@/components/task/task-activity";
import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskClientsSelector } from "@/components/task/task-clients-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { Watchers } from "@/components/task/watchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskCourtName } from "@/components/task/TaskCourtName";
import { TaskHearings } from "@/components/task/TaskHearings";
import { InternalCommentSection } from "@/components/task/InternalComments";
import { FileUploadButton } from "@/components/task/file-upload-button"; // ✅ NEW: Import separate component
import { TaskFiles } from "@/components/task/task-files"; // ✅ NEW: Import enhanced files component
import { StorageWarning } from "@/components/storage-warning"; // ✅ NEW: Storage warning
import {
  useAchievedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
      role: "owner" | "subLawyer" | "client" | null;
      favourPercentage: number;
    };
    isLoading: boolean;
  };

  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();

  const [filesRefreshKey, setFilesRefreshKey] = useState(0);
  const triggerFilesRefresh = () => setFilesRefreshKey((k) => k + 1);

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Case not found</div>
      </div>
    );
  }

  const { task, project, role } = data;
  const isClient = role === "client";
  const favourPercentage = data.favourPercentage;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => toast.success("Task watched"),
        onError: () => toast.error("Failed to watch task"),
      }
    );
  };

  const handleAchievedTask = () => {
    achievedTask(
      { taskId: task._id },
      {
        onSuccess: () => toast.success("Case achieved"),
        onError: () => toast.error("Failed to achieve case"),
      }
    );
  };

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      {/* ✅ NEW: Storage warning at the top */}
      <StorageWarning className="mb-4" />

      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <BackButton />

          <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

          {task.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archived
            </Badge>
          )}
        </div>

        {/* ❌ Clients should not see action buttons */}
        {!isClient && (
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant={"outline"}
              size="sm"
              onClick={handleWatchTask}
              className="w-fit"
              disabled={isWatching}
            >
              {isUserWatching ? (
                <>
                  <EyeOff className="mr-2 size-4" />
                  Unwatch
                </>
              ) : (
                <>
                  <Eye className="mr-2 size-4" />
                  Watch
                </>
              )}
            </Button>

            <Button
              variant={"outline"}
              size="sm"
              onClick={handleAchievedTask}
              className="w-fit"
              disabled={isAchieved}
            >
              {task.isArchived ? "Unarchive" : "Archive"}
            </Button>

            {/* ✅ UPDATED: Use new FileUploadButton component */}
            {task._id && (
              <FileUploadButton
                taskId={task._id}
                onUploadSuccess={triggerFilesRefresh}
                disabled={isClient}
              />
            )}
          </div>
        )}
      </div>

      <TaskCourtName
        taskId={task._id}
        courtName={task.courtName}
        isClient={isClient}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div>
                <Badge
                  variant={
                    task.priority === "High"
                      ? "destructive"
                      : task.priority === "Medium"
                      ? "default"
                      : "outline"
                  }
                  className="mb-2 capitalize"
                >
                  {task.priority} Priority
                </Badge>

                <TaskTitle
                  title={task.title}
                  taskId={task._id}
                  isClient={isClient}
                />

                <div className="text-sm md:text-base text-muted-foreground">
                  Created at:{" "}
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {!isClient && (
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <TaskStatusSelector status={task.status} taskId={task._id} />
                  <Button
                    variant={"destructive"}
                    size="sm"
                    onClick={() => {}}
                    className="hidden md:block"
                  >
                    Delete Case
                  </Button>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-0">
                Description
              </h3>

              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
                isClient={isClient}
              />
            </div>

            <TaskAssigneesSelector
              task={task}
              assignees={task.assignees}
              projectMembers={project.members as any}
              isClient={isClient}
            />

            <TaskClientsSelector
              task={task}
              clients={task.clients}
              projectMembers={project.members as any}
              isClient={isClient}
            />

            {!isClient && (
              <TaskPrioritySelector
                priority={task.priority}
                taskId={task._id}
              />
            )}

            <SubTasksDetails
              subTasks={task.subtasks || []}
              taskId={task._id}
              isClient={isClient}
            />
          </div>

          <CommentSection taskId={task._id} members={project.members as any} />
          {!isClient && (
            <InternalCommentSection
              taskId={task._id}
              members={project.members as any}
            />
          )}
        </div>

        {/* right side */}
        <div className="w-full space-y-6">
          <TaskHearings
            taskId={task._id}
            hearings={task.hearings}
            isClient={isClient}
            favourPercentage={favourPercentage}
          />

          <Watchers watchers={task.watchers || []} />

          <TaskActivity resourceId={task._id} />

          {/* ✅ UPDATED: Use new TaskFiles component */}
          <TaskFiles taskId={task._id} refreshKey={filesRefreshKey} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

// import React, { useState } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { BackButton } from "@/components/back-button";
// import { Loader } from "@/components/loader";
// import { CommentSection } from "@/components/task/comment-section";
// import { SubTasksDetails } from "@/components/task/sub-tasks";
// import { TaskActivity } from "@/components/task/task-activity";
// import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
// import { TaskClientsSelector } from "@/components/task/task-clients-selector";
// import { TaskDescription } from "@/components/task/task-description";
// import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
// import { TaskStatusSelector } from "@/components/task/task-status-selector";
// import { TaskTitle } from "@/components/task/task-title";
// import { Watchers } from "@/components/task/watchers";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { TaskCourtName } from "@/components/task/TaskCourtName";
// import { TaskHearings } from "@/components/task/TaskHearings";
// import { InternalCommentSection } from "@/components/task/InternalComments";
// import {
//   useRecordFileUpload,
//   useStorageLimitChecker,
// } from "@/hooks/use-storage";
// import {
//   useAchievedTaskMutation,
//   useTaskByIdQuery,
//   useWatchTaskMutation,
// } from "@/hooks/use-task";
// import { useAuth } from "@/provider/auth-context";
// import type { Project, Task } from "@/types";
// import { formatDistanceToNow } from "date-fns";
// import { Eye, EyeOff } from "lucide-react";
// import { useNavigate, useParams } from "react-router";
// import { toast } from "sonner";
// import axios from "axios";

// const S3_BUCKET = "your-s3-bucket-name"; // same bucket as backend
// const S3_REGION = "eu-north-1";

// function getS3Url(key: string) {
//   return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
// }

// const FileUploadButton: React.FC<{
//   taskId: string;
//   onUploadSuccess: () => void;
//   disabled?: boolean;
// }> = ({ taskId, onUploadSuccess, disabled }) => {
//   const [uploading, setUploading] = useState(false);
//   const inputRef = React.useRef<HTMLInputElement>(null);

//   const { mutate: recordUpload } = useRecordFileUpload();
//   //const { mutate: checkLimit } = useCheckStorageLimit();
//   const { checkStorageBeforeUpload } = useStorageLimitChecker();
//   const queryClient = useQueryClient();

//   const handleFileChange = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setUploading(true);

//     try {
//       console.log(
//         `Checking storage for file: ${file.name} (${(
//           file.size /
//           1024 /
//           1024
//         ).toFixed(2)} MB)`
//       );

//       const storageCheck = await checkStorageBeforeUpload(file.size, taskId);

//       if (!storageCheck.allowed) {
//         toast.error(
//           `Storage limit exceeded! Available: ${storageCheck.availableMB?.toFixed(
//             1
//           )} MB, ` + `Requested: ${storageCheck.requestedMB?.toFixed(1)} MB`
//         );
//         setUploading(false);
//         if (inputRef.current) inputRef.current.value = "";
//         return;
//       }

//       console.log("✅ Storage check passed, proceeding with upload");

//       // Step 2: Get S3 upload URL
//       const response = await axios.post(
//         "https://6g14bisq5c.execute-api.eu-north-1.amazonaws.com//upload",
//         {
//           taskId,
//           fileName: file.name,
//           fileType: file.type,
//         }
//       );

//       const { uploadURL } = response.data;

//       // Step 3: Upload to S3
//       await axios.put(uploadURL, file, {
//         headers: { "Content-Type": file.type },
//       });

//       // Step 4: Record in database with workspace owner tracking
//       recordUpload({
//         taskId,
//         fileName: file.name,
//         fileUrl: uploadURL.split("?")[0],
//         fileType: file.type,
//         fileSize: file.size,
//       });

//       toast.success("File uploaded successfully!");
//       onUploadSuccess();

//       // Force refresh storage usage
//       setTimeout(() => {
//         queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
//       }, 1000);
//     } catch (err: any) {
//       console.error("Upload error:", err);

//       if (err.response?.status === 413) {
//         const errorData = err.response.data;
//         toast.error(
//           `Storage limit exceeded! Available: ${errorData.availableMB?.toFixed(
//             1
//           )} MB, Requested: ${errorData.requestedMB?.toFixed(1)} MB`
//         );
//       } else {
//         toast.error("File upload failed. Please try again.");
//       }
//     } finally {
//       setUploading(false);
//       if (inputRef.current) inputRef.current.value = "";
//     }
//   };

//   return (
//     <>
//       <input
//         type="file"
//         ref={inputRef}
//         style={{ display: "none" }}
//         onChange={handleFileChange}
//         accept="image/*,application/pdf,.doc,.docx,.txt"
//         disabled={uploading || disabled}
//       />
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => inputRef.current?.click()}
//         disabled={uploading || disabled}
//         className="w-fit"
//       >
//         {uploading ? "Uploading..." : "Upload"}
//       </Button>
//     </>
//   );
// };

// const TaskFiles: React.FC<{ taskId: string }> = ({ taskId }) => {
//   const [files, setFiles] = useState<{ key: string; url: string }[]>([]);
//   const [loading, setLoading] = useState(false);

//   React.useEffect(() => {
//     const fetchFiles = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(
//           `https://xyk0pby7sa.execute-api.eu-north-1.amazonaws.com/Stage1?taskId=${taskId}`
//         );
//         setFiles(res.data.files || []);
//       } catch {
//         setFiles([]);
//       }
//       setLoading(false);
//     };

//     fetchFiles();
//   }, [taskId]);

//   if (loading) return <div>Loading files...</div>;
//   if (!files.length)
//     return (
//       <div className="text-sm text-muted-foreground">No files uploaded.</div>
//     );

//   return (
//     <div className="mt-6">
//       <h3 className="font-semibold mb-2">Uploaded Files</h3>
//       <div className="flex flex-wrap gap-4">
//         {files.map(({ key, url }) => {
//           const displayName = key.includes("$") ? key.split("$")[1] : key;
//           const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(key);

//           return (
//             <div key={key} className="border rounded p-2 max-w-[200px]">
//               {isImage ? (
//                 <img
//                   src={url}
//                   alt={displayName}
//                   className="w-full h-32 object-cover rounded mb-1"
//                 />
//               ) : (
//                 <a href={url} target="_blank" rel="noopener noreferrer">
//                   {displayName}
//                 </a>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// const TaskDetails = () => {
//   const { user } = useAuth();
//   const { taskId } = useParams<{ taskId: string }>();
//   const navigate = useNavigate();

//   const { data, isLoading } = useTaskByIdQuery(taskId!) as {
//     data: {
//       task: Task;
//       project: Project;
//       role: "owner" | "subLawyer" | "client" | null;
//       favourPercentage: number;
//     };
//     isLoading: boolean;
//   };

//   const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
//   const { mutate: achievedTask, isPending: isAchieved } =
//     useAchievedTaskMutation();

//   const [filesRefreshKey, setFilesRefreshKey] = useState(0);
//   const triggerFilesRefresh = () => setFilesRefreshKey((k) => k + 1);

//   if (isLoading) {
//     return (
//       <div>
//         <Loader />
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-2xl font-bold">Case not found</div>
//       </div>
//     );
//   }

//   const { task, project, role } = data;
//   const isClient = role === "client";
//   const favourPercentage = data.favourPercentage;
//   const isUserWatching = task?.watchers?.some(
//     (watcher) => watcher._id.toString() === user?._id.toString()
//   );

//   const goBack = () => navigate(-1);

//   const handleWatchTask = () => {
//     watchTask(
//       { taskId: task._id },
//       {
//         onSuccess: () => toast.success("Task watched"),
//         onError: () => toast.error("Failed to watch task"),
//       }
//     );
//   };

//   const handleAchievedTask = () => {
//     achievedTask(
//       { taskId: task._id },
//       {
//         onSuccess: () => toast.success("Case achieved"),
//         onError: () => toast.error("Failed to achieve case"),
//       }
//     );
//   };

//   return (
//     <div className="container mx-auto p-0 py-4 md:px-4">
//       <div className="flex flex-col md:flex-row items-center justify-between mb-6">
//         <div className="flex flex-col md:flex-row md:items-center">
//           <BackButton />

//           <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

//           {task.isArchived && (
//             <Badge className="ml-2" variant={"outline"}>
//               Archived
//             </Badge>
//           )}
//         </div>

//         {/* ❌ Clients should not see action buttons */}
//         {!isClient && (
//           <div className="flex space-x-2 mt-4 md:mt-0">
//             <Button
//               variant={"outline"}
//               size="sm"
//               onClick={handleWatchTask}
//               className="w-fit"
//               disabled={isWatching}
//             >
//               {isUserWatching ? (
//                 <>
//                   <EyeOff className="mr-2 size-4" />
//                   Unwatch
//                 </>
//               ) : (
//                 <>
//                   <Eye className="mr-2 size-4" />
//                   Watch
//                 </>
//               )}
//             </Button>

//             <Button
//               variant={"outline"}
//               size="sm"
//               onClick={handleAchievedTask}
//               className="w-fit"
//               disabled={isAchieved}
//             >
//               {task.isArchived ? "Unarchive" : "Archive"}
//             </Button>

//             {task._id && (
//               <FileUploadButton
//                 taskId={task._id}
//                 onUploadSuccess={triggerFilesRefresh}
//                 disabled={isClient}
//               />
//             )}
//           </div>
//         )}
//       </div>

//       <TaskCourtName
//         taskId={task._id}
//         courtName={task.courtName}
//         // pass isClient if you want to disable editing there too
//         isClient={isClient}
//       />

//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="lg:col-span-2">
//           <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
//             <div className="flex flex-col md:flex-row justify-between items-start mb-4">
//               <div>
//                 <Badge
//                   variant={
//                     task.priority === "High"
//                       ? "destructive"
//                       : task.priority === "Medium"
//                       ? "default"
//                       : "outline"
//                   }
//                   className="mb-2 capitalize"
//                 >
//                   {task.priority} Priority
//                 </Badge>

//                 <TaskTitle
//                   title={task.title}
//                   taskId={task._id}
//                   isClient={isClient} // ✅ only clients see read-only title
//                 />

//                 <div className="text-sm md:text-base text-muted-foreground">
//                   Created at:{" "}
//                   {formatDistanceToNow(new Date(task.createdAt), {
//                     addSuffix: true,
//                   })}
//                 </div>
//               </div>

//               {!isClient && (
//                 <div className="flex items-center gap-2 mt-4 md:mt-0">
//                   <TaskStatusSelector status={task.status} taskId={task._id} />
//                   <Button
//                     variant={"destructive"}
//                     size="sm"
//                     onClick={() => {}}
//                     className="hidden md:block"
//                   >
//                     Delete Case
//                   </Button>
//                 </div>
//               )}
//             </div>

//             <div className="mb-6">
//               <h3 className="text-sm font-medium text-muted-foreground mb-0">
//                 Description
//               </h3>

//               <TaskDescription
//                 description={task.description || ""}
//                 taskId={task._id}
//                 isClient={isClient}
//               />
//             </div>

//             {/* {!isClient && (
//               <> */}
//             <TaskAssigneesSelector
//               task={task}
//               assignees={task.assignees}
//               projectMembers={project.members as any}
//               isClient={isClient}
//             />

//             <TaskClientsSelector
//               task={task}
//               clients={task.clients}
//               projectMembers={project.members as any}
//               isClient={isClient}
//             />

//             {!isClient && (
//               <TaskPrioritySelector
//                 priority={task.priority}
//                 taskId={task._id}
//               />
//             )}
//             <SubTasksDetails
//               subTasks={task.subtasks || []}
//               taskId={task._id}
//               isClient={isClient}
//             />
//             {/* </>
//             )} */}
//           </div>

//           <CommentSection taskId={task._id} members={project.members as any} />
//           {!isClient && (
//             <InternalCommentSection
//               taskId={task._id}
//               members={project.members as any}
//             />
//           )}
//         </div>

//         {/* right side */}
//         <div className="w-full">
//           <TaskHearings
//             taskId={task._id}
//             hearings={task.hearings}
//             isClient={isClient}
//             favourPercentage={favourPercentage}
//           />
//           <Watchers watchers={task.watchers || []} />
//           <TaskActivity resourceId={task._id} />
//           <TaskFiles taskId={task._id} key={filesRefreshKey} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TaskDetails;

// import { BackButton } from "@/components/back-button";
// import { Loader } from "@/components/loader";
// import { CommentSection } from "@/components/task/comment-section";
// import { SubTasksDetails } from "@/components/task/sub-tasks";
// import { TaskActivity } from "@/components/task/task-activity";
// import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
// import { TaskDescription } from "@/components/task/task-description";
// import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
// import { TaskStatusSelector } from "@/components/task/task-status-selector";
// import { TaskTitle } from "@/components/task/task-title";
// import { Watchers } from "@/components/task/watchers";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   useAchievedTaskMutation,
//   useTaskByIdQuery,
//   useWatchTaskMutation,
// } from "@/hooks/use-task";
// import { useAuth } from "@/provider/auth-context";
// import type { Project, Task } from "@/types";
// import { format, formatDistanceToNow } from "date-fns";
// import { Eye, EyeOff } from "lucide-react";
// import { useNavigate, useParams } from "react-router";
// import { toast } from "sonner";

// const TaskDetails = () => {
//   const { user } = useAuth();
//   const { taskId, projectId, workspaceId } = useParams<{
//     taskId: string;
//     projectId: string;
//     workspaceId: string;
//   }>();
//   const navigate = useNavigate();

//   const { data, isLoading } = useTaskByIdQuery(taskId!) as {
//     data: {
//       task: Task;
//       project: Project;
//     };
//     isLoading: boolean;
//   };
//   const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
//   const { mutate: achievedTask, isPending: isAchieved } =
//     useAchievedTaskMutation();

//   if (isLoading) {
//     return (
//       <div>
//         <Loader />
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-2xl font-bold">Case not found</div>
//       </div>
//     );
//   }

//   const { task, project } = data;
//   const isUserWatching = task?.watchers?.some(
//     (watcher) => watcher._id.toString() === user?._id.toString()
//   );

//   const goBack = () => navigate(-1);

//   const members = task?.assignees || [];

//   const handleWatchTask = () => {
//     watchTask(
//       { taskId: task._id },
//       {
//         onSuccess: () => {
//           toast.success("Task watched");
//         },
//         onError: () => {
//           toast.error("Failed to watch task");
//         },
//       }
//     );
//   };

//   const handleAchievedTask = () => {
//     achievedTask(
//       { taskId: task._id },
//       {
//         onSuccess: () => {
//           toast.success("Case achieved");
//         },
//         onError: () => {
//           toast.error("Failed to achieve case");
//         },
//       }
//     );
//   };

//   return (
//     <div className="container mx-auto p-0 py-4 md:px-4">
//       <div className="flex flex-col md:flex-row items-center justify-between mb-6">
//         <div className="flex flex-col md:flex-row md:items-center">
//           <BackButton />

//           <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

//           {task.isArchived && (
//             <Badge className="ml-2" variant={"outline"}>
//               Archived
//             </Badge>
//           )}
//         </div>

//         <div className="flex space-x-2 mt-4 md:mt-0">
//           <Button
//             variant={"outline"}
//             size="sm"
//             onClick={handleWatchTask}
//             className="w-fit"
//             disabled={isWatching}
//           >
//             {isUserWatching ? (
//               <>
//                 <EyeOff className="mr-2 size-4" />
//                 Unwatch
//               </>
//             ) : (
//               <>
//                 <Eye className="mr-2 size-4" />
//                 Watch
//               </>
//             )}
//           </Button>

//           <Button
//             variant={"outline"}
//             size="sm"
//             onClick={handleAchievedTask}
//             className="w-fit"
//             disabled={isAchieved}
//           >
//             {task.isArchived ? "Unarchive" : "Archive"}
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="lg:col-span-2">
//           <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
//             <div className="flex flex-col md:flex-row justify-between items-start mb-4">
//               <div>
//                 <Badge
//                   variant={
//                     task.priority === "High"
//                       ? "destructive"
//                       : task.priority === "Medium"
//                       ? "default"
//                       : "outline"
//                   }
//                   className="mb-2 capitalize"
//                 >
//                   {task.priority} Priority
//                 </Badge>

//                 <TaskTitle title={task.title} taskId={task._id} />

//                 <div className="text-sm md:text-base text-muted-foreground">
//                   Created at:{" "}
//                   {formatDistanceToNow(new Date(task.createdAt), {
//                     addSuffix: true,
//                   })}
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 mt-4 md:mt-0">
//                 <TaskStatusSelector status={task.status} taskId={task._id} />

//                 <Button
//                   variant={"destructive"}
//                   size="sm"
//                   onClick={() => {}}
//                   className="hidden md:block"
//                 >
//                   Delete Case
//                 </Button>
//               </div>
//             </div>

//             <div className="mb-6">
//               <h3 className="text-sm font-medium text-muted-foreground mb-0">
//                 Description
//               </h3>

//               <TaskDescription
//                 description={task.description || ""}
//                 taskId={task._id}
//               />
//             </div>

//             <TaskAssigneesSelector
//               task={task}
//               assignees={task.assignees}
//               projectMembers={project.members as any}
//             />

//             <TaskPrioritySelector priority={task.priority} taskId={task._id} />

//             <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} />
//           </div>

//           <CommentSection taskId={task._id} members={project.members as any} />
//         </div>

//         {/* right side */}
//         <div className="w-full">
//           <Watchers watchers={task.watchers || []} />

//           <TaskActivity resourceId={task._id} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TaskDetails;
