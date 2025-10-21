import React, { useState } from "react";
import { Plus, Calendar, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CreateEventDialog } from "@/components/event/create-event-dialog";
import { MyEventsList } from "@/components/event/events-list";
import { useTestEmail } from "@/hooks/use-event";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/provider/auth-context";

const EventsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { mutate: testEmail, isPending: isTestingEmail } = useTestEmail();
  const { user } = useAuth();

  const handleTestEmail = () => {
    testEmail(undefined, {
      onSuccess: () => {
        toast.success(`Test email sent successfully to ${user?.email}!`);
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to send test email"
        );
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* <Alert>
        <AlertDescription>
          📧 <strong>Email Reminders:</strong> You'll receive a beautifully
          formatted email reminder at the scheduled time. No spam - emails go
          straight to your inbox!
        </AlertDescription>
      </Alert> */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Event Management</h1>
          {/* <p className="text-muted-foreground">
            Create and manage events with email reminders sent to {user?.email}
          </p> */}
        </div>

        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            onClick={handleTestEmail}
            disabled={isTestingEmail}
          >
            <Mail className="mr-2 h-4 w-4" />
            {isTestingEmail ? "Sending..." : "Test Email"}
          </Button> */}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

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
        userEmail={user?.email || ""}
      />
    </div>
  );
};

export default EventsPage;
