// frontend/src/utils/roles.ts - SIMPLIFIED 2-ROLE SYSTEM
export const ROLES = {
  ADMIN: "admin", // Company owner/admin
  MANAGER: "manager", // Manager
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.MANAGER]: "Manager",
};

// Role hierarchy - who can manage whom
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [ROLES.ADMIN]: [ROLES.MANAGER],
  [ROLES.MANAGER]: [],
};

// Check if a role can manage another role
export const canManageRole = (managerRole: Role, targetRole: Role): boolean => {
  return ROLE_HIERARCHY[managerRole]?.includes(targetRole) || false;
};

// Get role label
export const getRoleLabel = (role: string): string => {
  const normalizedRole = role?.toLowerCase();
  return ROLE_LABELS[normalizedRole as Role] || role;
};

// Check if user has role
export const hasRole = (user: any, role: Role): boolean => {
  const userRole = (user?.role || user?.globalRole)?.toLowerCase();
  return userRole === role;
};

// Get user's main company
export const getUserMainCompany = (user: any): string | null => {
  if (!user) return null;
  return user.companyId || user.primaryCompanyId || null;
};

// Check if user is admin
export const isAdmin = (user: any): boolean => {
  return hasRole(user, ROLES.ADMIN);
};

// Check if user is manager
export const isManager = (user: any): boolean => {
  return hasRole(user, ROLES.MANAGER);
};

// Check if user is at least a certain role
export const isAtLeastRole = (user: any, minRole: Role): boolean => {
  if (!user?.globalRole && !user?.role) return false;

  const userRole = (user.globalRole || user.role)?.toLowerCase() as Role;
  const roleHierarchyOrder = [ROLES.MANAGER, ROLES.ADMIN] as const;

  const userIndex = roleHierarchyOrder.indexOf(userRole);
  const minIndex = roleHierarchyOrder.indexOf(minRole);

  return userIndex >= minIndex;
};
