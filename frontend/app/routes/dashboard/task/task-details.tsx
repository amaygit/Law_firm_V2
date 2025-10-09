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
import { FileUploadButton } from "@/components/task/file-upload-button";
import { TaskFiles } from "@/components/task/task-files";
import { StorageWarning } from "@/components/storage-warning";
import { AIChatbox } from "@/components/task/ai-chatbox"; // ✅ NEW
import {
  useAchievedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
  useDeleteTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff, Bot } from "lucide-react"; // ✅ Added Bot icon
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
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();
  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();

  const [filesRefreshKey, setFilesRefreshKey] = useState(0);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false); // ✅ NEW: AI Chat state

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
  const handleDeleteTask = () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    deleteTask(task._id, {
      onSuccess: () => {
        toast.success("Case deleted successfully");
        navigate(-1); // Go back to previous page
      },
      onError: (error: any) => {
        const errorMessage = error.message || "Failed to delete case";
        toast.error(errorMessage);
      },
    });
  };
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4">
      <StorageWarning className="mb-4" />

      {/* ✅ Sticky Responsive Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border flex flex-col md:flex-row md:items-center md:justify-between mb-6 px-3 sm:px-4 md:px-0 py-3 gap-2">
        {/* LEFT SECTION (Back + Title) */}
        <div className="flex items-center justify-center md:justify-start gap-2 flex-1 min-w-0">
          {/* Back Button - visible on all screen sizes */}
          <div className="block">
            <BackButton />
          </div>

          {/* Title */}
          <h1 className="truncate text-base sm:text-lg md:text-2xl font-semibold text-center md:text-left flex-1">
            {task.title}
          </h1>

          {task.isArchived && (
            <Badge className="ml-2 flex-shrink-0" variant={"outline"}>
              Archived
            </Badge>
          )}
        </div>

        {/* RIGHT SECTION (Action Buttons) */}
        <div className="flex flex-nowrap items-center justify-center md:justify-end gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {!isClient && (
            <>
              <Button
                onClick={() => setIsAIChatOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-2.5 sm:px-3 text-xs sm:text-sm"
                size="sm"
              >
                <Bot className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                SAJNA
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleWatchTask}
                disabled={isWatching}
                className="px-2.5 sm:px-3 text-xs sm:text-sm"
              >
                {isUserWatching ? (
                  <>
                    <EyeOff className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Unwatch
                  </>
                ) : (
                  <>
                    <Eye className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Watch
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAchievedTask}
                disabled={isAchieved}
                className="px-2.5 sm:px-3 text-xs sm:text-sm"
              >
                {task.isArchived ? "Unarchive" : "Archive"}
              </Button>

              {task._id && (
                <div className="flex-shrink-0">
                  <FileUploadButton
                    taskId={task._id}
                    onUploadSuccess={triggerFilesRefresh}
                    disabled={isClient}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* COURT NAME */}
      <TaskCourtName
        taskId={task._id}
        courtName={task.courtName}
        isClient={isClient}
      />

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 mt-6">
        {/* LEFT SIDE CONTENT */}
        <div className="flex-1 w-full">
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm mb-6">
            {/* Header (Priority + Status + Delete) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
              <Badge
                variant={
                  task.priority === "High"
                    ? "destructive"
                    : task.priority === "Medium"
                    ? "default"
                    : "outline"
                }
                className="capitalize"
              >
                {task.priority} Priority
              </Badge>

              {!isClient && (
                <div className="flex flex-wrap items-center gap-2">
                  <TaskStatusSelector status={task.status} taskId={task._id} />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteTask} // ✅ Changed
                    disabled={isDeleting} // ✅ Added
                    className="hidden md:block"
                  >
                    {isDeleting ? "Deleting..." : "Delete Case"}{" "}
                    {/* ✅ Changed */}
                  </Button>
                </div>
              )}
            </div>

            <TaskTitle
              title={task.title}
              taskId={task._id}
              isClient={isClient}
            />

            <div className="text-sm md:text-base text-muted-foreground mb-4">
              Created{" "}
              {formatDistanceToNow(new Date(task.createdAt), {
                addSuffix: true,
              })}
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

        {/* RIGHT SIDE CONTENT */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6">
          <TaskHearings
            taskId={task._id}
            hearings={task.hearings}
            isClient={isClient}
            favourPercentage={favourPercentage}
          />
          <Watchers watchers={task.watchers || []} />
          <TaskActivity resourceId={task._id} />
          <TaskFiles
            taskId={task._id}
            refreshKey={filesRefreshKey}
            isClient={isClient}
          />
        </div>
      </div>

      {/* ✅ AI Chatbox */}
      {task._id && (
        <AIChatbox
          taskId={task._id}
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
        />
      )}
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
// import { FileUploadButton } from "@/components/task/file-upload-button";
// import { TaskFiles } from "@/components/task/task-files";
// import { StorageWarning } from "@/components/storage-warning";
// import { AIChatbox } from "@/components/task/ai-chatbox"; // ✅ NEW
// import {
//   useAchievedTaskMutation,
//   useTaskByIdQuery,
//   useWatchTaskMutation,
// } from "@/hooks/use-task";
// import { useAuth } from "@/provider/auth-context";
// import type { Project, Task } from "@/types";
// import { formatDistanceToNow } from "date-fns";
// import { Eye, EyeOff, Bot } from "lucide-react"; // ✅ Added Bot icon
// import { useNavigate, useParams } from "react-router";
// import { toast } from "sonner";

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
//   const [isAIChatOpen, setIsAIChatOpen] = useState(false); // ✅ NEW: AI Chat state

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
//       <StorageWarning className="mb-4" />

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
//           {!isClient && (
//             <>
//               <Button
//                 onClick={() => setIsAIChatOpen(true)}
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//                 size="sm"
//               >
//                 <Bot className="mr-2 h-4 w-4" />
//                 SAJNA
//               </Button>
//               <Button
//                 variant={"outline"}
//                 size="sm"
//                 onClick={handleWatchTask}
//                 className="w-fit"
//                 disabled={isWatching}
//               >
//                 {isUserWatching ? (
//                   <>
//                     <EyeOff className="mr-2 size-4" />
//                     Unwatch
//                   </>
//                 ) : (
//                   <>
//                     <Eye className="mr-2 size-4" />
//                     Watch
//                   </>
//                 )}
//               </Button>

//               <Button
//                 variant={"outline"}
//                 size="sm"
//                 onClick={handleAchievedTask}
//                 className="w-fit"
//                 disabled={isAchieved}
//               >
//                 {task.isArchived ? "Unarchive" : "Archive"}
//               </Button>

//               {task._id && (
//                 <FileUploadButton
//                   taskId={task._id}
//                   onUploadSuccess={triggerFilesRefresh}
//                   disabled={isClient}
//                 />
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       <TaskCourtName
//         taskId={task._id}
//         courtName={task.courtName}
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
//                   isClient={isClient}
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
//           </div>

//           <CommentSection taskId={task._id} members={project.members as any} />
//           {!isClient && (
//             <InternalCommentSection
//               taskId={task._id}
//               members={project.members as any}
//             />
//           )}
//         </div>

//         <div className="w-full space-y-6">
//           <TaskHearings
//             taskId={task._id}
//             hearings={task.hearings}
//             isClient={isClient}
//             favourPercentage={favourPercentage}
//           />

//           <Watchers watchers={task.watchers || []} />

//           <TaskActivity resourceId={task._id} />

//           <TaskFiles
//             taskId={task._id}
//             refreshKey={filesRefreshKey}
//             isClient={isClient}
//           />
//         </div>
//       </div>

//       {/* ✅ NEW: AI Chatbox Component */}
//       {task._id && (
//         <AIChatbox
//           taskId={task._id}
//           isOpen={isAIChatOpen}
//           onClose={() => setIsAIChatOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default TaskDetails;
