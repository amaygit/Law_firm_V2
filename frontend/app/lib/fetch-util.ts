// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token ?? ""}`;
//   }
//   return config;
// });

// // Add a global handler for 401 errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Dispatch a custom event to trigger logout in AuthProvider
//       window.dispatchEvent(new Event("force-logout"));
//     }
//     return Promise.reject(error);
//   }
// );

// const postData = async <T>(url: string, data: unknown): Promise<T> => {
//   const response = await api.post(url, data);

//   return response.data;
// };

// const updateData = async <T>(url: string, data: unknown): Promise<T> => {
//   const response = await api.put(url, data);

//   return response.data;
// };

// const fetchData = async <T>(url: string): Promise<T> => {
//   const response = await api.get(url);

//   return response.data;
// };

// const deleteData = async <T>(url: string): Promise<T> => {
//   const response = await api.delete(url);

//   return response.data;
// };

// export { postData, fetchData, updateData, deleteData };
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token ?? ""}`;
  }
  return config;
});

// Add a global handler for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch a custom event to trigger logout in AuthProvider
      window.dispatchEvent(new Event("force-logout"));
    }
    return Promise.reject(error);
  }
);

const postData = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await api.post(url, data);
  return response.data;
};

const updateData = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await api.put(url, data);
  return response.data;
};

const fetchData = async <T>(url: string): Promise<T> => {
  const response = await api.get(url);
  return response.data;
};

const deleteData = async <T>(url: string): Promise<T> => {
  const response = await api.delete(url);
  return response.data;
};

// ✅ NEW: Upload file with FormData
const uploadFile = async <T>(url: string, file: File): Promise<T> => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");

  console.log("📤 uploadFile called:", {
    url,
    fileName: file.name,
    fileSize: file.size,
    hasToken: !!token,
  });

  const response = await api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      // Token is already added by interceptor, but let's be explicit
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export { postData, fetchData, updateData, deleteData, uploadFile };
