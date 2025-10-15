import { projectSchema } from "@/lib/schema";
import { ProjectStatus, type MemberProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { UseCreateProject } from "@/hooks/use-project";
import { toast } from "sonner";
import { useAuth } from "@/provider/auth-context";
import React from "react";
interface CreateProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceMembers: MemberProps[];
}

export type CreateProjectFormData = z.infer<typeof projectSchema>;

export const CreateProjectDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
  workspaceMembers,
}: CreateProjectDialogProps) => {
  const { user } = useAuth();

  const [membersPopoverOpen, setMembersPopoverOpen] = useState(false);
  const [assigneesPopoverOpen, setAssigneesPopoverOpen] = useState(false); // ✅ NEW
  const [clientsPopoverOpen, setClientsPopoverOpen] = useState(false); // ✅ NEW

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      status: ProjectStatus.FILED,
      startDate: "",
      dueDate: "",
      members: user ? [{ user: user._id, role: "manager" }] : [],
      assignees: user ? [user._id] : [], // ✅ NEW
      clients: [], // ✅ NEW
      tags: undefined,
    },
  });

  const { mutate, isPending } = UseCreateProject();

  const onSubmit = (values: CreateProjectFormData) => {
    if (!workspaceId) return;

    const finalMembers = values.members || [];
    if (user) {
      const creatorExists = finalMembers.some(
        (member) => member.user === user._id
      );

      if (!creatorExists) {
        finalMembers.push({
          user: user._id,
          role: "manager",
        });
      }
    }

    // ✅ Ensure creator is in assignees
    const finalAssignees = values.assignees || [];
    if (user && !finalAssignees.includes(user._id)) {
      finalAssignees.push(user._id);
    }

    mutate(
      {
        projectData: {
          ...values,
          members: finalMembers,
          assignees: finalAssignees, // ✅ NEW
          clients: values.clients || [], // ✅ NEW
        },
        workspaceId,
      },
      {
        onSuccess: () => {
          toast.success("Case created successfully");
          form.reset({
            title: "",
            name: "",
            description: "",
            status: ProjectStatus.FILED,
            startDate: "",
            dueDate: "",
            members: user ? [{ user: user._id, role: "manager" }] : [],
            assignees: user ? [user._id] : [],
            clients: [],
            tags: undefined,
          });
          onOpenChange(false);
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  const availableMembers = workspaceMembers.filter(
    (member) => member.user._id !== user?._id
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Case</DialogTitle>
          <DialogDescription>
            Create a new case to get started
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Case Title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Constitutional and Administrative Case">
                          Constitutional and Administrative Case
                        </SelectItem>
                        <SelectItem value="Criminal Case">
                          Criminal Case
                        </SelectItem>
                        <SelectItem value="Corporate and Commercial Case">
                          Corporate and Commercial Case
                        </SelectItem>
                        <SelectItem value="Civil Case">Civil Case</SelectItem>
                        <SelectItem value="Property and Real Estate Case">
                          Property and Real Estate Case
                        </SelectItem>
                        <SelectItem value="International and Cross-Border Case">
                          International and Cross-Border Case
                        </SelectItem>
                        <SelectItem value="Intellectual Property (IP) Case">
                          Intellectual Property (IP) Case
                        </SelectItem>
                        <SelectItem value="Labor and Employment Case">
                          Labor and Employment Case
                        </SelectItem>
                        <SelectItem value="Taxation and Fiscal Case">
                          Taxation and Fiscal Case
                        </SelectItem>
                        <SelectItem value="Cyber Case">Cyber Case</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ✅ New: Case Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter case name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Case Description"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Case Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProjectStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => {
                  const [open, setOpen] = React.useState(false);
                  const [tempDate, setTempDate] = React.useState<
                    Date | undefined
                  >(field.value ? new Date(field.value) : undefined);

                  return (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Popover
                          open={open}
                          onOpenChange={setOpen}
                          modal={true}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={
                                "w-full justify-start text-left font-normal " +
                                (!field.value ? "text-muted-foreground" : "")
                              }
                            >
                              <CalendarIcon className="size-4 mr-2" />
                              {field.value ? (
                                format(new Date(field.value), "PPPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="flex flex-col space-y-3 p-3">
                            <Calendar
                              mode="single"
                              selected={tempDate}
                              onSelect={(date) =>
                                setTempDate(date ?? undefined)
                              }
                            />
                            <Button
                              type="button"
                              className="bg-black text-white hover:bg-gray-800"
                              onClick={() => {
                                if (tempDate) {
                                  field.onChange(tempDate.toISOString());
                                  setOpen(false);
                                } else {
                                  toast.error(
                                    "Please select a date before confirming."
                                  );
                                }
                              }}
                            >
                              OK
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => {
                  const [open, setOpen] = React.useState(false);
                  const [tempDate, setTempDate] = React.useState<
                    Date | undefined
                  >(field.value ? new Date(field.value) : undefined);

                  return (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Popover
                          open={open}
                          onOpenChange={setOpen}
                          modal={true}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={
                                "w-full justify-start text-left font-normal " +
                                (!field.value ? "text-muted-foreground" : "")
                              }
                            >
                              <CalendarIcon className="size-4 mr-2" />
                              {field.value ? (
                                format(new Date(field.value), "PPPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="flex flex-col space-y-3 p-3">
                            <Calendar
                              mode="single"
                              selected={tempDate}
                              onSelect={(date) =>
                                setTempDate(date ?? undefined)
                              }
                            />
                            <Button
                              type="button"
                              className="bg-black text-white hover:bg-gray-800"
                              onClick={() => {
                                if (tempDate) {
                                  field.onChange(tempDate.toISOString());
                                  setOpen(false);
                                } else {
                                  toast.error(
                                    "Please select a date before confirming."
                                  );
                                }
                              }}
                            >
                              OK
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tags separated by comma" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="members"
              render={({ field }) => {
                const selectedMembers = field.value || [];

                return (
                  <FormItem>
                    <FormLabel>Members</FormLabel>
                    <FormControl>
                      <Popover
                        open={membersPopoverOpen}
                        onOpenChange={setMembersPopoverOpen}
                        modal={true}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal min-h-11"
                          >
                            {selectedMembers.length === 0 ? (
                              <span className="text-muted-foreground">
                                Select Members
                              </span>
                            ) : selectedMembers.length <= 2 ? (
                              selectedMembers
                                .map((m) => {
                                  if (m.user === user?._id) {
                                    return `You (${
                                      m.role === "manager"
                                        ? "Lawyer"
                                        : m.role === "contributor"
                                        ? "Sublawyer"
                                        : "Client"
                                    })`;
                                  }
                                  const member = workspaceMembers.find(
                                    (wm) => wm.user._id === m.user
                                  );
                                  const roleDisplay =
                                    m.role === "manager"
                                      ? "Lawyer"
                                      : m.role === "contributor"
                                      ? "Sublawyer"
                                      : "Client";
                                  return `${member?.user.name} (${roleDisplay})`;
                                })
                                .join(", ")
                            ) : (
                              `${selectedMembers.length} members selected`
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-80 max-h-96 overflow-y-auto p-2"
                          align="start"
                        >
                          <div className="flex flex-col gap-2">
                            {user && (
                              <div className="flex items-center gap-2 p-2 border rounded bg-blue-50">
                                <Checkbox
                                  checked={true}
                                  disabled={true}
                                  id={`creator-${user._id}`}
                                />
                                <label
                                  htmlFor={`creator-${user._id}`}
                                  className="truncate flex-1 font-medium text-sm"
                                >
                                  You (Owner - Lawyer)
                                </label>
                              </div>
                            )}

                            {availableMembers.map((member) => {
                              const selectedMember = selectedMembers.find(
                                (m) => m.user === member.user._id
                              );
                              const isSelected = !!selectedMember;

                              return (
                                <div
                                  key={member._id}
                                  className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                                >
                                  <div
                                    className="flex items-center gap-2 flex-1 cursor-pointer"
                                    onClick={() => {
                                      if (isSelected) {
                                        field.onChange(
                                          selectedMembers.filter(
                                            (m) => m.user !== member.user._id
                                          )
                                        );
                                      } else {
                                        field.onChange([
                                          ...selectedMembers,
                                          {
                                            user: member.user._id,
                                            role: "contributor",
                                          },
                                        ]);
                                      }
                                    }}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      id={`member-${member.user._id}`}
                                    />
                                    <label
                                      htmlFor={`member-${member.user._id}`}
                                      className="truncate flex-1 text-sm cursor-pointer"
                                    >
                                      {member.user.name}
                                    </label>
                                  </div>

                                  {selectedMember && (
                                    <Select
                                      value={selectedMember.role}
                                      onValueChange={(role) => {
                                        field.onChange(
                                          selectedMembers.map((m) =>
                                            m.user === member.user._id
                                              ? {
                                                  ...m,
                                                  role: role as
                                                    | "contributor"
                                                    | "manager"
                                                    | "viewer",
                                                }
                                              : m
                                          )
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="w-28 h-8">
                                        <SelectValue placeholder="Role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="contributor">
                                          Sublawyer
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              );
                            })}

                            {availableMembers.length === 0 && (
                              <div className="text-sm text-muted-foreground text-center py-4">
                                No other members available
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            /> */}

            {/* ✅ NEW: Assignees Field */}
            <FormField
              control={form.control}
              name="assignees"
              render={({ field }) => {
                const selectedAssignees = field.value || [];

                return (
                  <FormItem>
                    <FormLabel>Assignees (Sublawyers)</FormLabel>
                    <FormControl>
                      <Popover
                        open={assigneesPopoverOpen}
                        onOpenChange={setAssigneesPopoverOpen}
                        modal={true}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal min-h-11"
                          >
                            {selectedAssignees.length === 0 ? (
                              <span className="text-muted-foreground">
                                Select Assignees
                              </span>
                            ) : selectedAssignees.length <= 2 ? (
                              selectedAssignees
                                .map((id) => {
                                  if (id === user?._id) return "You";
                                  const member = workspaceMembers.find(
                                    (wm) => wm.user._id === id
                                  );
                                  return member?.user.name || "Unknown";
                                })
                                .join(", ")
                            ) : (
                              `${selectedAssignees.length} assignees selected`
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-80 max-h-96 overflow-y-auto p-2"
                          align="start"
                        >
                          <div className="flex flex-col gap-2">
                            {user && (
                              <div className="flex items-center gap-2 p-2 border rounded bg-blue-50">
                                <Checkbox
                                  checked={true}
                                  disabled={true}
                                  id={`assignee-creator-${user._id}`}
                                />
                                <label
                                  htmlFor={`assignee-creator-${user._id}`}
                                  className="truncate flex-1 font-medium text-sm"
                                >
                                  You (Auto-assigned)
                                </label>
                              </div>
                            )}

                            {availableMembers.map((member) => {
                              const isSelected = selectedAssignees.includes(
                                member.user._id
                              );

                              return (
                                <div
                                  key={member.user._id}
                                  className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                                  onClick={() => {
                                    if (isSelected) {
                                      field.onChange(
                                        selectedAssignees.filter(
                                          (id) => id !== member.user._id
                                        )
                                      );
                                    } else {
                                      field.onChange([
                                        ...selectedAssignees,
                                        member.user._id,
                                      ]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    id={`assignee-${member.user._id}`}
                                  />
                                  <label
                                    htmlFor={`assignee-${member.user._id}`}
                                    className="truncate flex-1 text-sm cursor-pointer"
                                  >
                                    {member.user.name}
                                  </label>
                                </div>
                              );
                            })}

                            {availableMembers.length === 0 && (
                              <div className="text-sm text-muted-foreground text-center py-4">
                                No other members available
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* ✅ NEW: Clients Field */}
            <FormField
              control={form.control}
              name="clients"
              render={({ field }) => {
                const selectedClients = field.value || [];

                return (
                  <FormItem>
                    <FormLabel>Clients</FormLabel>
                    <FormControl>
                      <Popover
                        open={clientsPopoverOpen}
                        onOpenChange={setClientsPopoverOpen}
                        modal={true}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal min-h-11"
                          >
                            {selectedClients.length === 0 ? (
                              <span className="text-muted-foreground">
                                Select Clients
                              </span>
                            ) : selectedClients.length <= 2 ? (
                              selectedClients
                                .map((id) => {
                                  const member = workspaceMembers.find(
                                    (wm) => wm.user._id === id
                                  );
                                  return member?.user.name || "Unknown";
                                })
                                .join(", ")
                            ) : (
                              `${selectedClients.length} clients selected`
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-80 max-h-96 overflow-y-auto p-2"
                          align="start"
                        >
                          <div className="flex flex-col gap-2">
                            {availableMembers.map((member) => {
                              const isSelected = selectedClients.includes(
                                member.user._id
                              );

                              return (
                                <div
                                  key={member.user._id}
                                  className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                                  onClick={() => {
                                    if (isSelected) {
                                      field.onChange(
                                        selectedClients.filter(
                                          (id) => id !== member.user._id
                                        )
                                      );
                                    } else {
                                      field.onChange([
                                        ...selectedClients,
                                        member.user._id,
                                      ]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    id={`client-${member.user._id}`}
                                  />
                                  <label
                                    htmlFor={`client-${member.user._id}`}
                                    className="truncate flex-1 text-sm cursor-pointer"
                                  >
                                    {member.user.name}
                                  </label>
                                </div>
                              );
                            })}

                            {availableMembers.length === 0 && (
                              <div className="text-sm text-muted-foreground text-center py-4">
                                No other members available
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Case"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
