import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData, postData, updateData, deleteData } from "@/lib/fetch-util";

export interface Event {
  _id: string;
  title: string;
  description?: string;
  dateTime: string;
  phoneNumber: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  workspace: string;
  notificationSent: boolean;
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
      workspaceId: string;
      phoneNumber: string;
    }) => postData("/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
};

export const useGetEvents = (workspaceId: string) => {
  return useQuery<{ events: Event[] }>({
    queryKey: ["events", workspaceId],
    queryFn: () => fetchData(`/events/workspace/${workspaceId}`),
    enabled: !!workspaceId,
  });
};

export const useGetMyEvents = () => {
  return useQuery<{ events: Event[] }>({
    queryKey: ["my-events"],
    queryFn: () => fetchData("/events/my-events"),
  });
};

// ✅ FIXED: Corrected the updateEvent hook
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      eventId: string;
      title?: string;
      description?: string;
      dateTime?: string;
      phoneNumber?: string;
    }) => {
      const { eventId, ...updatePayload } = data;
      // ✅ Fixed: Call updateData function correctly
      return updateData(`/events/${eventId}`, updatePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteData(`/events/${eventId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
  });
};
