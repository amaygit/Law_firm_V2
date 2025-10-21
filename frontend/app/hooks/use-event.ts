import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData, postData, updateData, deleteData } from "@/lib/fetch-util";

export interface Event {
  _id: string;
  title: string;
  description?: string;
  dateTime: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
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
    }) => postData("/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
};

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

// Test email hook
export const useTestEmail = () => {
  return useMutation({
    mutationFn: () => postData("/events/test-email", {}),
  });
};
