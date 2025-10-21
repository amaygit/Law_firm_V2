import React from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMyEvents, useDeleteEvent, type Event } from "@/hooks/use-event";
import { Loader } from "@/components/loader";

export const MyEventsList: React.FC = () => {
  const { data, isLoading, error } = useGetMyEvents();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      deleteEvent(eventId, {
        onSuccess: () => {
          toast.success("Event deleted successfully");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to delete event"
          );
        },
      });
    }
  };

  const getStatusBadge = (status: Event["status"]) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="default" className="text-xs">
            Scheduled
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="text-xs">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="text-xs">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Unknown
          </Badge>
        );
    }
  };

  const isEventPast = (dateTime: string) => {
    return new Date(dateTime) < new Date();
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">Failed to load your events</p>
      </div>
    );
  }

  const events = (data?.events || []).sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  if (events.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Events</h3>
        <p className="text-muted-foreground text-sm">
          You haven't created any events yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {events.map((event) => (
          <Card
            key={event._id}
            className="hover:shadow-lg transition-shadow flex flex-col"
          >
            <CardHeader className="pb-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base sm:text-lg line-clamp-2 break-words">
                  {event.title}
                </CardTitle>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem> */}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          handleDeleteEvent(event._id, event.title)
                        }
                        disabled={isDeleting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {event.description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">
                  {event.description}
                </p>
              )}
            </CardHeader>
            <div className="px-4 py-2 ">{getStatusBadge(event.status)}</div>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    {format(new Date(event.dateTime), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    {format(new Date(event.dateTime), "h:mm a")}
                  </span>
                </div>

                {/* <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{event.createdBy.email}</span>
                </div> */}
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs text-muted-foreground truncate">
                  Created {format(new Date(event.createdAt), "MMM d, yyyy")}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {event.notificationSent && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600 text-xs"
                    >
                      <Mail className="mr-1 h-3 w-3" />
                      Sent
                    </Badge>
                  )}
                  {isEventPast(event.dateTime) && !event.notificationSent && (
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-600 text-xs"
                    >
                      Missed
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.pagination && (
        <div className="text-center text-xs sm:text-sm text-muted-foreground pt-4">
          Page {data.pagination.current} of {data.pagination.total}
        </div>
      )}
    </div>
  );
};
