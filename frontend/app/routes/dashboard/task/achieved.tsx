import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const AchievedCasesPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["achievedTasks", workspaceId],
    queryFn: async () => {
    //   const res = await axios.get(`/api/workspaces/${workspaceId}/achieved-tasks`);
    const res = await axios.get(`/api-v1/tasks/achieved?workspaceId=${workspaceId}`);

      return res.data; // should be array
    },
  });

  if (isLoading) return <Loader />;

  if (!Array.isArray(tasks)) {
    return <p className="text-red-500 text-center">Oops! Could not load tasks.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Achieved Cases</h2>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">No archived cases found.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className="border rounded p-4 shadow-sm bg-background">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description || "No description"}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    // Optional: call an unarchive API
                  }}
                >
                  Unarchive
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievedCasesPage;
