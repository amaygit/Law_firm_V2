import React, { useState } from 'react'
import { useParams } from 'react-router';
import { useGetWorkspaceQuery } from '@/hooks/use-workspace';
import { InviteMemberDialog } from "@/components/workspace/invite-member";
import type { Project, Workspace } from "@/types";
import { Loader } from 'lucide-react';
import { WorkspaceHeader } from '@/components/workspace/workspace-header';
import { ProjectList } from '@/components/workspace/project-list';
import { CreateProjectDialog } from '@/components/project/create-project';
const WorkspaceDetails = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const [isCreateProject, setIsCreateProject] = useState(false);
    const [isInviteMember, setIsInviteMember] = useState(false);

    if (!workspaceId) {
        return <div>No workspace found</div>
    }

    const { data, isLoading } = useGetWorkspaceQuery(workspaceId) as {
        data: {
            workspace: Workspace;
            projects: Project[];
        };
        isLoading: boolean;
    };
    if (isLoading) {
        return <div>
            <Loader />
        </div>
    }
    return (
        <div>
            <h1>
                <WorkspaceHeader

                    workspace={data.workspace}
                    members={data?.workspace?.members as any}
                    onCreateProject={() => setIsCreateProject(true)}
                    onInviteMember={() => setIsInviteMember(true)}
                />
                <ProjectList
                    workspaceId={workspaceId}
                    projects={data.projects}
                    onCreateProject={() => setIsCreateProject(true)}
                />
                <CreateProjectDialog
                    isOpen={isCreateProject}
                    onOpenChange={setIsCreateProject}
                    workspaceId={workspaceId}
                    workspaceMembers={data.workspace.members as any}
                />
                
      <InviteMemberDialog
        isOpen={isInviteMember}
        onOpenChange={setIsInviteMember}
        workspaceId={workspaceId}
      />
            </h1>
        </div>
    )
}

export default WorkspaceDetails