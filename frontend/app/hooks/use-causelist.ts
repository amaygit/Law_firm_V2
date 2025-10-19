// import { useMutation } from "@tanstack/react-query";
// import { postData } from "@/lib/fetch-util";

// // Response types
// interface FetchDatesResponse {
//   success: boolean;
//   dates: string[];
//   count: number;
// }

// interface CourtOption {
//   value: string;
//   text: string;
// }

// interface FetchCourtsResponse {
//   success: boolean;
//   courts: CourtOption[];
//   count: number;
//   date: string;
// }

// interface DownloadResponse {
//   success: boolean;
//   message?: string;
// }

// // Hook to fetch available dates
// export const useFetchCauseListDates = () => {
//   return useMutation({
//     mutationFn: async (court: string): Promise<FetchDatesResponse> => {
//       return postData("/causelist/fetch-dates", { court });
//     },
//   });
// };

// // Hook to fetch available courts for a date
// export const useFetchCauseListCourts = () => {
//   return useMutation({
//     mutationFn: async (data: {
//       court: string;
//       date: string;
//     }): Promise<FetchCourtsResponse> => {
//       return postData("/causelist/fetch-courts", data);
//     },
//   });
// };

// // Hook to download cause list PDF
// export const useDownloadCauseList = () => {
//   return useMutation({
//     mutationFn: async (data: {
//       court: string;
//       date: string;
//       courtNo: string;
//     }): Promise<Blob> => {
//       // For PDF download, we need to use fetch directly
//       const token = localStorage.getItem("token");

//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/causelist/download`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(data),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to download PDF");
//       }

//       return response.blob();
//     },
//   });
// };

// // Export types
// export type { FetchDatesResponse, FetchCourtsResponse, CourtOption };

import { useMutation } from "@tanstack/react-query";
import { postData } from "@/lib/fetch-util";

// Response types
export interface CourtOption {
  value: string;
  text: string;
}

interface AllahabadDatesResponse {
  success: boolean;
  dates: string[];
  count: number;
}

interface AllahabadCourtsResponse {
  success: boolean;
  courts: CourtOption[];
  count: number;
  date: string;
}

interface KarnatakaCourtsResponse {
  success: boolean;
  courts: CourtOption[];
  count: number;
  bench: string;
  date: string;
}

// ========== ALLAHABAD HOOKS ==========

// Hook to fetch Allahabad available dates
export const useFetchAllahabadDates = () => {
  return useMutation({
    mutationFn: async (): Promise<AllahabadDatesResponse> => {
      return postData("/causelist/allahabad/fetch-dates", {});
    },
  });
};

// Hook to fetch Allahabad courts for a date
export const useFetchAllahabadCourts = () => {
  return useMutation({
    mutationFn: async (data: {
      date: string;
    }): Promise<AllahabadCourtsResponse> => {
      return postData("/causelist/allahabad/fetch-courts", data);
    },
  });
};

// Hook to download Allahabad cause list PDF
export const useDownloadAllahabadCauseList = () => {
  return useMutation({
    mutationFn: async (data: {
      date: string;
      courtNo: string;
    }): Promise<Blob> => {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/causelist/allahabad/download`,
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

// ========== KARNATAKA HOOKS ==========

// Hook to fetch Karnataka courts for a bench and date
export const useFetchKarnatakaCourts = () => {
  return useMutation({
    mutationFn: async (data: {
      bench: string;
      date: string;
    }): Promise<KarnatakaCourtsResponse> => {
      return postData("/causelist/karnataka/fetch-courts", data);
    },
  });
};

// Hook to download Karnataka cause list PDF
export const useDownloadKarnatakaCauseList = () => {
  return useMutation({
    mutationFn: async (data: {
      bench: string;
      date: string;
      courtNo: string;
    }): Promise<Blob> => {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/causelist/karnataka/download`,
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
