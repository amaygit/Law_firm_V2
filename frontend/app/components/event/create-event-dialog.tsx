import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Plus, Trash2 } from "lucide-react";
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

import { useCreateEvent } from "@/hooks/use-event";

// ✅ SIMPLE: Define form type without phoneNumbers array
interface EventFormWithoutNumbers {
  title: string;
  description?: string;
  dateTime: string;
}

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  // ✅ SIMPLE: Use regular state for phone numbers
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);

  const form = useForm<EventFormWithoutNumbers>({
    defaultValues: {
      title: "",
      description: "",
      dateTime: "",
    },
  });

  const { mutate: createEvent, isPending } = useCreateEvent();

  // Phone number management functions
  const addPhoneNumber = () => {
    if (phoneNumbers.length < 2) {
      setPhoneNumbers([...phoneNumbers, ""]);
      setPhoneErrors([...phoneErrors, ""]);
    }
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
      setPhoneErrors(phoneErrors.filter((_, i) => i !== index));
    }
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const updated = [...phoneNumbers];
    updated[index] = value;
    setPhoneNumbers(updated);

    // Clear error when user starts typing
    const updatedErrors = [...phoneErrors];
    updatedErrors[index] = "";
    setPhoneErrors(updatedErrors);
  };

  // Validation for phone numbers
  const validatePhoneNumbers = (): boolean => {
    const errors: string[] = [];
    let hasErrors = false;

    phoneNumbers.forEach((phone, index) => {
      if (!phone || !phone.trim()) {
        errors[index] = "Phone number is required";
        hasErrors = true;
      } else if (phone.replace(/\D/g, "").length < 10) {
        errors[index] = "Phone number must be at least 10 digits";
        hasErrors = true;
      } else if (!/^[\+]?[0-9\s\-\(\)]+$/.test(phone)) {
        errors[index] = "Please enter a valid phone number";
        hasErrors = true;
      } else {
        errors[index] = "";
      }
    });

    // Check for duplicates
    const cleanNumbers = phoneNumbers.map((p) => p.replace(/\D/g, ""));
    const uniqueNumbers = [...new Set(cleanNumbers)];
    if (uniqueNumbers.length !== cleanNumbers.length) {
      errors.forEach((_, index) => {
        if (!errors[index]) {
          errors[index] = "Duplicate phone numbers not allowed";
        }
      });
      hasErrors = true;
    }

    setPhoneErrors(errors);
    return !hasErrors;
  };

  const onSubmit = (data: EventFormWithoutNumbers) => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    // Validate phone numbers
    if (!validatePhoneNumbers()) {
      toast.error("Please fix phone number errors");
      return;
    }

    const [hours, minutes] = selectedTime.split(":");
    const dateTime = new Date(selectedDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // ✅ IMPROVED: More precise future date validation
    const now = new Date();
    if (dateTime <= now) {
      toast.error("Event date and time must be in the future");
      return;
    }

    const validPhoneNumbers = phoneNumbers.filter(
      (phone) => phone && phone.trim()
    );

    if (validPhoneNumbers.length === 0) {
      toast.error("At least one phone number is required");
      return;
    }

    const eventData = {
      ...data,
      phoneNumbers: validPhoneNumbers,
      dateTime: dateTime.toISOString(),
    };

    createEvent(eventData, {
      onSuccess: () => {
        toast.success(
          `Event created successfully! WhatsApp reminder scheduled for ${validPhoneNumbers.length} number(s).`
        );
        // Reset form
        form.reset({
          title: "",
          description: "",
          dateTime: "",
        });
        setPhoneNumbers([""]);
        setPhoneErrors([]);
        setSelectedDate(undefined);
        setSelectedTime("");
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create event");
      },
    });
  };

  // Generate time options (24-hour format)
  // ✅ SMART: Filter times based on selected date
  const getAvailableTimeOptions = () => {
    const options = [];
    const now = new Date();
    const isToday =
      selectedDate && selectedDate.toDateString() === now.toDateString();

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // ✅ If today is selected, only show future times
        if (isToday) {
          const timeDate = new Date(selectedDate);
          timeDate.setHours(hour, minute, 0, 0);

          // Only add times that are at least 1 minute in the future
          if (timeDate > now) {
            options.push(timeString);
          }
        } else {
          // For future dates, show all times
          options.push(timeString);
        }
      }
    }
    return options;
  };

  const timeOptions = getAvailableTimeOptions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event Reminder</DialogTitle>
          <DialogDescription>
            Create a new event with WhatsApp reminders. You can add up to 2
            phone numbers.
          </DialogDescription>
        </DialogHeader>

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
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        // ✅ FIXED: Only disable dates before today, allow today
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {!selectedDate && (
                  <p className="text-sm text-red-500 mt-1">Date is required</p>
                )}
              </FormItem>

              <FormItem>
                <FormLabel>Time *</FormLabel>
                <Select
                  value={selectedTime}
                  onValueChange={setSelectedTime}
                  onOpenChange={(open) => {
                    // ✅ Clear selected time if no options available for today
                    if (open && timeOptions.length === 0) {
                      setSelectedTime("");
                    }
                  }}
                >
                  <SelectTrigger>
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
                        {selectedDate &&
                        selectedDate.toDateString() ===
                          new Date().toDateString()
                          ? "No future times available for today"
                          : "No times available"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {!selectedTime && (
                  <p className="text-sm text-red-500 mt-1">Time is required</p>
                )}
              </FormItem>
            </div>

            {/* ✅ SIMPLE: Manual phone number management */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>WhatsApp Phone Numbers * (Max 2)</FormLabel>
                {phoneNumbers.length < 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPhoneNumber}
                    className="text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Number
                  </Button>
                )}
              </div>

              {phoneNumbers.map((phoneNumber, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Phone number ${
                        index + 1
                      } (e.g., +919876543210)`}
                      value={phoneNumber}
                      onChange={(e) => updatePhoneNumber(index, e.target.value)}
                    />
                    {phoneErrors[index] && (
                      <p className="text-sm text-red-500 mt-1">
                        {phoneErrors[index]}
                      </p>
                    )}
                  </div>
                  {phoneNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePhoneNumber(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +91 for India). You can add up to 2
                phone numbers.
              </p>
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
