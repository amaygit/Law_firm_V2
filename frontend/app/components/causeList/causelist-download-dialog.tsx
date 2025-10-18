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
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useFetchCauseListDates,
  useFetchCauseListCourts,
  useDownloadCauseList,
  type CourtOption,
} from "@/hooks/use-causelist";

export const CauseListDownloadDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [courtOptions, setCourtOptions] = useState<CourtOption[]>([]);
  const [selectedCourtNo, setSelectedCourtNo] = useState("");

  // Hooks
  const { mutate: fetchDates, isPending: loadingDates } =
    useFetchCauseListDates();
  const { mutate: fetchCourts, isPending: loadingCourts } =
    useFetchCauseListCourts();
  const { mutate: downloadPDF, isPending: downloading } =
    useDownloadCauseList();

  // Reset all states when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedCourt("");
      setAvailableDates([]);
      setSelectedDate("");
      setCourtOptions([]);
      setSelectedCourtNo("");
    }
  };

  // Step 1: Fetch available dates when Allahabad HC is selected
  const handleCourtSelect = (court: string) => {
    setSelectedCourt(court);
    setSelectedDate("");
    setCourtOptions([]);
    setSelectedCourtNo("");

    if (court !== "allahabad") return;

    fetchDates("allahabad", {
      onSuccess: (data) => {
        if (data.success && data.dates) {
          setAvailableDates(data.dates);

          if (data.dates.length === 0) {
            toast.error("No dates available for this court");
          }
        } else {
          toast.error("Failed to fetch dates");
          setAvailableDates([]);
        }
      },
      onError: (error: any) => {
        console.error("Error fetching dates:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch available dates"
        );
        setAvailableDates([]);
      },
    });
  };

  // Step 2: Fetch court numbers when date is selected
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setCourtOptions([]);
    setSelectedCourtNo("");

    fetchCourts(
      {
        court: "allahabad",
        date: date,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.courts) {
            setCourtOptions(data.courts);

            if (data.courts.length === 0) {
              toast.error("No courts available for this date");
            }
          } else {
            toast.error("Failed to fetch courts");
            setCourtOptions([]);
          }
        },
        onError: (error: any) => {
          console.error("Error fetching courts:", error);
          toast.error(
            error.response?.data?.message || "Failed to fetch available courts"
          );
          setCourtOptions([]);
        },
      }
    );
  };

  // Step 3: Download PDF
  const handleDownload = () => {
    if (!selectedCourtNo || !selectedDate) {
      toast.error("Please select all required fields");
      return;
    }

    downloadPDF(
      {
        court: "allahabad",
        date: selectedDate,
        courtNo: selectedCourtNo,
      },
      {
        onSuccess: (blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;

          const selectedCourtText =
            courtOptions.find((c) => c.value === selectedCourtNo)?.text ||
            selectedCourtNo;

          const fileName = `CauseList_${selectedCourtText.replace(
            /\s+/g,
            "_"
          )}_${selectedDate}.pdf`;
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
            Select court, date, and court number to download the cause list PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Select High Court */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select High Court</label>
            <Select value={selectedCourt} onValueChange={handleCourtSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a court..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allahabad">Allahabad High Court</SelectItem>
                {/* Add more courts here in future */}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Select Date */}
          {selectedCourt && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              {loadingDates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableDates.length > 0 ? (
                <Select value={selectedDate} onValueChange={handleDateSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a date..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {availableDates.map((date) => (
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
          )}

          {/* Step 3: Select Court Number */}
          {selectedDate && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Court</label>
              {loadingCourts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : courtOptions.length > 0 ? (
                <Select
                  value={selectedCourtNo}
                  onValueChange={setSelectedCourtNo}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a court..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {courtOptions.map((court) => (
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

          {/* Step 4: Download Button */}
          {selectedCourtNo && (
            <div className="pt-4">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full"
              >
                {downloading ? (
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
        </div>

        {/* Info section */}
        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Note:</p>
          <p>
            It downloads the Cause List for the Allahabad High Court by
            navigating through the Combined Cause List section and selecting the
            Court-Wise option.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
