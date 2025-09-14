import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAddTaskHearingMutation } from "@/hooks/use-task";
import type { Hearing } from "@/types";

interface TaskHearingsProps {
  taskId: string;
  hearings?: Hearing[];
  isClient?: boolean;
  favourPercentage?: number;
}

export const TaskHearings: React.FC<TaskHearingsProps> = ({
  taskId,
  hearings: initialHearings = [],
  isClient = false,
  favourPercentage: initialFavour = 0,
}) => {
  const { mutate: addHearing, isPending } = useAddTaskHearingMutation();
  const [formOpen, setFormOpen] = useState(false);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [inFavour, setInFavour] = useState(true);

  // 👇 local state for UI update
  const [hearings, setHearings] = useState(initialHearings);
  const [favourPercentage, setFavourPercentage] = useState(initialFavour);

  const handleSave = () => {
    if (!date) {
      toast.error("Date is required");
      return;
    }

    addHearing(
      { taskId, date, description, inFavour },
      {
        onSuccess: (data) => {
          toast.success("Hearing added");
          setFormOpen(false);
          setDate("");
          setDescription("");
          setInFavour(true);

          // 👇 Update local state from response
          setHearings(data.task.hearings);
          setFavourPercentage(data.favourPercentage);
        },
        onError: () => toast.error("Failed to add hearing"),
      }
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Hearings</h3>
        {/* 👇 Show favour percentage */}
        <span className="text-xs font-medium">Favour: {favourPercentage}%</span>
      </div>

      {/* List of hearings */}
      {hearings.length === 0 ? (
        <p className="text-xs text-muted-foreground">No hearings added</p>
      ) : (
        <ul className="space-y-2">
          {hearings.map((h, i) => (
            <li
              key={i}
              className="p-2 border rounded bg-gray-50 text-sm flex flex-col"
            >
              <span className="font-medium">
                {new Date(h.date).toLocaleDateString()}{" "}
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    h.inFavour
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {h.inFavour ? "In our favour" : "Not in our favour"}
                </span>
              </span>
              {h.description && (
                <span className="text-muted-foreground text-xs mt-1">
                  {h.description}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add new hearing form */}
      {!isClient && (
        <div className="mt-3">
          {formOpen ? (
            <div className="space-y-2">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-2 items-center">
                <label className="text-sm">Result:</label>
                <select
                  value={inFavour ? "true" : "false"}
                  onChange={(e) => setInFavour(e.target.value === "true")}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="true">In our favour</option>
                  <option value="false">Not in our favour</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={isPending}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFormOpen(true)}
            >
              Add Hearing
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
