// frontend/src/services/userAPI.ts - SIMPLIFIED 2-ROLE SYSTEM
import api from "./api";

// Updated to match backend 2-role User model
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;

  // Main role field (maps to backend's globalRole)
  role: string; // "admin" or "manager"
  globalRole?: string; // For backward compatibility

  // Company assignment
  companyId?: string;
  joinedCompanyAt?: string;

  preferences: {
    theme: "light" | "dark" | "auto";
    currency: string;
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    theme?: "light" | "dark" | "auto";
    currency?: string;
    language?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Helper to normalize backend response to UserProfile
export const normalizeBackendUser = (backendUser: any): UserProfile => {
  return {
    id: backendUser.id || backendUser._id,
    email: backendUser.email,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    phone: backendUser.phone,
    avatar: backendUser.avatar,

    // Main role field - lowercase for consistency
    role: (
      backendUser.globalRole ||
      backendUser.role ||
      "manager"
    ).toLowerCase(),
    globalRole: (
      backendUser.globalRole ||
      backendUser.role ||
      "manager"
    ).toLowerCase(),

    // Company assignment
    companyId: backendUser.companyId,
    joinedCompanyAt: backendUser.joinedCompanyAt,

    preferences: backendUser.preferences || {
      theme: "auto",
      currency: "USD",
      language: "en",
    },
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
  };
};

export const userAPI = {
  // Get user profile
  getProfile: async (): Promise<{
    success: boolean;
    message: string;
    user: UserProfile;
  }> => {
    const response = await api.get("/auth/profile");
    return {
      ...response.data,
      user: normalizeBackendUser(response.data.user),
    };
  },

  // Update user profile
  updateProfile: async (
    profileData: UpdateProfileData
  ): Promise<{
    success: boolean;
    message: string;
    user: UserProfile;
  }> => {
    const response = await api.put("/auth/profile", profileData);
    return {
      ...response.data,
      user: normalizeBackendUser(response.data.user),
    };
  },

  // Change password
  changePassword: async (
    passwordData: ChangePasswordData
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.put("/auth/password", passwordData);
    return response.data;
  },
};
