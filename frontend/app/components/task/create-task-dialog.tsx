// // In frontend/app/components/task/create-task-dialog.tsx - Update the CreateTaskDialog component

// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useCreateTaskMutation } from "@/hooks/use-task";
// import { createTaskSchema } from "@/lib/schema";
// import type { ProjectMemberRole, User } from "@/types";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { format } from "date-fns";
// import { CalendarIcon } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import type { z } from "zod";
// import { Button } from "../ui/button";
// import { Calendar } from "../ui/calendar";
// import { Checkbox } from "../ui/checkbox";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "../ui/form";
// import { Input } from "../ui/input";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { Textarea } from "../ui/textarea";
// import { useAuth } from "@/provider/auth-context"; // ✅ NEW: Import auth context

// interface CreateTaskDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   projectId: string;
//   projectMembers: { user: User; role: ProjectMemberRole }[];
// }

// export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

// export const CreateTaskDialog = ({
//   open,
//   onOpenChange,
//   projectId,
//   projectMembers,
// }: CreateTaskDialogProps) => {
//   const { user } = useAuth(); // ✅ NEW: Get current user

//   const form = useForm<CreateTaskFormData>({
//     resolver: zodResolver(createTaskSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       status: "To Do",
//       priority: "Medium",
//       dueDate: "",
//       assignees: user ? [user._id] : [], // ✅ NEW: Auto-assign creator
//       clients: [],
//     },
//   });

//   const { mutate, isPending } = useCreateTaskMutation();

//   const onSubmit = (values: CreateTaskFormData) => {
//     // ✅ NEW: Ensure creator is always in assignees
//     const finalAssignees = values.assignees || [];
//     if (user && !finalAssignees.includes(user._id)) {
//       finalAssignees.push(user._id);
//     }

//     mutate(
//       {
//         projectId,
//         taskData: {
//           ...values,
//           assignees: finalAssignees, // ✅ Use updated assignees
//         },
//       },
//       {
//         onSuccess: () => {
//           toast.success("Case created successfully");
//           form.reset({
//             title: "",
//             description: "",
//             status: "To Do",
//             priority: "Medium",
//             dueDate: "",
//             assignees: user ? [user._id] : [], // ✅ Reset with creator auto-assigned
//             clients: [],
//           });
//           onOpenChange(false);
//         },
//         onError: (error: any) => {
//           const errorMessage = error.response.data.message;
//           toast.error(errorMessage);
//           console.log(error);
//         },
//       }
//     );
//   };

//   // ✅ NEW: Filter out current user from dropdown options
//   const availableMembers = projectMembers.filter(
//     (member) => member.user._id !== user?._id
//   );

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create Case</DialogTitle>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <div className="grid gap-4 py-4">
//               <div className="grid gap-2">
//                 <FormField
//                   control={form.control}
//                   name="title"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Title</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="Enter case title" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           {...field}
//                           placeholder="Enter case description"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <div className="grid gap-4 md:grid-cols-2">
//                   <FormField
//                     control={form.control}
//                     name="status"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Status</FormLabel>
//                         <FormControl>
//                           <Select
//                             onValueChange={field.onChange}
//                             defaultValue={field.value}
//                           >
//                             <FormItem>
//                               <FormControl>
//                                 <SelectTrigger className="w-full">
//                                   <SelectValue placeholder="Select status" />
//                                 </SelectTrigger>
//                               </FormControl>

//                               <SelectContent>
//                                 <SelectItem value="To Do">
//                                   Filed Cases
//                                 </SelectItem>
//                                 <SelectItem value="In Progress">
//                                   Case In Progress
//                                 </SelectItem>
//                                 <SelectItem value="Done">
//                                   Closed Cases
//                                 </SelectItem>
//                               </SelectContent>
//                             </FormItem>
//                           </Select>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="priority"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Priority</FormLabel>
//                         <FormControl>
//                           <Select
//                             onValueChange={field.onChange}
//                             defaultValue={field.value}
//                           >
//                             <FormItem>
//                               <FormControl>
//                                 <SelectTrigger className="w-full">
//                                   <SelectValue placeholder="Select priority" />
//                                 </SelectTrigger>
//                               </FormControl>

//                               <SelectContent>
//                                 <SelectItem value="Low">Low</SelectItem>
//                                 <SelectItem value="Medium">Medium</SelectItem>
//                                 <SelectItem value="High">High</SelectItem>
//                               </SelectContent>
//                             </FormItem>
//                           </Select>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <FormField
//                   control={form.control}
//                   name="dueDate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Due Date</FormLabel>
//                       <FormControl>
//                         <Popover modal={true}>
//                           <PopoverTrigger asChild>
//                             <Button
//                               variant={"outline"}
//                               className={
//                                 "w-full justify-start text-left font-normal" +
//                                 (!field.value ? "text-muted-foreground" : "")
//                               }
//                             >
//                               <CalendarIcon className="size-4 mr-2" />
//                               {field.value ? (
//                                 format(new Date(field.value), "PPPP")
//                               ) : (
//                                 <span>Pick a date</span>
//                               )}
//                             </Button>
//                           </PopoverTrigger>

//                           <PopoverContent>
//                             <Calendar
//                               mode="single"
//                               selected={
//                                 field.value ? new Date(field.value) : undefined
//                               }
//                               onSelect={(date) => {
//                                 field.onChange(
//                                   date?.toISOString() || undefined
//                                 );
//                               }}
//                             />
//                           </PopoverContent>
//                         </Popover>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="assignees"
//                   render={({ field }) => {
//                     const selectedMembers = field.value || [];

//                     return (
//                       <FormItem>
//                         <FormLabel>Assignees</FormLabel>
//                         <FormControl>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 className="w-full justify-start text-left font-normal min-h-11"
//                               >
//                                 {selectedMembers.length === 0 ? (
//                                   <span className="text-muted-foreground">
//                                     Select assignees
//                                   </span>
//                                 ) : selectedMembers.length <= 2 ? (
//                                   selectedMembers
//                                     .map((m) => {
//                                       if (m === user?._id) {
//                                         return "You"; // ✅ Show "You" for current user
//                                       }
//                                       const member = projectMembers.find(
//                                         (wm) => wm.user._id === m
//                                       );
//                                       return member?.user.name || "Unknown";
//                                     })
//                                     .join(", ")
//                                 ) : (
//                                   `${selectedMembers.length} assignees selected`
//                                 )}
//                               </Button>
//                             </PopoverTrigger>

//                             <PopoverContent
//                               className="w-sm max-h-60 overflow-y-auto p-2"
//                               align="start"
//                             >
//                               <div className="flex flex-col gap-2">
//                                 {/* ✅ NEW: Show current user first (disabled) */}
//                                 {user && (
//                                   <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
//                                     <Checkbox
//                                       checked={true}
//                                       disabled={true}
//                                       id={`creator-${user._id}`}
//                                     />
//                                     <span className="truncate flex-1 font-medium">
//                                       You (Creator) - Auto-assigned
//                                     </span>
//                                   </div>
//                                 )}

//                                 {/* ✅ Show other members (excluding current user) */}
//                                 {availableMembers.map((member) => {
//                                   const selectedMember = selectedMembers.find(
//                                     (m) => m === member.user._id
//                                   );
//                                   return (
//                                     <div
//                                       key={member.user._id}
//                                       className="flex items-center gap-2 p-2 border rounded"
//                                     >
//                                       <Checkbox
//                                         checked={!!selectedMember}
//                                         onCheckedChange={(checked) => {
//                                           if (checked) {
//                                             field.onChange([
//                                               ...selectedMembers,
//                                               member.user._id,
//                                             ]);
//                                           } else {
//                                             field.onChange(
//                                               selectedMembers.filter(
//                                                 (m) => m !== member.user._id
//                                               )
//                                             );
//                                           }
//                                         }}
//                                         id={`member-${member.user._id}`}
//                                       />
//                                       <span className="truncate flex-1">
//                                         {member.user.name}
//                                       </span>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </PopoverContent>
//                           </Popover>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     );
//                   }}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="clients"
//                   render={({ field }) => {
//                     const selectedMembers = field.value || [];

//                     // ✅ Exclude current user from Clients dropdown
//                     const availableClients = projectMembers.filter(
//                       (member) => member.user._id !== user?._id
//                     );

//                     return (
//                       <FormItem>
//                         <FormLabel>Clients</FormLabel>
//                         <FormControl>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 className="w-full justify-start text-left font-normal min-h-11"
//                               >
//                                 {selectedMembers.length === 0 ? (
//                                   <span className="text-muted-foreground">
//                                     Select Clients
//                                   </span>
//                                 ) : selectedMembers.length <= 2 ? (
//                                   selectedMembers
//                                     .map((m) => {
//                                       const member = projectMembers.find(
//                                         (wm) => wm.user._id === m
//                                       );
//                                       return `${member?.user.name}`;
//                                     })
//                                     .join(", ")
//                                 ) : (
//                                   `${selectedMembers.length} clients selected`
//                                 )}
//                               </Button>
//                             </PopoverTrigger>

//                             <PopoverContent
//                               className="w-sm max-h-60 overflow-y-auto p-2"
//                               align="start"
//                             >
//                               <div className="flex flex-col gap-2">
//                                 {availableClients.map((member) => {
//                                   const selectedMember = selectedMembers.find(
//                                     (m) => m === member.user._id
//                                   );
//                                   return (
//                                     <div
//                                       key={member.user._id}
//                                       className="flex items-center gap-2 p-2 border rounded"
//                                     >
//                                       <Checkbox
//                                         checked={!!selectedMember}
//                                         onCheckedChange={(checked) => {
//                                           if (checked) {
//                                             field.onChange([
//                                               ...selectedMembers,
//                                               member.user._id,
//                                             ]);
//                                           } else {
//                                             field.onChange(
//                                               selectedMembers.filter(
//                                                 (m) => m !== member.user._id
//                                               )
//                                             );
//                                           }
//                                         }}
//                                         id={`client-${member.user._id}`}
//                                       />
//                                       <span className="truncate flex-1">
//                                         {member.user.name}
//                                       </span>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </PopoverContent>
//                           </Popover>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     );
//                   }}
//                 />
//               </div>
//             </div>

//             <DialogFooter>
//               <Button type="submit" disabled={isPending}>
//                 {isPending ? "Creating..." : "Create Case"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTaskMutation } from "@/hooks/use-task";
import { createTaskSchema } from "@/lib/schema";
import type { ProjectMemberRole, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { useState } from "react"; // ✅ NEW
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useAuth } from "@/provider/auth-context";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectMembers: { user: User; role: ProjectMemberRole }[];
}

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const CreateTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  projectMembers,
}: CreateTaskDialogProps) => {
  const { user } = useAuth();

  // ✅ NEW: Control popover open state
  const [assigneesPopoverOpen, setAssigneesPopoverOpen] = useState(false);
  const [clientsPopoverOpen, setClientsPopoverOpen] = useState(false);

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      dueDate: "",
      assignees: user ? [user._id] : [],
      clients: [],
    },
  });

  const { mutate, isPending } = useCreateTaskMutation();

  const onSubmit = (values: CreateTaskFormData) => {
    const finalAssignees = values.assignees || [];
    if (user && !finalAssignees.includes(user._id)) {
      finalAssignees.push(user._id);
    }

    mutate(
      {
        projectId,
        taskData: {
          ...values,
          assignees: finalAssignees,
        },
      },
      {
        onSuccess: () => {
          toast.success("Case created successfully");
          form.reset({
            title: "",
            description: "",
            status: "To Do",
            priority: "Medium",
            dueDate: "",
            assignees: user ? [user._id] : [],
            clients: [],
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

  const availableMembers = projectMembers.filter(
    (member) => member.user._id !== user?._id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Case</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter case title" />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter case description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormItem>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectItem value="To Do">
                                  Filed Cases
                                </SelectItem>
                                <SelectItem value="In Progress">
                                  Case In Progress
                                </SelectItem>
                                <SelectItem value="Done">
                                  Closed Cases
                                </SelectItem>
                              </SelectContent>
                            </FormItem>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormItem>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </FormItem>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={
                                "w-full justify-start text-left font-normal" +
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

                          <PopoverContent>
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                field.onChange(
                                  date?.toISOString() || undefined
                                );
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignees"
                  render={({ field }) => {
                    const selectedMembers = field.value || [];

                    return (
                      <FormItem>
                        <FormLabel>Assignees</FormLabel>
                        <FormControl>
                          <Popover
                            open={assigneesPopoverOpen}
                            onOpenChange={setAssigneesPopoverOpen}
                            modal={true}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left font-normal min-h-11"
                              >
                                {selectedMembers.length === 0 ? (
                                  <span className="text-muted-foreground">
                                    Select assignees
                                  </span>
                                ) : selectedMembers.length <= 2 ? (
                                  selectedMembers
                                    .map((m) => {
                                      if (m === user?._id) {
                                        return "You";
                                      }
                                      const member = projectMembers.find(
                                        (wm) => wm.user._id === m
                                      );
                                      return member?.user.name || "Unknown";
                                    })
                                    .join(", ")
                                ) : (
                                  `${selectedMembers.length} assignees selected`
                                )}
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent
                              className="w-80 max-h-60 overflow-y-auto p-2"
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
                                      You (Creator) - Auto-assigned
                                    </label>
                                  </div>
                                )}

                                {availableMembers.map((member) => {
                                  const isSelected = selectedMembers.includes(
                                    member.user._id
                                  );
                                  return (
                                    <div
                                      key={member.user._id}
                                      className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                                      onClick={() => {
                                        if (isSelected) {
                                          field.onChange(
                                            selectedMembers.filter(
                                              (m) => m !== member.user._id
                                            )
                                          );
                                        } else {
                                          field.onChange([
                                            ...selectedMembers,
                                            member.user._id,
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
                                  );
                                })}
                              </div>
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
                  name="clients"
                  render={({ field }) => {
                    const selectedMembers = field.value || [];
                    const availableClients = projectMembers.filter(
                      (member) => member.user._id !== user?._id
                    );

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
                                variant="outline"
                                className="w-full justify-start text-left font-normal min-h-11"
                              >
                                {selectedMembers.length === 0 ? (
                                  <span className="text-muted-foreground">
                                    Select Clients
                                  </span>
                                ) : selectedMembers.length <= 2 ? (
                                  selectedMembers
                                    .map((m) => {
                                      const member = projectMembers.find(
                                        (wm) => wm.user._id === m
                                      );
                                      return member?.user.name || "Unknown";
                                    })
                                    .join(", ")
                                ) : (
                                  `${selectedMembers.length} clients selected`
                                )}
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent
                              className="w-80 max-h-60 overflow-y-auto p-2"
                              align="start"
                            >
                              <div className="flex flex-col gap-2">
                                {availableClients.length === 0 ? (
                                  <div className="text-sm text-muted-foreground text-center py-4">
                                    No other members available
                                  </div>
                                ) : (
                                  availableClients.map((member) => {
                                    const isSelected = selectedMembers.includes(
                                      member.user._id
                                    );
                                    return (
                                      <div
                                        key={member.user._id}
                                        className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                          if (isSelected) {
                                            field.onChange(
                                              selectedMembers.filter(
                                                (m) => m !== member.user._id
                                              )
                                            );
                                          } else {
                                            field.onChange([
                                              ...selectedMembers,
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
                                  })
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
              </div>
            </div>

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
