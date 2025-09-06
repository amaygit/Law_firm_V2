import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AchievedPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["achievedTasks", workspaceId],
    queryFn: async () => {
      const res = await axios.get("/api/tasks/achieved", {
        params: { workspaceId },
      });
      return res.data;
    },
  });

  const tasks = data?.tasks ?? [];

  const unachieveMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await axios.patch(`/api/tasks/${taskId}/achieve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievedTasks", workspaceId] });
      toast.success("Task unarchived!");
    },
    onError: () => {
      toast.error("Failed to unarchive task.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500 text-center">Failed to load tasks.</p>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Achieved Cases</h1>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No achieved tasks</p>
      ) : (
        tasks.map((task: any) => (
          <div
            key={task._id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{task.title}</h2>
              <p className="text-sm text-muted-foreground">
                {task.project?.title}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => unachieveMutation.mutate(task._id)}
              disabled={unachieveMutation.isPending}
            >
              {unachieveMutation.isPending ? "Unarchiving..." : "Unarchive"}
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default AchievedPage;
