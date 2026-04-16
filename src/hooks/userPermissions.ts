// frontend/src/hooks/userPermissions.ts - SIMPLIFIED 2-ROLE SYSTEM
import { useAuth } from "../contexts/AuthContext";
import { useCallback, useMemo } from "react";
import { ROLES } from "../utils/roles";
import {
  Permission,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from "../utils/permissions";

export const usePermissions = () => {
  const { user } = useAuth();

  // Memoize user data to prevent unnecessary re-renders
  const memoizedUser = useMemo(
    () => ({
      id: user?.id,
      email: user?.email,
      role: (user?.role || user?.globalRole)?.toLowerCase(),
      companyId: user?.companyId,
    }),
    [user],
  );

  // ========== ROLE CHECKING FUNCTIONS ==========

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return memoizedUser.role === ROLES.ADMIN;
  }, [memoizedUser.role]);

  // Check if user is manager
  const isManager = useCallback((): boolean => {
    return memoizedUser.role === ROLES.MANAGER;
  }, [memoizedUser.role]);

  // ========== PERMISSION CHECKING FUNCTIONS ==========

  // Generic permission checker
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!memoizedUser.role) return false;

      const userPermissions = ROLE_PERMISSIONS[memoizedUser.role] || [];
      return userPermissions.includes(permission as Permission);
    },
    [memoizedUser.role],
  );

  // Navigation permissions
  const canViewDashboard = useCallback((): boolean => {
    return !!memoizedUser.role; // Both roles can view dashboard
  }, [memoizedUser.role]);

  const canViewCompanies = useCallback((): boolean => {
    return !!memoizedUser.role; // Both roles can view their company
  }, [memoizedUser.role]);

  const canManageCompanies = useCallback((): boolean => {
    return isAdmin(); // Only admins can manage companies
  }, [isAdmin]);

  // Feature permissions
  const canViewExpenses = useCallback((): boolean => {
    return hasPermission(PERMISSIONS.VIEW_ALL_EXPENSES);
  }, [hasPermission]);

  const canManageExpenses = useCallback((): boolean => {
    return hasPermission(PERMISSIONS.EDIT_EXPENSES);
  }, [hasPermission]);

  const canCreateExpenses = useCallback((): boolean => {
    return hasPermission(PERMISSIONS.SUBMIT_EXPENSES);
  }, [hasPermission]);

  const canViewBudgets = useCallback((): boolean => {
    return hasPermission(PERMISSIONS.VIEW_BUDGETS);
  }, [hasPermission]);

  const canManageBudgets = useCallback((): boolean => {
    return hasPermission(PERMISSIONS.SET_BUDGETS);
  }, [hasPermission]);

  const canViewAnalytics = useCallback((): boolean => {
    return hasPermission(PERMISSIONS.VIEW_ANALYTICS);
  }, [hasPermission]);

  // User management
  const canViewUsers = useCallback((): boolean => {
    return isAdmin(); // Only admins can view users
  }, [isAdmin]);

  const canManageUsers = useCallback((): boolean => {
    return hasPermission(PERMISSIONS.INVITE_MANAGERS);
  }, [hasPermission]);

  const canInviteManagers = useCallback((): boolean => {
    return hasPermission(PERMISSIONS.INVITE_MANAGERS);
  }, [hasPermission]);

  // Profile
  const canViewProfile = useCallback((): boolean => {
    return true; // All roles can view their own profile
  }, []);

  // ========== HELPER FUNCTIONS ==========

  const getCompanyId = useCallback((): string | null => {
    return memoizedUser.companyId || null;
  }, [memoizedUser.companyId]);

  // Memoized debug info
  const debugInfo = useMemo(() => {
    return {
      user: memoizedUser,
      permissions: {
        isAdmin: isAdmin(),
        isManager: isManager(),
        canViewDashboard: canViewDashboard(),
        canViewCompanies: canViewCompanies(),
        canManageCompanies: canManageCompanies(),
        canViewExpenses: canViewExpenses(),
        canManageExpenses: canManageExpenses(),
        canCreateExpenses: canCreateExpenses(),
        canViewBudgets: canViewBudgets(),
        canManageBudgets: canManageBudgets(),
        canViewAnalytics: canViewAnalytics(),
        canViewUsers: canViewUsers(),
        canManageUsers: canManageUsers(),
      },
    };
  }, [
    memoizedUser,
    isAdmin,
    isManager,
    canViewDashboard,
    canViewCompanies,
    canManageCompanies,
    canViewExpenses,
    canManageExpenses,
    canCreateExpenses,
    canViewBudgets,
    canManageBudgets,
    canViewAnalytics,
    canViewUsers,
    canManageUsers,
  ]);

  return {
    user: memoizedUser,

    // Core role checkers
    isAdmin,
    isManager,

    // Permission checker
    hasPermission,

    // Navigation permissions
    canViewDashboard,
    canViewCompanies,
    canManageCompanies,

    // Feature permissions
    canViewExpenses,
    canManageExpenses,
    canCreateExpenses,
    canViewBudgets,
    canManageBudgets,
    canViewAnalytics,

    // User management
    canViewUsers,
    canManageUsers,
    canInviteManagers,

    // Profile
    canViewProfile,

    // Helper functions
    getCompanyId,

    // Debug info
    debugInfo,
  };
};
