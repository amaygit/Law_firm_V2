import { useState, useEffect } from "react";
import { Video, Calendar as CalendarIcon, Clock, Users, Copy, Check, ExternalLink, Mail } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";
import { useJitsi } from "@/hooks/use-Jitsi";

interface CreateMeetDialogProps {
  currentWorkspace: Workspace | null;
  isCollapsed?: boolean;
}

export const CreateMeetDialog = ({
  currentWorkspace,
  isCollapsed = false,
}: CreateMeetDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { toast } = useToast();
  const { createMeetingLink, sendMeetingEmails, isSendingEmails } = useJitsi();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: undefined as Date | undefined,
    time: "",
    duration: "30",
    attendees: [] as string[],
  });

  const [workspaceMembers, setWorkspaceMembers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);

  useEffect(() => {
    if (open && currentWorkspace) {
      fetchWorkspaceMembers(currentWorkspace._id);
      setMeetLink(null);
      setCopied(false);
    }
  }, [open, currentWorkspace]);

  const fetchWorkspaceMembers = async (workspaceId: string) => {
    try {
      if (currentWorkspace?.members) {
        const members = currentWorkspace.members.map((member) => ({
          id: member.user._id,
          name: member.user.name,
          email: member.user.email,
        }));
        setWorkspaceMembers(members);
        return;
      }
      setWorkspaceMembers([]);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load workspace members",
        variant: "error",
      });
      setWorkspaceMembers([]);
    }
  };

  const handleCreateMeet = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "error",
      });
      return;
    }

    if (!currentWorkspace) {
      toast({
        title: "Error",
        description: "No workspace selected",
        variant: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const generatedLink = createMeetingLink(formData.title);
      setMeetLink(generatedLink);

      const attendeesData = formData.attendees
        .map((id) => {
          const member = workspaceMembers.find((m) => m.id === id);
          return member
            ? {
                email: member.email,
                name: member.name,
              }
            : null;
        })
        .filter(Boolean) as Array<{ email: string; name: string }>;

      if (attendeesData.length > 0) {
        const userData = localStorage.getItem('user');
        const organizerName = userData ? JSON.parse(userData).name : 'Organizer';

        const emailResult = await sendMeetingEmails({
          meetingTitle: formData.title,
          meetingDescription: formData.description,
          meetingDate: format(formData.date, "yyyy-MM-dd"),
          meetingTime: formData.time,
          duration: formData.duration,
          meetLink: generatedLink,
          attendees: attendeesData,
          organizerName,
        });

        if (emailResult.success) {
          toast({
            title: "Meeting Created!",
            description: `Meeting link created and invitations sent to ${attendeesData.length} member(s)`,
          });
        } else {
          toast({
            title: "Meeting Created with Warnings",
            description: `Link created but failed to send ${emailResult.failedEmails.length} email(s)`,
            variant: "warning",
          });
        }
      } else {
        toast({
          title: "Meeting Created!",
          description: "Meeting link has been created. Share it with your team.",
        });
      }
    } catch (error: any) {
      console.error("Error creating meet:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create meeting",
        variant: "error",
      });
      setMeetLink(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (meetLink) {
      navigator.clipboard.writeText(meetLink);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Meet link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setFormData({
        title: "",
        description: "",
        date: undefined,
        time: "",
        duration: "30",
        attendees: [],
      });
      setMeetLink(null);
      setCopied(false);
    }, 200);
  };

  const toggleAttendee = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(memberId)
        ? prev.attendees.filter((id) => id !== memberId)
        : [...prev.attendees, memberId],
    }));
  };

  const selectedMemberEmails = formData.attendees
    .map((id) => workspaceMembers.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "w-full justify-start",
            isCollapsed && "justify-center"
          )}
        >
          <Video className={cn("size-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="hidden md:inline">Create Meet</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="size-5" />
            {meetLink ? "Meeting Created!" : "Create Client Meeting"}
          </DialogTitle>
          <DialogDescription>
            {meetLink
              ? "Your meeting link is ready. Email invitations have been sent."
              : "Create a meeting link and send email invitations"}
          </DialogDescription>
        </DialogHeader>

        {meetLink ? (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="size-8 text-green-600" />
              </div>
            </div>

            <div className="space-y-3 text-center">
              <h3 className="font-semibold text-lg">{formData.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formData.date && format(formData.date, "PPPP")} at {formData.time}
              </p>
            </div>

            <div className="space-y-3">
              <Label>CustomLawFirm Meet Link</Label>
              <div className="flex gap-2">
                <Input
                  value={meetLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(meetLink, "_blank")}
              >
                <ExternalLink className="size-4 mr-2" />
                Open Meet Link
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                💡 No sign-in required! Share this link with participants.
              </p>
            </div>

            {selectedMemberEmails.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-green-600" />
                  <span className="font-medium">
                    Email invitations sent to {selectedMemberEmails.length} member(s):
                  </span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-1">
                  {selectedMemberEmails.map((member) => (
                    <div key={member!.id} className="text-sm flex items-center gap-2">
                      <Check className="size-3 text-green-600" />
                      <span className="font-medium">{member!.name}</span>
                      <span className="text-muted-foreground">({member!.email})</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  ✉️ Members will receive the meeting details in their email
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Meeting Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Meeting Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Case Discussion"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Meeting agenda..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="size-4" />
                  Date <span className="text-red-500">*</span>
                </Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => {
                        setFormData({ ...formData, date });
                        setDatePickerOpen(false);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration: value })
                }
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Workspace Members */}
            {currentWorkspace && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="size-4" />
                  Select Members (Optional)
                </Label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                  {workspaceMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No members found in workspace
                    </p>
                  ) : (
                    workspaceMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`member-${member.id}`}
                          checked={formData.attendees.includes(member.id)}
                          onChange={() => toggleAttendee(member.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={`member-${member.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {member.email}
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {formData.attendees.length > 0 && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                    📧 {formData.attendees.length} member(s) selected - Email invitations will be sent
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {meetLink ? (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMeet} 
                disabled={loading || isSendingEmails}
              >
                {loading || isSendingEmails ? (
                  <>
                    {isSendingEmails ? "Sending Invites..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Video className="size-4 mr-2" />
                    Create & Send Invites
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
