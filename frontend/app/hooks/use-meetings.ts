import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api-v1';

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  meetingDate: string;
  duration: number;
  meetLink: string;
  workspace: {
    _id: string;
    name: string;
  };
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  attendees: Array<{
    user?: {
      _id: string;
      name: string;
      email: string;
    };
    email: string;
    name: string;
    status: 'pending' | 'accepted' | 'declined';
  }>;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  platform: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateMeetingData {
  title: string;
  description?: string;
  meetingDate: string;
  duration: number;
  meetLink: string;
  workspaceId: string;
  attendees: Array<{
    user: string;
    email: string;
    name: string;
  }>;
}

// Get meetings for a workspace
export const useGetWorkspaceMeetings = (workspaceId: string, upcoming?: boolean) => {
  return useQuery({
    queryKey: ['meetings', workspaceId, upcoming],
    queryFn: async () => {
      const params = upcoming ? '?upcoming=true' : '';
      const response = await axios.get(
        `${API_URL}/meetings/workspace/${workspaceId}${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.meetings as Meeting[];
    },
    enabled: !!workspaceId,
  });
};

// Get single meeting
export const useGetMeeting = (meetingId: string) => {
  return useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.meeting as Meeting;
    },
    enabled: !!meetingId,
  });
};

// Create meeting
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMeetingData) => {
      const response = await axios.post(`${API_URL}/meetings`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data.meeting as Meeting;
    },
    onSuccess: (data) => {
      // Invalidate meetings query for this workspace
      queryClient.invalidateQueries({ queryKey: ['meetings', data.workspace._id] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error: any) => {
      console.error('Error creating meeting:', error.response?.data || error.message);
    },
  });
};

// Update meeting
export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      meetingId, 
      data 
    }: { 
      meetingId: string; 
      data: Partial<CreateMeetingData> 
    }) => {
      const response = await axios.put(
        `${API_URL}/meetings/${meetingId}`, 
        data, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.meeting as Meeting;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', data._id] });
    },
    onError: (error: any) => {
      console.error('Error updating meeting:', error.response?.data || error.message);
    },
  });
};

// Cancel meeting
export const useCancelMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await axios.delete(`${API_URL}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error: any) => {
      console.error('Error cancelling meeting:', error.response?.data || error.message);
    },
  });
};

// Export types for use in components
export type { Meeting, CreateMeetingData };
