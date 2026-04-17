import axios from "axios";
import toast from "react-hot-toast";
import logger from "../utils/logger";

// Ensure VITE_API_URL is set for production
const apiUrl = (import.meta as any).env.VITE_API_URL;
if (!apiUrl && import.meta.env.PROD) {
  logger.error("VITE_API_URL environment variable is not set for production");
}

const baseURL = apiUrl ? `${apiUrl}/api` : "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global toast for failures (skipping 401 because AuthContext handles redirects directly)
    if (error.response?.status !== 401 && error.response?.status >= 400) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "An unexpected error occurred.";
      toast.error(msg);
    }
    if (error.response?.status === 401) {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Remove Authorization header
      delete api.defaults.headers.common["Authorization"];

      // Dispatch event to trigger state update rather than hard reload
      window.dispatchEvent(new Event("authChange"));
    }
    return Promise.reject(error);
  },
);

// Updated User interface to match backend
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  globalRole: string;
  preferences: {
    theme: "light" | "dark" | "auto";
    currency: string;
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Helper functions moved here (single export location)
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    logger.error("Failed to parse user from localStorage:", error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  const user = getCurrentUser();
  return !!token && !!user;
};

export const hasRole = (role: string): boolean => {
  const user = getCurrentUser();
  return user?.globalRole?.toLowerCase() === role.toLowerCase();
};

export const authAPI = {
  register: async (
    userData: RegisterData,
  ): Promise<{
    success: boolean;
    message: string;
    token: string;
    user: User;
  }> => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (
    credentials: LoginCredentials,
  ): Promise<{
    success: boolean;
    message: string;
    token: string;
    user: User;
  }> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  getProfile: async (): Promise<{
    success: boolean;
    message: string;
    user: User;
  }> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

export default api;

export const handleApiError = (
  error: unknown,
  defaultMessage: string = "An error occurred",
): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as any;
    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      defaultMessage
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === "string" ? error : defaultMessage;
};
