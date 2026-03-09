// services/api.ts - UPDATED User interface
import axios from "axios";

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || "http://localhost:5000",
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

// Updated User interface to match backend
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  globalRole: string;
  companyRoles: Array<{
    companyId: string;
    role: string;
    joinedAt: string;
  }>;
  primaryCompanyId?: string;
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
    console.error("❌ Failed to parse user from localStorage:", error);
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

export const isSuperAdmin = (): boolean => {
  return hasRole("super_admin");
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
// Remove the duplicate export line at the bottom
