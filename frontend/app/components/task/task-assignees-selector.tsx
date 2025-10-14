// import type { ProjectMemberRole, Task, User } from "@/types";
// import { useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// import { Button } from "../ui/button";
// import { Checkbox } from "../ui/checkbox";
// import { useUpdateTaskAssigneesMutation } from "@/hooks/use-task";
// import { toast } from "sonner";

// export const TaskAssigneesSelector = ({
//   task,
//   assignees,
//   projectMembers,
//   isClient = false, // 👈 NEW
// }: {
//   task: Task;
//   assignees: User[];
//   projectMembers: { user: User; role: ProjectMemberRole }[];
//   isClient?: boolean; // 👈 NEW
// }) => {
//   const [selectedIds, setSelectedIds] = useState<string[]>(
//     assignees.map((assignee) => assignee._id)
//   );
//   const [dropDownOpen, setDropDownOpen] = useState(false);
//   const { mutate, isPending } = useUpdateTaskAssigneesMutation();

//   const handleSelectAll = () => {
//     const allIds = projectMembers.map((m) => m.user._id);
//     setSelectedIds(allIds);
//   };

//   const handleUnSelectAll = () => {
//     setSelectedIds([]);
//   };

//   const handleSelect = (id: string) => {
//     let newSelected: string[] = [];

//     if (selectedIds.includes(id)) {
//       newSelected = selectedIds.filter((sid) => sid !== id);
//     } else {
//       newSelected = [...selectedIds, id];
//     }

//     setSelectedIds(newSelected);
//   };

//   const handleSave = () => {
//     mutate(
//       {
//         taskId: task._id,
//         assignees: selectedIds,
//       },
//       {
//         onSuccess: () => {
//           setDropDownOpen(false);
//           toast.success("Assignees updated successfully");
//         },
//         onError: (error: any) => {
//           const errMessage =
//             error.response?.data?.message || "Failed to update assignees";
//           toast.error(errMessage);
//           console.log(error);
//         },
//       }
//     );
//   };

//   return (
//     <div className="mb-6">
//       <h3 className="text-sm font-medium text-muted-foreground mb-2">
//         Assignees
//       </h3>

//       {/* Always show selected assignees */}
//       <div className="flex flex-wrap gap-2 mb-2">
//         {selectedIds.length === 0 ? (
//           <span className="text-xs text-muted-foreground">Unassigned</span>
//         ) : (
//           projectMembers
//             .filter((member) => selectedIds.includes(member.user._id))
//             .map((m) => (
//               <div
//                 key={m.user._id}
//                 className="flex items-center bg-gray-100 rounded px-2 py-1"
//               >
//                 <Avatar className="size-6 mr-1">
//                   <AvatarImage src={m.user.profilePicture} />
//                   <AvatarFallback>{m.user.name.charAt(0)}</AvatarFallback>
//                 </Avatar>
//                 <span className="text-xs text-muted-foreground">
//                   {m.user.name}
//                 </span>
//               </div>
//             ))
//         )}
//       </div>

//       {/* Dropdown only visible if NOT client */}
//       {!isClient && (
//         <div className="relative">
//           <button
//             className="text-sm text-muted-foreground w-full border rounded px-3 py-2 text-left bg-white"
//             onClick={() => setDropDownOpen(!dropDownOpen)}
//           >
//             {selectedIds.length === 0
//               ? "Select assignees"
//               : `${selectedIds.length} selected`}
//           </button>

//           {dropDownOpen && (
//             <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
//               <div className="flex justify-between px-2 py-1 border-b">
//                 <button
//                   className="text-xs text-blue-600"
//                   onClick={handleSelectAll}
//                 >
//                   Select all
//                 </button>
//                 <button
//                   className="text-xs text-red-600"
//                   onClick={handleUnSelectAll}
//                 >
//                   Unselect all
//                 </button>
//               </div>

//               {projectMembers.map((m) => (
//                 <label
//                   className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
//                   key={m.user._id}
//                 >
//                   <Checkbox
//                     checked={selectedIds.includes(m.user._id)}
//                     onCheckedChange={() => handleSelect(m.user._id)}
//                     className="mr-2"
//                   />

//                   <Avatar className="size-6 mr-2">
//                     <AvatarImage src={m.user.profilePicture} />
//                     <AvatarFallback>{m.user.name.charAt(0)}</AvatarFallback>
//                   </Avatar>

//                   <span>{m.user.name}</span>
//                 </label>
//               ))}

//               <div className="flex justify-between px-2 py-1">
//                 <Button
//                   variant={"outline"}
//                   size={"sm"}
//                   className="font-light"
//                   onClickCapture={() => setDropDownOpen(false)}
//                   disabled={isPending}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   size={"sm"}
//                   className="font-light"
//                   disabled={isPending}
//                   onClickCapture={() => handleSave()}
//                 >
//                   Save
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };
import type { ProjectMemberRole, Task, User } from "@/types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useUpdateTaskAssigneesMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskAssigneesSelector = ({
  task,
  assignees,
  projectMembers,
  isClient = false,
}: {
  task: Task;
  assignees: User[];
  projectMembers: { user: User; role: ProjectMemberRole }[];
  isClient?: boolean;
}) => {
  // ✅ Get task owner (creator)
  const taskOwnerId =
    typeof task.createdBy === "string"
      ? task.createdBy
      : task.createdBy?._id || "";

  const [selectedIds, setSelectedIds] = useState<string[]>(
    assignees.map((assignee) => assignee._id)
  );
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const { mutate, isPending } = useUpdateTaskAssigneesMutation();

  // ✅ Filter out owner from dropdown - owner is always included
  const availableMembers = projectMembers.filter(
    (member) => member.user._id !== taskOwnerId
  );

  const handleSelectAll = () => {
    const allIds = availableMembers.map((m) => m.user._id);
    // Always include owner
    if (!allIds.includes(taskOwnerId)) {
      allIds.push(taskOwnerId);
    }
    setSelectedIds(allIds);
  };

  const handleUnSelectAll = () => {
    // Owner must always remain selected
    setSelectedIds([taskOwnerId]);
  };

  const handleSelect = (id: string) => {
    let newSelected: string[] = [];

    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((sid) => sid !== id);
    } else {
      newSelected = [...selectedIds, id];
    }

    setSelectedIds(newSelected);
  };

  const handleSave = () => {
    // ✅ Ensure owner is always included
    const finalSelectedIds = [...selectedIds];
    if (!finalSelectedIds.includes(taskOwnerId)) {
      finalSelectedIds.push(taskOwnerId);
    }

    mutate(
      {
        taskId: task._id,
        assignees: finalSelectedIds,
      },
      {
        onSuccess: () => {
          setDropDownOpen(false);
          toast.success("Assignees updated successfully");
        },
        onError: (error: any) => {
          const errMessage =
            error.response?.data?.message || "Failed to update assignees";
          toast.error(errMessage);
          console.log(error);
        },
      }
    );
  };

  // ✅ Create a map of all users (from both assignees and projectMembers)
  const allUsersMap = new Map<string, User>();

  // Add all assignees to map
  assignees.forEach((assignee) => {
    allUsersMap.set(assignee._id, assignee);
  });

  // Add all project members to map
  projectMembers.forEach((member) => {
    allUsersMap.set(member.user._id, member.user);
  });

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Assignees
      </h3>

      {/* ✅ Always show selected assignees using the map */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedIds.length === 0 ? (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        ) : (
          selectedIds.map((userId) => {
            const user = allUsersMap.get(userId);
            if (!user) return null;

            return (
              <div
                key={userId}
                className="flex items-center bg-gray-100 rounded px-2 py-1"
              >
                <Avatar className="size-6 mr-1">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {user.name}
                  {userId === taskOwnerId && (
                    <span className="ml-1 text-blue-600 font-medium">
                      (Owner)
                    </span>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Dropdown only visible if NOT client */}
      {!isClient && (
        <div className="relative">
          <button
            className="text-sm text-muted-foreground w-full border rounded px-3 py-2 text-left bg-white"
            onClick={() => setDropDownOpen(!dropDownOpen)}
          >
            {selectedIds.length === 0
              ? "Select assignees"
              : `${selectedIds.length} selected`}
          </button>

          {dropDownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              <div className="flex justify-between px-2 py-1 border-b">
                <button
                  className="text-xs text-blue-600"
                  onClick={handleSelectAll}
                >
                  Select all
                </button>
                <button
                  className="text-xs text-red-600"
                  onClick={handleUnSelectAll}
                >
                  Unselect all
                </button>
              </div>

              {/* ✅ Show owner first (disabled/checked) */}
              {projectMembers
                .filter((m) => m.user._id === taskOwnerId)
                .map((m) => (
                  <div
                    key={m.user._id}
                    className="flex items-center px-3 py-2 bg-blue-50 border-b"
                  >
                    <Checkbox checked={true} disabled={true} className="mr-2" />

                    <Avatar className="size-6 mr-2">
                      <AvatarImage src={m.user.profilePicture} />
                      <AvatarFallback>{m.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <span className="font-medium">
                      {m.user.name}{" "}
                      <span className="text-xs text-blue-600">
                        (Owner - Auto-assigned)
                      </span>
                    </span>
                  </div>
                ))}

              {/* ✅ Show other members */}
              {availableMembers.map((m) => (
                <label
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                  key={m.user._id}
                >
                  <Checkbox
                    checked={selectedIds.includes(m.user._id)}
                    onCheckedChange={() => handleSelect(m.user._id)}
                    className="mr-2"
                  />

                  <Avatar className="size-6 mr-2">
                    <AvatarImage src={m.user.profilePicture} />
                    <AvatarFallback>{m.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <span>{m.user.name}</span>
                </label>
              ))}

              {availableMembers.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                  No other members available
                </div>
              )}

              <div className="flex justify-between px-2 py-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-light"
                  onClickCapture={() => setDropDownOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="font-light"
                  disabled={isPending}
                  onClickCapture={() => handleSave()}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
