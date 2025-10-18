import { useMutation } from "@tanstack/react-query";
import { postData } from "@/lib/fetch-util";

// Response types
interface FetchDatesResponse {
  success: boolean;
  dates: string[];
  count: number;
}

interface CourtOption {
  value: string;
  text: string;
}

interface FetchCourtsResponse {
  success: boolean;
  courts: CourtOption[];
  count: number;
  date: string;
}

interface DownloadResponse {
  success: boolean;
  message?: string;
}

// Hook to fetch available dates
export const useFetchCauseListDates = () => {
  return useMutation({
    mutationFn: async (court: string): Promise<FetchDatesResponse> => {
      return postData("/causelist/fetch-dates", { court });
    },
  });
};

// Hook to fetch available courts for a date
export const useFetchCauseListCourts = () => {
  return useMutation({
    mutationFn: async (data: {
      court: string;
      date: string;
    }): Promise<FetchCourtsResponse> => {
      return postData("/causelist/fetch-courts", data);
    },
  });
};

// Hook to download cause list PDF
export const useDownloadCauseList = () => {
  return useMutation({
    mutationFn: async (data: {
      court: string;
      date: string;
      courtNo: string;
    }): Promise<Blob> => {
      // For PDF download, we need to use fetch directly
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/causelist/download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to download PDF");
      }

      return response.blob();
    },
  });
};

// Export types
export type { FetchDatesResponse, FetchCourtsResponse, CourtOption };
