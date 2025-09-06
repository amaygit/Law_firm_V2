import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUpdateTaskCourtNameMutation } from "@/hooks/use-task";

interface TaskCourtNameProps {
  taskId: string;
  courtName?: string;
}

export const TaskCourtName: React.FC<TaskCourtNameProps> = ({
  taskId,
  courtName: initialCourtName = "",
}) => {
  const { mutate: updateCourtName } = useUpdateTaskCourtNameMutation();
  const [editing, setEditing] = useState(false);
  const [courtName, setCourtName] = useState(initialCourtName);

  useEffect(() => {
    setCourtName(initialCourtName || "");
  }, [initialCourtName]);

  const handleSave = () => {
    updateCourtName(
      { taskId, courtName },
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

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        Court Name
      </h3>

      {editing ? (
        <div className="flex gap-2">
          <Input
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
          />
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div
          className="text-sm cursor-pointer hover:underline"
          onClick={() => setEditing(true)}
        >
          {courtName || "Click to add court name"}
        </div>
      )}
    </div>
  );
};
