import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData, postData, updateData, deleteData } from "@/lib/fetch-util";

// ✅ UPDATED: Event interface (workspace independent, multiple phone numbers)
export interface Event {
  _id: string;
  title: string;
  description?: string;
  dateTime: string;
  phoneNumbers: string[]; // ✅ Changed to array
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  // ✅ REMOVED: workspace field
  notificationSent: boolean;
  reminderJobId?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      dateTime: string;
      phoneNumbers: string[];
    }) => postData("/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      // ✅ REMOVED: workspace events query invalidation
    },
  });
};

// ✅ REMOVED: useGetEvents (workspace-specific events)

export const useGetMyEvents = () => {
  return useQuery<{
    success: boolean;
    events: Event[];
    pagination?: {
      current: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>({
    queryKey: ["my-events"],
    queryFn: () => fetchData("/events/my-events"),
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      eventId: string;
      title?: string;
      description?: string;
      dateTime?: string;
      phoneNumbers?: string[];
    }) => {
      const { eventId, ...updatePayload } = data;
      return updateData(`/events/${eventId}`, updatePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteData(`/events/${eventId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
};
