import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import { Loader } from "@/components/loader";
import type { Workspace } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SelectWorkspaceDashboard = () => {
  const { data: workspaces, isLoading } = useGetWorkspacesQuery() as {
    data: Workspace[];
    isLoading: boolean;
  };

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Choose a Workspace</h1>
      <p className="text-muted-foreground">
        Select a workspace to view and manage your cases.
      </p>

      <div className="space-y-4">
        <Select onValueChange={setSelectedId}>
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

        <Button
          className="w-full"
          disabled={!selectedId}
          onClick={() => navigate(`/dashboard/${selectedId}/achived`)}
        >
          Go to Cases
        </Button>
      </div>
    </div>
  );
};

export default SelectWorkspaceDashboard;
