import React, { useState } from "react";
import { Plus, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateEventDialog } from "@/components/event/create-event-dialog";
import { MyEventsList } from "@/components/event/my-events-list";

const EventsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Event Management</h1>
          <p className="text-muted-foreground">
            Create and manage events with WhatsApp reminders. Send reminders to
            up to 2 phone numbers per event.
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* ✅ SIMPLIFIED: Only show user's events (no workspace tabs) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">My Events</h2>
        </div>

        <MyEventsList />
      </div>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};

export default EventsPage;
