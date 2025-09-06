import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { colorOptions } from "./create-workspace";
import { workspaceschema } from "@/lib/schema";
import type { z } from "zod";
import type { Workspace } from "@/types";
import { useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/use-workspace";

type WorkspaceForm = z.infer<typeof workspaceschema>;

interface WorkspaceSettingsProps {
  workspace: Workspace;
}

export const WorkspaceSettings = ({ workspace }: WorkspaceSettingsProps) => {
  const navigate = useNavigate();

  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceschema),
    defaultValues: {
      name: workspace.name,
      color: workspace.color,
      description: workspace.description || "",
    },
  });

  const { mutate: updateWorkspace, isPending: isUpdating } = useUpdateWorkspace(workspace._id);
  const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace();

  const onSubmit = (data: WorkspaceForm) => {
    updateWorkspace(data, {
      onSuccess: () => {
        toast.success("Workspace updated");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Update failed");
      },
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this workspace? This action is irreversible.")) return;

    deleteWorkspace(workspace._id, {
      onSuccess: () => {
        toast.success("Workspace deleted");
        navigate("/dashboard");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Delete failed");
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Workspace Settings</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Workspace Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} placeholder="Workspace Description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <div
                        key={color}
                        className={cn(
                          "w-6 h-6 rounded-full cursor-pointer border-2",
                          color === field.value ? "ring-2 ring-blue-500" : "border-gray-200"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between gap-4 pt-4">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Workspace"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
