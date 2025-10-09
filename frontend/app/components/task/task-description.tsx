import { useUpdateTaskDescriptionMutation } from "@/hooks/use-task";
import { Edit, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export const TaskDescription = ({
  description,
  taskId,
  isClient,
}: {
  description: string;
  taskId: string;
  isClient?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);
  const { mutate, isPending } = useUpdateTaskDescriptionMutation();

  const updateDescription = () => {
    mutate(
      { taskId, description: newDescription },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Description updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "Update failed";
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewDescription(description);
  };

  return (
    <div className="flex items-start gap-2 flex-wrap md:flex-nowrap w-full">
      {isEditing ? (
        <Textarea
          className="w-full flex-grow min-w-0 resize-y text-sm md:text-base"
          rows={4}
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={isPending}
          autoFocus
        />
      ) : (
        <div className="text-sm md:text-base text-pretty text-muted-foreground flex-grow break-words">
          {description || "No description provided."}
        </div>
      )}

      {!isClient &&
        (isEditing ? (
          <div className="flex gap-2 shrink-0 mt-2 md:mt-0">
            <Button
              size="icon"
              onClick={updateDescription}
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
            onClick={() => setIsEditing(true)}
            className="p-1 shrink-0 mt-1 md:mt-0"
          >
            <Edit className="size-4 text-muted-foreground" />
          </Button>
        ))}
    </div>
  );
};
