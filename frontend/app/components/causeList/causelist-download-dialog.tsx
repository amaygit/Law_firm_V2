// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Download, FileText, Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import {
//   useFetchCauseListDates,
//   useFetchCauseListCourts,
//   useDownloadCauseList,
//   type CourtOption,
// } from "@/hooks/use-causelist";

// export const CauseListDownloadDialog = () => {
//   const [open, setOpen] = useState(false);
//   const [selectedCourt, setSelectedCourt] = useState("");
//   const [availableDates, setAvailableDates] = useState<string[]>([]);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [courtOptions, setCourtOptions] = useState<CourtOption[]>([]);
//   const [selectedCourtNo, setSelectedCourtNo] = useState("");

//   // Hooks
//   const { mutate: fetchDates, isPending: loadingDates } =
//     useFetchCauseListDates();
//   const { mutate: fetchCourts, isPending: loadingCourts } =
//     useFetchCauseListCourts();
//   const { mutate: downloadPDF, isPending: downloading } =
//     useDownloadCauseList();

//   // Reset all states when dialog closes
//   const handleOpenChange = (isOpen: boolean) => {
//     setOpen(isOpen);
//     if (!isOpen) {
//       setSelectedCourt("");
//       setAvailableDates([]);
//       setSelectedDate("");
//       setCourtOptions([]);
//       setSelectedCourtNo("");
//     }
//   };

//   // Step 1: Fetch available dates when Allahabad HC is selected
//   const handleCourtSelect = (court: string) => {
//     setSelectedCourt(court);
//     setSelectedDate("");
//     setCourtOptions([]);
//     setSelectedCourtNo("");

//     if (court !== "allahabad") return;

//     fetchDates("allahabad", {
//       onSuccess: (data) => {
//         if (data.success && data.dates) {
//           setAvailableDates(data.dates);

//           if (data.dates.length === 0) {
//             toast.error("No dates available for this court");
//           }
//         } else {
//           toast.error("Failed to fetch dates");
//           setAvailableDates([]);
//         }
//       },
//       onError: (error: any) => {
//         console.error("Error fetching dates:", error);
//         toast.error(
//           error.response?.data?.message || "Failed to fetch available dates"
//         );
//         setAvailableDates([]);
//       },
//     });
//   };

//   // Step 2: Fetch court numbers when date is selected
//   const handleDateSelect = (date: string) => {
//     setSelectedDate(date);
//     setCourtOptions([]);
//     setSelectedCourtNo("");

//     fetchCourts(
//       {
//         court: "allahabad",
//         date: date,
//       },
//       {
//         onSuccess: (data) => {
//           if (data.success && data.courts) {
//             setCourtOptions(data.courts);

//             if (data.courts.length === 0) {
//               toast.error("No courts available for this date");
//             }
//           } else {
//             toast.error("Failed to fetch courts");
//             setCourtOptions([]);
//           }
//         },
//         onError: (error: any) => {
//           console.error("Error fetching courts:", error);
//           toast.error(
//             error.response?.data?.message || "Failed to fetch available courts"
//           );
//           setCourtOptions([]);
//         },
//       }
//     );
//   };

//   // Step 3: Download PDF
//   const handleDownload = () => {
//     if (!selectedCourtNo || !selectedDate) {
//       toast.error("Please select all required fields");
//       return;
//     }

//     downloadPDF(
//       {
//         court: "allahabad",
//         date: selectedDate,
//         courtNo: selectedCourtNo,
//       },
//       {
//         onSuccess: (blob) => {
//           // Create download link
//           const url = window.URL.createObjectURL(blob);
//           const link = document.createElement("a");
//           link.href = url;

//           const selectedCourtText =
//             courtOptions.find((c) => c.value === selectedCourtNo)?.text ||
//             selectedCourtNo;

//           const fileName = `CauseList_${selectedCourtText.replace(
//             /\s+/g,
//             "_"
//           )}_${selectedDate}.pdf`;
//           link.setAttribute("download", fileName);
//           document.body.appendChild(link);
//           link.click();
//           link.remove();
//           window.URL.revokeObjectURL(url);

//           toast.success("Cause list downloaded successfully!");
//           handleOpenChange(false);
//         },
//         onError: (error: any) => {
//           console.error("Error downloading PDF:", error);
//           toast.error(error.message || "Failed to download cause list");
//         },
//       }
//     );
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogTrigger asChild>
//         <Button variant="ghost" className="justify-start w-full">
//           <FileText className="mr-2 size-4" />
//           <span className="hidden md:inline">Cause List</span>
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <FileText className="size-5" />
//             Download Cause List
//           </DialogTitle>
//           <DialogDescription>
//             Select court, date, and court number to download the cause list PDF
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4 py-4">
//           {/* Step 1: Select High Court */}
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Select High Court</label>
//             <Select value={selectedCourt} onValueChange={handleCourtSelect}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Choose a court..." />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="allahabad">Allahabad High Court</SelectItem>
//                 {/* Add more courts here in future */}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Step 2: Select Date */}
//           {selectedCourt && (
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Select Date</label>
//               {loadingDates ? (
//                 <div className="flex items-center justify-center py-8">
//                   <Loader2 className="size-6 animate-spin text-muted-foreground" />
//                 </div>
//               ) : availableDates.length > 0 ? (
//                 <Select value={selectedDate} onValueChange={handleDateSelect}>
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Choose a date..." />
//                   </SelectTrigger>
//                   <SelectContent className="max-h-[200px]">
//                     {availableDates.map((date) => (
//                       <SelectItem key={date} value={date}>
//                         {date}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <p className="text-sm text-muted-foreground py-4">
//                   No dates available
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Step 3: Select Court Number */}
//           {selectedDate && (
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Select Court</label>
//               {loadingCourts ? (
//                 <div className="flex items-center justify-center py-8">
//                   <Loader2 className="size-6 animate-spin text-muted-foreground" />
//                 </div>
//               ) : courtOptions.length > 0 ? (
//                 <Select
//                   value={selectedCourtNo}
//                   onValueChange={setSelectedCourtNo}
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Choose a court..." />
//                   </SelectTrigger>
//                   <SelectContent className="max-h-[200px]">
//                     {courtOptions.map((court) => (
//                       <SelectItem key={court.value} value={court.value}>
//                         {court.text}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <p className="text-sm text-muted-foreground py-4">
//                   No courts available
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Step 4: Download Button */}
//           {selectedCourtNo && (
//             <div className="pt-4">
//               <Button
//                 onClick={handleDownload}
//                 disabled={downloading}
//                 className="w-full"
//               >
//                 {downloading ? (
//                   <>
//                     <Loader2 className="mr-2 size-4 animate-spin" />
//                     Downloading...
//                   </>
//                 ) : (
//                   <>
//                     <Download className="mr-2 size-4" />
//                     Download Cause List PDF
//                   </>
//                 )}
//               </Button>
//             </div>
//           )}
//         </div>

//         {/* Info section */}
//         <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
//           <p className="font-medium mb-1">Note:</p>
//           <p>
//             It downloads the Cause List for the Allahabad High Court by
//             navigating through the Combined Cause List section and selecting the
//             Court-Wise option.
//           </p>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, FileText, Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useFetchAllahabadDates,
  useFetchAllahabadCourts,
  useDownloadAllahabadCauseList,
  useFetchKarnatakaCourts,
  useDownloadKarnatakaCauseList,
  type CourtOption,
} from "@/hooks/use-causelist";

export const CauseListDownloadDialog = () => {
  const [open, setOpen] = useState(false);

  // Court selection
  const [selectedCourt, setSelectedCourt] = useState<
    "" | "allahabad" | "karnataka"
  >("");

  // Allahabad specific
  const [allahabadDates, setAllahabadDates] = useState<string[]>([]);
  const [allahabadDate, setAllahabadDate] = useState("");
  const [allahabadCourtOptions, setAllahabadCourtOptions] = useState<
    CourtOption[]
  >([]);
  const [allahabadCourtNo, setAllahabadCourtNo] = useState("");

  // Karnataka specific
  const [karnatakaBench, setKarnatakaBench] = useState("");
  const [karnatakaDate, setKarnatakaDate] = useState<Date | undefined>();
  const [karnatakaCalendarOpen, setKarnatakaCalendarOpen] = useState(false);
  const [karnatakaCourtOptions, setKarnatakaCourtOptions] = useState<
    CourtOption[]
  >([]);
  const [karnatakaCourtNo, setKarnatakaCourtNo] = useState("");

  // ========== ALLAHABAD HOOKS ==========
  const { mutate: fetchAllahabadDates, isPending: loadingAllahabadDates } =
    useFetchAllahabadDates();
  const { mutate: fetchAllahabadCourts, isPending: loadingAllahabadCourts } =
    useFetchAllahabadCourts();
  const { mutate: downloadAllahabadPDF, isPending: downloadingAllahabad } =
    useDownloadAllahabadCauseList();

  // ========== KARNATAKA HOOKS ==========
  const { mutate: fetchKarnatakaCourts, isPending: loadingKarnatakaCourts } =
    useFetchKarnatakaCourts();
  const { mutate: downloadKarnatakaPDF, isPending: downloadingKarnataka } =
    useDownloadKarnatakaCauseList();

  // Reset all states when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedCourt("");
      setAllahabadDates([]);
      setAllahabadDate("");
      setAllahabadCourtOptions([]);
      setAllahabadCourtNo("");
      setKarnatakaBench("");
      setKarnatakaDate(undefined);
      setKarnatakaCalendarOpen(false);
      setKarnatakaCourtOptions([]);
      setKarnatakaCourtNo("");
    }
  };

  // ========== ALLAHABAD HANDLERS ==========
  const handleAllahabadCourtSelect = () => {
    setSelectedCourt("allahabad");
    setAllahabadDate("");
    setAllahabadCourtOptions([]);
    setAllahabadCourtNo("");

    fetchAllahabadDates(undefined, {
      onSuccess: (data) => {
        if (data.success && data.dates) {
          setAllahabadDates(data.dates);
          if (data.dates.length === 0) {
            toast.error("No dates available for Allahabad High Court");
          }
        } else {
          toast.error("Failed to fetch dates");
          setAllahabadDates([]);
        }
      },
      onError: (error: any) => {
        console.error("Error fetching dates:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch available dates"
        );
        setAllahabadDates([]);
      },
    });
  };

  const handleAllahabadDateSelect = (date: string) => {
    setAllahabadDate(date);
    setAllahabadCourtOptions([]);
    setAllahabadCourtNo("");

    fetchAllahabadCourts(
      { date },
      {
        onSuccess: (data) => {
          if (data.success && data.courts) {
            setAllahabadCourtOptions(data.courts);
            if (data.courts.length === 0) {
              toast.error("No courts available for this date");
            }
          } else {
            toast.error("Failed to fetch courts");
            setAllahabadCourtOptions([]);
          }
        },
        onError: (error: any) => {
          console.error("Error fetching courts:", error);
          toast.error(
            error.response?.data?.message || "Failed to fetch available courts"
          );
          setAllahabadCourtOptions([]);
        },
      }
    );
  };

  const handleAllahabadDownload = () => {
    if (!allahabadCourtNo || !allahabadDate) {
      toast.error("Please select all required fields");
      return;
    }

    downloadAllahabadPDF(
      { date: allahabadDate, courtNo: allahabadCourtNo },
      {
        onSuccess: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;

          const selectedCourtText =
            allahabadCourtOptions.find((c) => c.value === allahabadCourtNo)
              ?.text || allahabadCourtNo;

          const fileName = `Allahabad_CauseList_${selectedCourtText.replace(
            /\s+/g,
            "_"
          )}_${allahabadDate}.pdf`;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          toast.success("Cause list downloaded successfully!");
          handleOpenChange(false);
        },
        onError: (error: any) => {
          console.error("Error downloading PDF:", error);
          toast.error(error.message || "Failed to download cause list");
        },
      }
    );
  };

  // ========== KARNATAKA HANDLERS ==========
  const handleKarnatakaBenchSelect = (bench: string) => {
    setKarnatakaBench(bench);
    setKarnatakaDate(undefined);
    setKarnatakaCourtOptions([]);
    setKarnatakaCourtNo("");
  };

  const handleKarnatakaDateSelect = (date: Date | undefined) => {
    // Just set the date, don't close calendar or fetch yet
    setKarnatakaDate(date);
    // Reset court options when date changes
    setKarnatakaCourtOptions([]);
    setKarnatakaCourtNo("");
  };

  const handleKarnatakaDateConfirm = () => {
    if (!karnatakaDate) {
      toast.error("Please select a date");
      return;
    }

    if (!karnatakaBench) {
      toast.error("Please select a bench first");
      return;
    }

    // Close the popover
    setKarnatakaCalendarOpen(false);

    const formattedDate = format(karnatakaDate, "dd-MM-yyyy");

    fetchKarnatakaCourts(
      { bench: karnatakaBench, date: formattedDate },
      {
        onSuccess: (data) => {
          if (data.success && data.courts) {
            setKarnatakaCourtOptions(data.courts);
            if (data.courts.length === 0) {
              toast.error("No court halls available for this bench and date");
            } else {
              toast.success(`Found ${data.courts.length} court halls`);
            }
          } else {
            toast.error("Failed to fetch court halls");
            setKarnatakaCourtOptions([]);
          }
        },
        onError: (error: any) => {
          console.error("Error fetching courts:", error);
          toast.error(
            error.response?.data?.message || "Failed to fetch court halls"
          );
          setKarnatakaCourtOptions([]);
        },
      }
    );
  };

  const handleKarnatakaDownload = () => {
    if (!karnatakaBench || !karnatakaDate || !karnatakaCourtNo) {
      toast.error("Please select all required fields");
      return;
    }

    const formattedDate = format(karnatakaDate, "dd-MM-yyyy");

    downloadKarnatakaPDF(
      { bench: karnatakaBench, date: formattedDate, courtNo: karnatakaCourtNo },
      {
        onSuccess: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;

          const selectedCourtText =
            karnatakaCourtOptions.find((c) => c.value === karnatakaCourtNo)
              ?.text || karnatakaCourtNo;

          const fileName = `Karnataka_${karnatakaBench}_${selectedCourtText.replace(
            /\s+/g,
            "_"
          )}_${formattedDate}.pdf`;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          toast.success("Cause list downloaded successfully!");
          handleOpenChange(false);
        },
        onError: (error: any) => {
          console.error("Error downloading PDF:", error);
          toast.error(error.message || "Failed to download cause list");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="justify-start w-full">
          <FileText className="mr-2 size-4" />
          <span className="hidden md:inline">Cause List</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Download Cause List
          </DialogTitle>
          <DialogDescription>
            Select high court and follow the steps to download the cause list
            PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Select High Court */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select High Court</label>
            <Select
              value={selectedCourt}
              onValueChange={(value: "allahabad" | "karnataka") => {
                setSelectedCourt(value);
                if (value === "allahabad") {
                  handleAllahabadCourtSelect();
                } else {
                  setKarnatakaBench("");
                  setKarnatakaDate(undefined);
                  setKarnatakaCalendarOpen(false);
                  setKarnatakaCourtOptions([]);
                  setKarnatakaCourtNo("");
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a high court..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allahabad">Allahabad High Court</SelectItem>
                <SelectItem value="karnataka">Karnataka High Court</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ========== ALLAHABAD HIGH COURT ========== */}
          {selectedCourt === "allahabad" && (
            <>
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                {loadingAllahabadDates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : allahabadDates.length > 0 ? (
                  <Select
                    value={allahabadDate}
                    onValueChange={handleAllahabadDateSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a date..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {allahabadDates.map((date) => (
                        <SelectItem key={date} value={date}>
                          {date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground py-4">
                    No dates available
                  </p>
                )}
              </div>

              {/* Court Selection */}
              {allahabadDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Court</label>
                  {loadingAllahabadCourts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : allahabadCourtOptions.length > 0 ? (
                    <Select
                      value={allahabadCourtNo}
                      onValueChange={setAllahabadCourtNo}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a court..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {allahabadCourtOptions.map((court) => (
                          <SelectItem key={court.value} value={court.value}>
                            {court.text}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No courts available
                    </p>
                  )}
                </div>
              )}

              {/* Download Button */}
              {allahabadCourtNo && (
                <div className="pt-4">
                  <Button
                    onClick={handleAllahabadDownload}
                    disabled={downloadingAllahabad}
                    className="w-full"
                  >
                    {downloadingAllahabad ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 size-4" />
                        Download Cause List PDF
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ========== KARNATAKA HIGH COURT ========== */}
          {selectedCourt === "karnataka" && (
            <>
              {/* Bench Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Bench</label>
                <Select
                  value={karnatakaBench}
                  onValueChange={handleKarnatakaBenchSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a bench..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B">Bengaluru</SelectItem>
                    <SelectItem value="D">Dharwad</SelectItem>
                    <SelectItem value="K">Kalaburagi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection with Calendar */}
              {karnatakaBench && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Date</label>
                  <Popover
                    open={karnatakaCalendarOpen}
                    onOpenChange={setKarnatakaCalendarOpen}
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {karnatakaDate ? (
                          format(karnatakaDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      onInteractOutside={(e) => {
                        // Prevent closing when clicking inside the calendar
                        e.preventDefault();
                      }}
                    >
                      <Calendar
                        mode="single"
                        selected={karnatakaDate}
                        onSelect={handleKarnatakaDateSelect}
                        initialFocus
                        disabled={false}
                      />
                      <div className="p-3 border-t flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setKarnatakaDate(undefined);
                            setKarnatakaCalendarOpen(false);
                          }}
                          className="flex-1"
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleKarnatakaDateConfirm}
                          disabled={!karnatakaDate || loadingKarnatakaCourts}
                          className="flex-1"
                          size="sm"
                        >
                          {loadingKarnatakaCourts ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "OK"
                          )}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Court Hall Selection */}
              {karnatakaCourtOptions.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select Court Hall
                  </label>
                  <Select
                    value={karnatakaCourtNo}
                    onValueChange={setKarnatakaCourtNo}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a court hall..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {karnatakaCourtOptions.map((court) => (
                        <SelectItem key={court.value} value={court.value}>
                          {court.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Download Button */}
              {karnatakaCourtNo && (
                <div className="pt-4">
                  <Button
                    onClick={handleKarnatakaDownload}
                    disabled={downloadingKarnataka}
                    className="w-full"
                  >
                    {downloadingKarnataka ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 size-4" />
                        Download Cause List PDF
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info section */}
        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Note:</p>
          {selectedCourt === "allahabad" && (
            <p>
              Cause list is downloaded from Allahabad High Court's Combined
              Cause List section (Court-Wise option). To download using other
              filters, click on
              <a
                href="https://www.allahabadhighcourt.in/causelist/input2A.jsp"
                target="_blank"
                className="text-blue-600 underline hover:text-blue-800"
              >
                "Allahabad High Court Cause List"
              </a>
              .
            </p>
          )}
          {selectedCourt === "karnataka" && (
            <p>
              Cause list is downloaded based on Court Halls. To download using
              other filters, click on
              <a
                href="https://judiciary.karnataka.gov.in/causelistSearch.php"
                target="_blank"
                className="text-blue-600 underline hover:text-blue-800"
              >
                " Karnataka High Court Cause List "
              </a>
              .
            </p>
          )}
          {!selectedCourt && <p>Select a high court to begin.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
