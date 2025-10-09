import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit, Check, X } from "lucide-react";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskTitle = ({
  title,
  taskId,
  isClient,
}: {
  title: string;
  taskId: string;
  isClient?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const { mutate, isPending } = useUpdateTaskTitleMutation();

  const updateTitle = () => {
    mutate(
      { taskId, title: newTitle },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated successfully");
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
    setNewTitle(title);
  };

  return (
    <div className="flex items-center gap-2 flex-nowrap flex-wrap md:flex-nowrap w-full">
      {isEditing ? (
        <Input
          className="text-xl font-semibold w-full md:w-auto flex-grow min-w-0 resize-none"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isPending}
          autoFocus
        />
      ) : (
        <h2 className="text-xl font-semibold break-words md:truncate max-w-full">
          {title}
        </h2>
      )}

      {!isClient &&
        (isEditing ? (
          <div className="flex gap-2 shrink-0">
            <Button
              size="icon"
              onClick={updateTitle}
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
            className="p-1 shrink-0"
          >
            <Edit className="size-4 text-muted-foreground" />
          </Button>
        ))}
    </div>
  );
};
