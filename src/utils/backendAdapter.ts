// frontend/src/utils/backendAdapter.ts - SIMPLIFIED 2-ROLE SYSTEM
import { UserProfile } from "../services/userAPI";

export const adaptBackendUserForFrontend = (backendUser: any): UserProfile => {
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
      currency: "DZD",
      language: "en",
    },
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
  };
};

export const getUserCompanyId = (user: UserProfile): string | undefined => {
  return user.companyId;
};

export const getUserRole = (user: UserProfile): string => {
  return (user.role || user.globalRole || "manager").toLowerCase();
};
