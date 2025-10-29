// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { format } from "date-fns";
// import { Calendar as CalendarIcon, Clock, Mail } from "lucide-react";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { cn } from "@/lib/utils";

// import { useCreateEvent } from "@/hooks/use-event";

// interface EventForm {
//   title: string;
//   description?: string;
//   dateTime: string;
// }

// interface CreateEventDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   userEmail: string;
// }

// export const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
//   open,
//   onOpenChange,
//   userEmail,
// }) => {
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>();
//   const [selectedTime, setSelectedTime] = useState<string>("");
//   const [calendarOpen, setCalendarOpen] = useState(false);
//   const [dateError, setDateError] = useState(false);
//   const [timeError, setTimeError] = useState(false);

//   const form = useForm<EventForm>({
//     defaultValues: {
//       title: "",
//       description: "",
//       dateTime: "",
//     },
//   });

//   const { mutate: createEvent, isPending } = useCreateEvent();

//   const onSubmit = (data: EventForm) => {
//     let hasError = false;

//     if (!selectedDate) {
//       setDateError(true);
//       hasError = true;
//     }

//     if (!selectedTime) {
//       setTimeError(true);
//       hasError = true;
//     }

//     if (hasError) {
//       toast.error("Please select both date and time");
//       return;
//     }

//     const [hours, minutes] = selectedTime.split(":");
//     const dateTime = new Date(selectedDate!);
//     dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

//     const now = new Date();
//     if (dateTime <= now) {
//       toast.error("Event date and time must be in the future");
//       return;
//     }

//     const eventData = {
//       ...data,
//       dateTime: dateTime.toISOString(),
//     };

//     createEvent(eventData, {
//       onSuccess: () => {
//         toast.success(
//           `Event created successfully! Email reminder will be sent to ${userEmail}`
//         );
//         form.reset({
//           title: "",
//           description: "",
//           dateTime: "",
//         });
//         setSelectedDate(undefined);
//         setSelectedTime("");
//         setDateError(false);
//         setTimeError(false);
//         onOpenChange(false);
//       },
//       onError: (error: any) => {
//         toast.error(error.response?.data?.message || "Failed to create event");
//       },
//     });
//   };

//   const getAvailableTimeOptions = () => {
//     const options = [];
//     const now = new Date();
//     const isToday =
//       selectedDate && selectedDate.toDateString() === now.toDateString();

//     for (let hour = 0; hour < 24; hour++) {
//       for (let minute = 0; minute < 60; minute += 15) {
//         const timeString = `${hour.toString().padStart(2, "0")}:${minute
//           .toString()
//           .padStart(2, "0")}`;

//         if (isToday) {
//           const timeDate = new Date(selectedDate);
//           timeDate.setHours(hour, minute, 0, 0);

//           if (timeDate > now) {
//             options.push(timeString);
//           }
//         } else {
//           options.push(timeString);
//         }
//       }
//     }
//     return options;
//   };

//   const timeOptions = getAvailableTimeOptions();

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Create Event Reminder</DialogTitle>
//           <DialogDescription>
//             Create a new event and receive an email reminder at the scheduled
//             time.
//           </DialogDescription>
//         </DialogHeader>

//         <Alert>
//           <Mail className="h-4 w-4" />
//           <AlertDescription>
//             Email reminder will be sent to: <strong>{userEmail}</strong>
//           </AlertDescription>
//         </Alert>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="title"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Event Title *</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Enter event title"
//                       maxLength={100}
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       placeholder="Enter event description (optional)"
//                       rows={3}
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormItem>
//                 <FormLabel>Date *</FormLabel>
//                 <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         "w-full justify-start text-left font-normal",
//                         !selectedDate && "text-muted-foreground",
//                         dateError && "border-red-500"
//                       )}
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {selectedDate ? (
//                         format(selectedDate, "PPP")
//                       ) : (
//                         <span>Select date</span>
//                       )}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-3" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={selectedDate}
//                       onSelect={(date) => {
//                         if (date) {
//                           setSelectedDate(date);
//                           setDateError(false);
//                           setCalendarOpen(false); // close automatically
//                         }
//                       }}
//                       disabled={(date) => {
//                         const today = new Date();
//                         today.setHours(0, 0, 0, 0);
//                         return date < today;
//                       }}
//                     />

//                     <div className="flex justify-end mt-2">
//                       <Button
//                         size="sm"
//                         onClick={() => {
//                           if (selectedDate) {
//                             setDateError(false);
//                           }
//                           setCalendarOpen(false);
//                         }}
//                       >
//                         OK
//                       </Button>
//                     </div>
//                   </PopoverContent>
//                 </Popover>
//                 {dateError && (
//                   <p className="text-sm text-red-500 mt-1">Date is required</p>
//                 )}
//               </FormItem>

//               <FormItem>
//                 <FormLabel>Time *</FormLabel>
//                 <Select
//                   value={selectedTime}
//                   onValueChange={(value) => {
//                     setSelectedTime(value);
//                     setTimeError(false);
//                   }}
//                   onOpenChange={(open) => {
//                     if (open && timeOptions.length === 0) {
//                       setSelectedTime("");
//                     }
//                   }}
//                 >
//                   <SelectTrigger className={timeError ? "border-red-500" : ""}>
//                     <SelectValue placeholder="Select time">
//                       <div className="flex items-center">
//                         <Clock className="mr-2 h-4 w-4" />
//                         {selectedTime || "Select time"}
//                       </div>
//                     </SelectValue>
//                   </SelectTrigger>
//                   <SelectContent className="max-h-60">
//                     {timeOptions.length > 0 ? (
//                       timeOptions.map((time) => (
//                         <SelectItem key={time} value={time}>
//                           {time}
//                         </SelectItem>
//                       ))
//                     ) : (
//                       <div className="p-2 text-sm text-muted-foreground text-center">
//                         {selectedDate &&
//                         selectedDate.toDateString() ===
//                           new Date().toDateString()
//                           ? "No future times available for today"
//                           : "No times available"}
//                       </div>
//                     )}
//                   </SelectContent>
//                 </Select>
//                 {timeError && (
//                   <p className="text-sm text-red-500 mt-1">Time is required</p>
//                 )}
//               </FormItem>
//             </div>

//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//                 disabled={isPending}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isPending}>
//                 {isPending ? "Creating..." : "Create Event"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { useCreateEvent } from "@/hooks/use-event";

interface EventForm {
  title: string;
  description?: string;
  dateTime: string;
}

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

export const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onOpenChange,
  userEmail,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);

  const form = useForm<EventForm>({
    defaultValues: {
      title: "",
      description: "",
      dateTime: "",
    },
  });

  const { mutate: createEvent, isPending } = useCreateEvent();

  const onSubmit = (data: EventForm) => {
    let hasError = false;
    if (!selectedDate) {
      setDateError(true);
      hasError = true;
    }
    if (!selectedTime) {
      setTimeError(true);
      hasError = true;
    }

    if (hasError) {
      toast.error("Please select both date and time");
      return;
    }

    const [hours, minutes] = selectedTime.split(":");
    const dateTime = new Date(selectedDate!);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    if (dateTime <= now) {
      toast.error("Event date and time must be in the future");
      return;
    }

    const eventData = { ...data, dateTime: dateTime.toISOString() };

    createEvent(eventData, {
      onSuccess: () => {
        toast.success(
          `Event created successfully! Email reminder will be sent to ${userEmail}`
        );
        form.reset();
        setSelectedDate(undefined);
        setSelectedTime("");
        setDateError(false);
        setTimeError(false);
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create event");
      },
    });
  };

  const getAvailableTimeOptions = () => {
    const options = [];
    const now = new Date();
    const isToday =
      selectedDate && selectedDate.toDateString() === now.toDateString();

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        if (isToday) {
          const timeDate = new Date(selectedDate);
          timeDate.setHours(hour, minute, 0, 0);
          if (timeDate > now) options.push(timeString);
        } else {
          options.push(timeString);
        }
      }
    }
    return options;
  };

  const timeOptions = getAvailableTimeOptions();

  // ✅ FIXED: Popover stays open while interacting with the calendar
  // ✅ FIXED: OK button to confirm and close manually
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event Reminder</DialogTitle>
          <DialogDescription>
            Create a new event and receive an email reminder at the scheduled
            time.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Email reminder will be sent to: <strong>{userEmail}</strong>
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter event title"
                      maxLength={100}
                      {...field}
                    />
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
                      placeholder="Enter event description (optional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DATE PICKER */}
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <Popover
                  open={calendarOpen}
                  onOpenChange={setCalendarOpen}
                  modal={true}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                        dateError && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    onInteractOutside={(e) => e.preventDefault()} // ✅ prevents premature closing
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setDateError(false);
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                    <div className="p-3 border-t flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedDate(undefined);
                          setCalendarOpen(false);
                        }}
                        className="flex-1"
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (selectedDate) setDateError(false);
                          setCalendarOpen(false);
                        }}
                        className="flex-1"
                        size="sm"
                      >
                        OK
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {dateError && (
                  <p className="text-sm text-red-500 mt-1">Date is required</p>
                )}
              </FormItem>

              {/* TIME PICKER */}
              <FormItem>
                <FormLabel>Time *</FormLabel>
                <Select
                  value={selectedTime}
                  onValueChange={(value) => {
                    setSelectedTime(value);
                    setTimeError(false);
                  }}
                >
                  <SelectTrigger className={timeError ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select time">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {selectedTime || "Select time"}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeOptions.length > 0 ? (
                      timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No available times
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {timeError && (
                  <p className="text-sm text-red-500 mt-1">Time is required</p>
                )}
              </FormItem>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
