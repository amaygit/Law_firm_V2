import { Video, Calendar, Users, Mail } from "lucide-react";
import { CreateMeetDialog } from "@/components/meet/create-meet-dialog";
import { useGetWorkspaceDetailsQuery, useGetWorkspacesQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { useSearchParams, useNavigate } from "react-router";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function MeetingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const workspaceId = searchParams.get("workspaceId");

  // Get all workspaces for the dropdown
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useGetWorkspacesQuery() as {
    data: Workspace[] | undefined;
    isLoading: boolean;
  };

  // Get specific workspace details
  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace | undefined;
    isLoading: boolean;
  };

  const handleWorkspaceSelect = (selectedWorkspaceId: string) => {
    setSearchParams({ workspaceId: selectedWorkspaceId });
    sessionStorage.setItem("current_workspace_id", selectedWorkspaceId);
  };

  if (isLoading || isLoadingWorkspaces) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Show workspace selection prompt if no workspace selected
  if (!workspaceId || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="size-8 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">No Workspace Selected</h2>
            <p className="text-muted-foreground mb-6">
              Please select a workspace to create meetings
            </p>
          </div>

          {/* Workspace Selector */}
          <div className="space-y-3 text-left">
            <Label htmlFor="workspace-select">Select Workspace</Label>
            <Select onValueChange={handleWorkspaceSelect}>
              <SelectTrigger id="workspace-select" className="w-full">
                <SelectValue placeholder="Choose a workspace..." />
              </SelectTrigger>
              <SelectContent>
                {workspaces && workspaces.length > 0 ? (
                  workspaces.map((workspace) => (
                    <SelectItem key={workspace._id} value={workspace._id}>
                      {workspace.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-workspace" disabled>
                    No workspaces available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {workspaces && workspaces.length === 0 && (
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Don't have a workspace yet?
              </p>
              <Button onClick={() => navigate("/workspaces")} variant="outline">
                Create Workspace
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex flex-col gap-y-4 h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Video className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Meetings</h1>
              <p className="text-sm text-muted-foreground">
                Create instant Jitsi meetings and send email invitations
              </p>
            </div>
          </div>

          {/* Workspace Selector in Header */}
          <div className="flex items-center gap-3">
            <Select value={workspaceId} onValueChange={handleWorkspaceSelect}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select workspace..." />
              </SelectTrigger>
              <SelectContent>
                {workspaces && workspaces.length > 0 ? (
                  workspaces.map((workspace) => (
                    <SelectItem key={workspace._id} value={workspace._id}>
                      {workspace.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-workspace" disabled>
                    No workspaces
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <CreateMeetDialog currentWorkspace={data} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-2xl px-4">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Video className="size-12 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Create Instant Meetings
              </h2>
              <p className="text-muted-foreground mb-6">
                Generate Jitsi Meet links instantly and send email invitations to your team members
              </p>
            </div>
            
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <Mail className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    📧 Check Your Email for Meeting Details
                  </h3>
                  <p className="text-sm text-blue-700">
                    When you schedule a meeting, email invitations with the meeting link and details
                    will be sent to all selected members. Keep an eye on your inbox!
                  </p>
                </div>
              </div>
            </div>

            <CreateMeetDialog currentWorkspace={data} />

            <div className="mt-8 pt-8 border-t">
              <h3 className="font-medium mb-4">Quick Features</h3>
              <div className="grid gap-3 text-sm text-left md:grid-cols-3">
                <div className="flex items-start gap-2">
                  <Calendar className="size-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Schedule Instantly</p>
                    <p className="text-muted-foreground text-xs">
                      Set date, time and duration
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="size-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email Invitations</p>
                    <p className="text-muted-foreground text-xs">
                      Automatic emails to members
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Video className="size-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">No Sign-in Required</p>
                    <p className="text-muted-foreground text-xs">
                      Join meetings with one click
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
