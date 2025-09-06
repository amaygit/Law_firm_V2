import React from "react";
import { useParams } from "react-router";
import { useGetWorkspaceQuery } from "@/hooks/use-workspace";
import { Loader } from "@/components/loader";
import { WorkspaceSettings } from "@/components/workspace/workspace-settings";
import type { Workspace, Project } from "@/types"; // Import types

const WorkspaceSettingsPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data, isLoading } = useGetWorkspaceQuery(workspaceId || "") as {
    data: { workspace: Workspace; projects: Project[] };
    isLoading: boolean;
  };

  if (isLoading) return <Loader />;
  if (!data?.workspace) return <p>Workspace not found</p>;

  return (
    <div>
      <WorkspaceSettings workspace={data.workspace} />
    </div>
  );
};

export default WorkspaceSettingsPage;
