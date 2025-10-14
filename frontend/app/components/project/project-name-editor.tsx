import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ProjectNameEditorProps {
  projectId: string;
  currentName: string;
  onUpdate: (newName: string) => void;
}

export const ProjectNameEditor = ({
  projectId,
  currentName,
  onUpdate,
}: ProjectNameEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Case name cannot be empty");
      return;
    }

    if (name.length > 80) {
      toast.error("Case name must be 80 characters or less");
      return;
    }

    if (name === currentName) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/name`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update case name");
      }

      const updatedProject = await response.json();
      onUpdate(updatedProject.name);
      toast.success("Case name updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update case name");
      setName(currentName); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(currentName);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap flex-1">
      {isEditing ? (
        <>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="text-xl md:text-2xl font-bold h-auto py-1 flex-1"
            autoFocus
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Button
              size="icon"
              onClick={handleSave}
              disabled={isLoading}
              className="p-1"
            >
              <Check className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="p-1"
            >
              <X className="size-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {name.length}/80
          </span>
        </>
      ) : (
        <>
          <h1 className="text-xl md:text-2xl font-bold">{currentName}</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="p-1"
          >
            <Edit className="size-4 text-muted-foreground" />
          </Button>
        </>
      )}
    </div>
  );
};
