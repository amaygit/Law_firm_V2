import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useGetWorkspaceStatsQuery, useGetWorkspacesQuery } from "@/hooks/use-workspace";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { RecentProjects } from "@/components/dashboard/recnt-projects";

import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  Workspace,
  WorkspaceProductivityData,
} from "@/types";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const workspaceId = searchParams.get("workspaceId");

  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const { data: workspaces = [] } = useGetWorkspacesQuery() as {
    data: Workspace[];
  };

  const { data, isPending } = useGetWorkspaceStatsQuery(workspaceId!, {
    enabled: !!workspaceId,
  }) as {
    data: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      projectStatusData: ProjectStatusData[];
      taskPriorityData: TaskPriorityData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    };
    isPending: boolean;
  };

  // --- NO WORKSPACE SELECTED ---
  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 text-center space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          No Workspace Selected
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Select an existing workspace or create a new one to begin managing your projects.
        </p>

        <div className="w-full max-w-xs">
          <Select
            onValueChange={(id) => setSearchParams({ workspaceId: id })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select workspace" />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((ws) => (
                <SelectItem key={ws._id} value={ws._id}>
                  {ws.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setIsCreatingWorkspace(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Workspace</span>
        </Button>

        <CreateWorkspace
          isCreatingWorkspace={isCreatingWorkspace}
          setIsCreatingWorkspace={setIsCreatingWorkspace}
        />
      </div>
    );
  }

  // --- LOADING STATE ---
  if (isPending || !data) {
    return <Loader />;
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="space-y-8 2xl:space-y-12 px-4 sm:px-6 md:px-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <StatsCard data={data.stats} />

      <StatisticsCharts
        stats={data.stats}
        taskTrendsData={data.taskTrendsData}
        projectStatusData={data.projectStatusData}
        taskPriorityData={data.taskPriorityData}
        workspaceProductivityData={data.workspaceProductivityData}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentProjects data={data.recentProjects} />
        <UpcomingTasks data={data.upcomingTasks} />
      </div>
    </div>
  );
};

export default Dashboard;
