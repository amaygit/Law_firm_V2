// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";
// import { useAddTaskHearingMutation } from "@/hooks/use-task";
// import type { Hearing } from "@/types";

// interface TaskHearingsProps {
//   taskId: string;
//   hearings?: Hearing[];
//   isClient?: boolean;
//   favourPercentage?: number;
// }

// export const TaskHearings: React.FC<TaskHearingsProps> = ({
//   taskId,
//   hearings: initialHearings = [],
//   isClient = false,
//   favourPercentage: initialFavour = 0,
// }) => {
//   const { mutate: addHearing, isPending } = useAddTaskHearingMutation();
//   const [formOpen, setFormOpen] = useState(false);
//   const [date, setDate] = useState("");
//   const [description, setDescription] = useState("");
//   const [inFavour, setInFavour] = useState(true);

//   // 👇 local state for UI update
//   const [hearings, setHearings] = useState(initialHearings);
//   const [favourPercentage, setFavourPercentage] = useState(initialFavour);

//   const handleSave = () => {
//     if (!date) {
//       toast.error("Date is required");
//       return;
//     }

//     addHearing(
//       { taskId, date, description, inFavour },
//       {
//         onSuccess: (data) => {
//           toast.success("Hearing added");
//           setFormOpen(false);
//           setDate("");
//           setDescription("");
//           setInFavour(true);

//           // 👇 Update local state from response
//           setHearings(data.task.hearings);
//           setFavourPercentage(data.favourPercentage);
//         },
//         onError: () => toast.error("Failed to add hearing"),
//       }
//     );
//   };

//   return (
//     <div className="mb-6">
//       <div className="flex items-center justify-between mb-2">
//         <h3 className="text-sm font-medium text-muted-foreground">Hearings</h3>
//         {/* 👇 Show favour percentage */}
//         <span className="text-xs font-medium">Favour: {favourPercentage}%</span>
//       </div>

//       {/* List of hearings */}
//       {hearings.length === 0 ? (
//         <p className="text-xs text-muted-foreground">No hearings added</p>
//       ) : (
//         <ul className="space-y-2">
//           {hearings.map((h, i) => (
//             <li
//               key={i}
//               className="p-2 border rounded bg-gray-50 text-sm flex flex-col"
//             >
//               <span className="font-medium">
//                 {new Date(h.date).toLocaleDateString()}{" "}
//                 <span
//                   className={`ml-2 text-xs px-2 py-0.5 rounded ${
//                     h.inFavour
//                       ? "bg-green-100 text-green-700"
//                       : "bg-red-100 text-red-700"
//                   }`}
//                 >
//                   {h.inFavour ? "In our favour" : "Not in our favour"}
//                 </span>
//               </span>
//               {h.description && (
//                 <span className="text-muted-foreground text-xs mt-1">
//                   {h.description}
//                 </span>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* Add new hearing form */}
//       {!isClient && (
//         <div className="mt-3">
//           {formOpen ? (
//             <div className="space-y-2">
//               <Input
//                 type="date"
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//               />
//               <Textarea
//                 placeholder="Description (optional)"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               />
//               <div className="flex gap-2 items-center">
//                 <label className="text-sm">Result:</label>
//                 <select
//                   value={inFavour ? "true" : "false"}
//                   onChange={(e) => setInFavour(e.target.value === "true")}
//                   className="border rounded px-2 py-1 text-sm"
//                 >
//                   <option value="true">In our favour</option>
//                   <option value="false">Not in our favour</option>
//                 </select>
//               </div>

//               <div className="flex gap-2">
//                 <Button size="sm" onClick={handleSave} disabled={isPending}>
//                   Save
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setFormOpen(false)}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={() => setFormOpen(true)}
//             >
//               Add Hearing
//             </Button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAddTaskHearingMutation } from "@/hooks/use-task";
import type { Hearing } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// Import recharts components
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface TaskHearingsProps {
  taskId: string;
  hearings?: Hearing[];
  isClient?: boolean;
  favourPercentage?: number;
}

export const TaskHearings: React.FC<TaskHearingsProps> = ({
  taskId,
  hearings: initialHearings = [],
  isClient = false,
  favourPercentage: initialFavour = 0,
}) => {
  const { mutate: addHearing, isPending } = useAddTaskHearingMutation();
  const [formOpen, setFormOpen] = useState(false);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [inFavour, setInFavour] = useState(true);

  // Local state for UI update
  const [hearings, setHearings] = useState(initialHearings);
  const [favourPercentage, setFavourPercentage] = useState(initialFavour);

  // Sync local state with incoming props
  useEffect(() => {
    setHearings(initialHearings);
    setFavourPercentage(initialFavour);
  }, [initialHearings, initialFavour]);

  const handleSave = () => {
    if (!date) {
      toast.error("Date is required");
      return;
    }
    addHearing(
      { taskId, date, description, inFavour },
      {
        onSuccess: (data) => {
          toast.success("Hearing added");
          setFormOpen(false);
          setDate("");
          setDescription("");
          setInFavour(true);
          setHearings(data.task.hearings);
          setFavourPercentage(data.favourPercentage);
        },
        onError: () => toast.error("Failed to add hearing"),
      }
    );
  };
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    date ? new Date(date) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Prepare data for the pie chart
  const chartData = [
    { name: "Favour", value: favourPercentage, fill: "#96f2b6" }, // Tailwind green-500
    { name: "Unfavour", value: 100 - favourPercentage, fill: "#f29696" }, // Tailwind red-500
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-muted-foreground">Hearings</h2>
      </div>

      {/* Pie Chart only if there are hearings */}
      {hearings.length > 0 && (
        <>
          <div className="flex items-center justify-center mb-2">
            {/* Responsive/compact chart */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={32}
                    outerRadius={55}
                    paddingAngle={0}
                    isAnimationActive={false}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Centered label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-bold text-green-700">
                  {favourPercentage}%
                </span>
                <span className="text-xs font-bold text-gray-500">Favour</span>
              </div>
            </div>
          </div>
          {/* Simple legend */}
          <div className="flex justify-center gap-3 mb-2">
            <span className="flex items-center text-xs">
              <span className="block w-3 h-3 rounded-full bg-green-300 mr-1" />
              Favour
            </span>
            <span className="flex items-center text-xs">
              <span className="block w-3 h-3 rounded-full bg-red-300 mr-1" />
              Unfavour
            </span>
          </div>
        </>
      )}

      {/* List of hearings */}
      {hearings.length === 0 ? (
        <p className="text-xs text-muted-foreground">No hearings added</p>
      ) : (
        <ul className="space-y-2">
          {hearings.map((h, i) => (
            <li
              key={i}
              className="p-2 border rounded bg-gray-50 text-sm flex flex-col"
            >
              <span className="font-medium">
                {new Date(h.date).toLocaleDateString()}{" "}
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    h.inFavour
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {h.inFavour ? "In our favour" : "Not in our favour"}
                </span>
              </span>
              {h.description && (
                <span className="text-muted-foreground text-xs mt-1">
                  {h.description}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add new hearing form */}
      {!isClient && (
        <div className="mt-3">
          {formOpen ? (
            <div className="space-y-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-3" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(newDate) => setSelectedDate(newDate)}
                    initialFocus
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedDate)
                          setDate(selectedDate.toISOString().split("T")[0]);
                        setCalendarOpen(false);
                      }}
                    >
                      OK
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-2 items-center">
                <label className="text-sm">Result:</label>
                <select
                  value={inFavour ? "true" : "false"}
                  onChange={(e) => setInFavour(e.target.value === "true")}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="true">In our favour</option>
                  <option value="false">Not in our favour</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={isPending}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFormOpen(true)}
            >
              Add Hearing
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
