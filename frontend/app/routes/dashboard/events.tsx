import React, { useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import { CreateEventDialog } from "@/components/event/create-event-dialog";
import { EventsList } from "@/components/event/events-list";
import { MyEventsList } from "@/components/event/my-events-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Workspace } from "@/types";

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: workspaces = [] } = useGetWorkspacesQuery() as {
    data: Workspace[];
  };

  if (!workspaceId && workspaces.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 text-center space-y-6">
        <Calendar className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Select Workspace
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Choose a workspace to view and manage events.
        </p>

        <div className="w-full max-w-xs">
          <Select onValueChange={(id) => setSearchParams({ workspaceId: id })}>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Event Management</h1>
          <p className="text-muted-foreground">
            Create and manage events with WhatsApp reminders
          </p>
        </div>

        {workspaceId && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      <Tabs defaultValue="workspace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workspace">Workspace Events</TabsTrigger>
          <TabsTrigger value="my">My Events</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="space-y-4">
          {workspaceId ? (
            <EventsList workspaceId={workspaceId} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Select a workspace to view events
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          <MyEventsList />
        </TabsContent>
      </Tabs>

      {workspaceId && (
        <CreateEventDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
};

export default EventsPage;
