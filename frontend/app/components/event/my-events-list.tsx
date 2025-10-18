import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, MessageSquare, Phone, Building2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetMyEvents, type Event } from "@/hooks/use-event";
import { Loader } from "@/components/loader";

export const MyEventsList: React.FC = () => {
  const { data, isLoading, error } = useGetMyEvents();

  const getStatusBadge = (status: Event["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const isEventPast = (dateTime: string) => {
    return new Date(dateTime) < new Date();
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load your events</p>
      </div>
    );
  }

  const events = data?.events || [];

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Events</h3>
        <p className="text-muted-foreground">
          You haven't created any events yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                {event.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </div>
              {getStatusBadge(event.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(event.dateTime), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(event.dateTime), "h:mm a")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{event.phoneNumbers}</span>
                </div>
                {/* <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{event.workspace}</span>
                </div> */}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Created{" "}
                  {format(new Date(event.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </div>

                <div className="flex items-center gap-2">
                  {event.notificationSent && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Sent
                    </Badge>
                  )}
                  {isEventPast(event.dateTime) && !event.notificationSent && (
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-600"
                    >
                      Missed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
