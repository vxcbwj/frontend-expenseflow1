// frontend/src/utils/permissions.ts - SIMPLIFIED 2-ROLE SYSTEM
import { UserProfile } from "../services/userAPI";
import { ROLES } from "./roles";

export const PERMISSIONS = {
  // Admin-only permissions
  CREATE_COMPANY: "create_company",
  DELETE_COMPANY: "delete_company",
  INVITE_MANAGERS: "invite_managers",
  REMOVE_MANAGERS: "remove_managers",
  SET_COMPANY_SETTINGS: "set_company_settings",

  // Shared permissions (both admin and manager)
  SET_BUDGETS: "set_budgets",
  VIEW_BUDGETS: "view_budgets",
  VIEW_ALL_EXPENSES: "view_all_expenses",
  SUBMIT_EXPENSES: "submit_expenses",
  EDIT_EXPENSES: "edit_expenses",
  DELETE_EXPENSES: "delete_expenses",
  GENERATE_REPORTS: "generate_reports",
  EXPORT_DATA: "export_data",
  VIEW_ANALYTICS: "view_analytics",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    PERMISSIONS.CREATE_COMPANY,
    PERMISSIONS.DELETE_COMPANY,
    PERMISSIONS.INVITE_MANAGERS,
    PERMISSIONS.REMOVE_MANAGERS,
    PERMISSIONS.SET_COMPANY_SETTINGS,
    PERMISSIONS.SET_BUDGETS,
    PERMISSIONS.VIEW_BUDGETS,
    PERMISSIONS.VIEW_ALL_EXPENSES,
    PERMISSIONS.SUBMIT_EXPENSES,
    PERMISSIONS.EDIT_EXPENSES,
    PERMISSIONS.DELETE_EXPENSES,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  manager: [
    PERMISSIONS.SET_BUDGETS,
    PERMISSIONS.VIEW_BUDGETS,
    PERMISSIONS.VIEW_ALL_EXPENSES,
    PERMISSIONS.SUBMIT_EXPENSES,
    PERMISSIONS.EDIT_EXPENSES,
    PERMISSIONS.DELETE_EXPENSES,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
};

export const hasPermission = (
  user: UserProfile | null,
  permission: Permission | string,
): boolean => {
  if (!user) return false;

  const userRole = (user.role || user.globalRole)?.toLowerCase();
  if (!userRole) return false;

  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission as Permission);
};

// Helper functions
export const isAdmin = (user: UserProfile | null): boolean => {
  const userRole = (user?.role || user?.globalRole)?.toLowerCase();
  return userRole === ROLES.ADMIN;
};

export const isManager = (user: UserProfile | null): boolean => {
  const userRole = (user?.role || user?.globalRole)?.toLowerCase();
  return userRole === ROLES.MANAGER;
};

export const canManageCompany = (
  user: UserProfile | null,
  companyId?: string,
): boolean => {
  if (!isAdmin(user)) return false;
  if (!companyId) return true;

  // Check if user's company matches
  const userCompanyId = user?.companyId;
  return userCompanyId === companyId;
};

export const canInviteManagers = (
  user: UserProfile | null,
  companyId?: string,
): boolean => {
  return canManageCompany(user, companyId);
};

export const canAccessCompany = (
  user: UserProfile | null,
  companyId?: string,
): boolean => {
  if (!user || !companyId) return false;

  const userCompanyId = user.companyId;
  return userCompanyId === companyId;
};

// Specific permission checks
export const canViewDashboard = (user: UserProfile | null): boolean => {
  return !!user; // Both roles can view dashboard
};

export const canViewExpenses = (user: UserProfile | null): boolean => {
  return hasPermission(user, PERMISSIONS.VIEW_ALL_EXPENSES);
};

export const canManageExpenses = (user: UserProfile | null): boolean => {
  return hasPermission(user, PERMISSIONS.EDIT_EXPENSES);
};

export const canViewBudgets = (user: UserProfile | null): boolean => {
  return hasPermission(user, PERMISSIONS.VIEW_BUDGETS);
};

export const canManageBudgets = (user: UserProfile | null): boolean => {
  return hasPermission(user, PERMISSIONS.SET_BUDGETS);
};

export const canViewAnalytics = (user: UserProfile | null): boolean => {
  return hasPermission(user, PERMISSIONS.VIEW_ANALYTICS);
};

export const canManageUsers = (user: UserProfile | null): boolean => {
  return hasPermission(user, PERMISSIONS.INVITE_MANAGERS);
};
