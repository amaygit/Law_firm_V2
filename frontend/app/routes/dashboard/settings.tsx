import React, { useState } from "react";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import { WorkspaceSettings } from "@/components/workspace/workspace-settings";
import { Loader } from "@/components/loader";
import type { Workspace } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GlobalSettingsPage = () => {
  const { data: workspaces, isLoading } = useGetWorkspacesQuery() as {
    data: Workspace[];
    isLoading: boolean;
  };

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Global Settings</h1>
      <p className="text-muted-foreground">
        Select a workspace to update or delete its details.
      </p>

      <div className="space-y-4">
        <Select
          onValueChange={(workspaceId) => {
            const found = workspaces.find((w) => w._id === workspaceId);
            setSelectedWorkspace(found || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a workspace" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((ws) => (
              <SelectItem key={ws._id} value={ws._id}>
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedWorkspace && (
          <WorkspaceSettings workspace={selectedWorkspace} />
        )}
      </div>
    </div>
  );
};

export default GlobalSettingsPage;
