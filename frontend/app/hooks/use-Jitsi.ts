import { useState, useCallback } from 'react';

interface CreateMeetingParams {
  roomName: string;
  displayName?: string;
  subject?: string;
}

interface SendMeetingEmailParams {
  meetingTitle: string;
  meetingDescription: string;
  meetingDate: string;
  meetingTime: string;
  duration: string;
  meetLink: string;
  attendees: Array<{ name: string; email: string }>;
  organizerName: string;
}

export const useJitsi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);

  // Generate a unique room name
  const generateRoomName = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `SAAJNA-${timestamp}-${random}`;
  }, []);

  // Create a  meeting link
  const createMeeting = useCallback(
    ({ roomName, subject }: CreateMeetingParams): string => {
      const baseUrl = 'https://meet.jit.si';
      let meetingUrl = `${baseUrl}/${encodeURIComponent(roomName)}`;
      
      if (subject) {
        meetingUrl += `#config.subject="${encodeURIComponent(subject)}"`;
      }

      return meetingUrl;
    },
    []
  );

  // Create meeting and return link
  const createMeetingLink = useCallback(
    (subject?: string): string => {
      const roomName = generateRoomName();
      return createMeeting({ roomName, subject });
    },
    [generateRoomName, createMeeting]
  );

  // Send meeting invitation emails
  const sendMeetingEmails = useCallback(
    async ({
      meetingTitle,
      meetingDescription,
      meetingDate,
      meetingTime,
      duration,
      meetLink,
      attendees,
      organizerName,
    }: SendMeetingEmailParams): Promise<{ success: boolean; failedEmails: string[] }> => {
      setIsSendingEmails(true);
      const failedEmails: string[] = [];

      try {
        // Initialize EmailJS if not already done
        const { default: emailjs } = await import('@emailjs/browser');
        
        // Your EmailJS credentials
        const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_MEETING_TEMPLATE_ID;
        const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        // Format date and time nicely
        const formattedDateTime = new Date(`${meetingDate}T${meetingTime}`).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        // Send email to each attendee
        const emailPromises = attendees.map(async (attendee) => {
          try {
            await emailjs.send(
              SERVICE_ID,
              TEMPLATE_ID,
              {
                to_email: attendee.email,
                to_name: attendee.name,
                meeting_title: meetingTitle,
                meeting_description: meetingDescription || 'No description provided',
                meeting_datetime: formattedDateTime,
                meeting_duration: `${duration} minutes`,
                meeting_link: meetLink,
                organizer_name: organizerName,
              },
              PUBLIC_KEY
            );
            return { email: attendee.email, success: true };
          } catch (error) {
            console.error(`Failed to send email to ${attendee.email}:`, error);
            failedEmails.push(attendee.email);
            return { email: attendee.email, success: false };
          }
        });

        await Promise.all(emailPromises);

        return {
          success: failedEmails.length === 0,
          failedEmails,
        };
      } catch (error) {
        console.error('Error sending meeting emails:', error);
        throw error;
      } finally {
        setIsSendingEmails(false);
      }
    },
    []
  );

  return {
    isLoading,
    isSendingEmails,
    createMeeting,
    createMeetingLink,
    generateRoomName,
    sendMeetingEmails,
  };
};
