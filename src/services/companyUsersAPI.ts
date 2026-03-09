// services/companyUsersAPI.ts - UPGRADED VERSION
import api from "./api";

export interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  globalRole: string;
  companyRole: string;
  department?: string;
  isActive: boolean;
  joinedAt?: string;
}

export interface CompanyUsersResponse {
  success: boolean;
  message: string;
  users: CompanyUser[];
  company: {
    id: string;
    name: string;
    industry: string;
  };
  count?: number;
  error?: string;
}

export interface InviteUserData {
  email: string;
  role: string;
  department?: string;
}

export interface UpdateUserData {
  role?: string;
  department?: string;
  isActive?: boolean;
}

export const companyUsersAPI = {
  // Get all users for a company
  getCompanyUsers: async (companyId: string): Promise<CompanyUsersResponse> => {
    try {
      console.log(`📊 Fetching users for company: ${companyId}`);
      const response = await api.get(`/company-users/${companyId}`);
      const data = response.data;

      if (data.success) {
        console.log(`✅ Found ${data.users?.length || 0} users for company`);
        return {
          success: true,
          message: data.message || "Users retrieved successfully",
          users: data.users || [],
          company: data.company,
          count: data.count || data.users?.length,
        };
      }

      throw new Error(data.error || "Failed to fetch company users");
    } catch (error: any) {
      console.error("❌ Failed to fetch company users:", error);
      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch company users",
        users: [],
        company: { id: companyId, name: "", industry: "" },
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Add user to company
  inviteUser: async (
    companyId: string,
    userData: InviteUserData
  ): Promise<{
    success: boolean;
    message: string;
    user?: CompanyUser;
    error?: string;
  }> => {
    try {
      console.log(`📧 Inviting user to company ${companyId}:`, userData.email);

      const response = await api.post(
        `/company-users/${companyId}/invite`,
        userData
      );
      const data = response.data;

      if (data.success) {
        console.log(`✅ User invited successfully: ${userData.email}`);
        return {
          success: true,
          message: data.message || "User invited successfully",
          user: data.user,
        };
      }

      throw new Error(data.error || "Failed to invite user");
    } catch (error: any) {
      console.error("❌ Failed to invite user:", error);

      // Handle specific error cases
      let errorMessage =
        error.response?.data?.error || error.message || "Failed to invite user";

      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || "Invalid invitation data";
      } else if (error.response?.status === 403) {
        errorMessage =
          "You don't have permission to invite users to this company";
      } else if (error.response?.status === 404) {
        errorMessage = error.response.data.error || "Company or user not found";
      }

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  // Update user role in company
  updateUserRole: async (
    companyId: string,
    userId: string,
    updateData: UpdateUserData
  ): Promise<{
    success: boolean;
    message: string;
    user?: CompanyUser;
    error?: string;
  }> => {
    try {
      console.log(
        `✏️ Updating user ${userId} in company ${companyId}:`,
        updateData
      );

      const response = await api.put(
        `/company-users/${companyId}/users/${userId}`,
        updateData
      );
      const data = response.data;

      if (data.success) {
        console.log(`✅ User updated successfully: ${userId}`);
        return {
          success: true,
          message: data.message || "User updated successfully",
          user: data.user,
        };
      }

      throw new Error(data.error || "Failed to update user");
    } catch (error: any) {
      console.error("❌ Failed to update user:", error);

      let errorMessage =
        error.response?.data?.error || error.message || "Failed to update user";

      if (error.response?.status === 403) {
        errorMessage =
          "You don't have permission to update users in this company";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found in this company";
      }

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  // Remove user from company
  removeUser: async (
    companyId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> => {
    try {
      console.log(`🗑️ Removing user ${userId} from company ${companyId}`);

      const response = await api.delete(
        `/company-users/${companyId}/users/${userId}`
      );
      const data = response.data;

      if (data.success) {
        console.log(`✅ User removed successfully: ${userId}`);
        return {
          success: true,
          message: data.message || "User removed successfully",
        };
      }

      throw new Error(data.error || "Failed to remove user");
    } catch (error: any) {
      console.error("❌ Failed to remove user:", error);

      let errorMessage =
        error.response?.data?.error || error.message || "Failed to remove user";

      if (error.response?.status === 403) {
        errorMessage =
          "You don't have permission to remove users from this company";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found in this company";
      }

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  // NEW: Search users in company
  searchUsers: async (
    companyId: string,
    searchTerm: string
  ): Promise<CompanyUsersResponse> => {
    try {
      console.log(
        `🔍 Searching users in company ${companyId}: "${searchTerm}"`
      );

      const response = await api.get(`/company-users/${companyId}/search`, {
        params: { q: searchTerm },
      });
      const data = response.data;

      if (data.success) {
        console.log(`✅ Found ${data.users?.length || 0} matching users`);
        return {
          success: true,
          message: data.message || "Search completed",
          users: data.users || [],
          company: data.company,
          count: data.count,
        };
      }

      throw new Error(data.error || "Search failed");
    } catch (error: any) {
      console.error("❌ Search failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.error || error.message || "Search failed",
        users: [],
        company: { id: companyId, name: "", industry: "" },
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // NEW: Get user details in company
  getUserDetails: async (
    companyId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    user?: CompanyUser;
    error?: string;
  }> => {
    try {
      console.log(
        `👤 Getting details for user ${userId} in company ${companyId}`
      );

      const response = await api.get(
        `/company-users/${companyId}/users/${userId}`
      );
      const data = response.data;

      if (data.success) {
        return {
          success: true,
          message: data.message || "User details retrieved",
          user: data.user,
        };
      }

      throw new Error(data.error || "Failed to get user details");
    } catch (error: any) {
      console.error("❌ Failed to get user details:", error);

      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to get user details",
        error: error.response?.data?.error || error.message,
      };
    }
  },
};

export default companyUsersAPI;
