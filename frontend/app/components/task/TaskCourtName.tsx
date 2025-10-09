// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { useUpdateTaskCourtNameMutation } from "@/hooks/use-task";

// interface TaskCourtNameProps {
//   taskId: string;
//   courtName?: string;
//   isClient?: boolean;
// }

// export const TaskCourtName: React.FC<TaskCourtNameProps> = ({
//   taskId,
//   courtName: initialCourtName = "",
//   isClient = false,
// }) => {
//   const { mutate: updateCourtName } = useUpdateTaskCourtNameMutation();
//   const [editing, setEditing] = useState(false);
//   const [courtName, setCourtName] = useState(initialCourtName);

//   useEffect(() => {
//     setCourtName(initialCourtName || "");
//   }, [initialCourtName]);

//   const handleSave = () => {
//     updateCourtName(
//       { taskId, courtName },
//       {
//         onSuccess: () => {
//           toast.success("Court name updated");
//           setEditing(false);
//         },
//         onError: () => {
//           toast.error("Failed to update court name");
//         },
//       }
//     );
//   };

//   return (
//     <div className="mb-6">
//       <h3 className="text-sm font-medium text-muted-foreground mb-1">
//         Court Name
//       </h3>

//       {editing ? (
//         !isClient && ( // 👈 Only allow edit if NOT client
//           <div className="flex gap-2">
//             <Input
//               value={courtName}
//               onChange={(e) => setCourtName(e.target.value)}
//             />
//             <Button size="sm" onClick={handleSave}>
//               Save
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setEditing(false)}
//             >
//               Cancel
//             </Button>
//           </div>
//         )
//       ) : (
//         <div
//           className={`text-sm ${
//             !isClient ? "cursor-pointer hover:underline" : ""
//           }`}
//           onClick={() => !isClient && setEditing(true)} // 👈 Disable click for clients
//         >
//           {courtName || "Click to add court name"}
//         </div>
//       )}
//     </div>
//   );
// };
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUpdateTaskCourtNameMutation } from "@/hooks/use-task";
import { Edit, Check, X } from "lucide-react"; // Import Check (tick mark) and X icons

interface TaskCourtNameProps {
  taskId: string;
  courtName?: string;
  isClient?: boolean;
}

export const TaskCourtName: React.FC<TaskCourtNameProps> = ({
  taskId,
  courtName: initialCourtName = "",
  isClient = false,
}) => {
  const { mutate: updateCourtName, isPending } =
    useUpdateTaskCourtNameMutation();
  const [editing, setEditing] = useState(false);
  const [newCourtName, setNewCourtName] = useState(initialCourtName);

  // Sync state with prop changes
  useEffect(() => {
    setNewCourtName(initialCourtName || "");
  }, [initialCourtName]);

  const handleSave = () => {
    updateCourtName(
      { taskId, courtName: newCourtName },
      {
        onSuccess: () => {
          toast.success("Court name updated");
          setEditing(false);
        },
        onError: () => {
          toast.error("Failed to update court name");
        },
      }
    );
  };

  const handleCancel = () => {
    setEditing(false);
    setNewCourtName(initialCourtName); // Reset the input to the original value
  };

  // Common wrapper for the content, using flexbox for layout
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Label and value group */}
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-medium text-muted-foreground">
            Court Name:
          </h3>

          {editing ? (
            // Edit mode: show input field
            <Input
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              disabled={isPending}
              className="flex-1" // Allow input to grow
            />
          ) : (
            // View mode: show the court name text
            <p className="text-sm font-semibold text-foreground">
              {initialCourtName || "N/A"}
            </p>
          )}
        </div>

        {/* Edit/Save/Cancel buttons */}
        {!isClient &&
          (editing ? (
            <div className="flex gap-2">
              {/* Changed from Save to Check icon */}
              <Button
                size="icon"
                onClick={handleSave}
                disabled={isPending}
                className="p-1"
              >
                <Check className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="p-1"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditing(true)}
              className="p-1"
            >
              <Edit className="size-4 text-muted-foreground" />
            </Button>
          ))}
      </div>
    </div>
  );
};
