// frontend/src/components/company/CompanyUsersList.tsx - UPDATED FOR 2-ROLE SYSTEM
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import {
  companyUsersAPI,
  type CompanyUser,
} from "../../services/companyUsersAPI.ts";
import { usePermissions } from "../../hooks/userPermissions.ts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import AddUserModal from "./AddUserModal";
import { formatPhoneNumber } from "../../utils/phoneValidator";

interface CompanyUsersListProps {
  users?: CompanyUser[];
  companyId?: string;
  onUserUpdated?: () => void;
  onUserRemoved?: () => void;
}

const CompanyUsersList: React.FC<CompanyUsersListProps> = ({
  users: initialUsers,
  companyId: propCompanyId,
  onUserUpdated,
  onUserRemoved,
}) => {
  const { user: _user } = useAuth();
  const { company } = useCompany(); // FIXED: Changed currentCompany to company
  const { isAdmin } = usePermissions(); // Using new permission hook
  const [users, setUsers] = useState<CompanyUser[]>(initialUsers || []);
  const [companyInfo, setCompanyInfo] = useState<{
    id: string;
    name: string;
    industry: string;
  } | null>(null);
  const [loading, setLoading] = useState(!initialUsers);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editFormData, setEditFormData] = useState({
    role: "manager",
    department: "",
    isActive: true,
  });

  // Determine which company ID to use
  const companyIdToUse = propCompanyId || company?.id;

  // Check permissions - only admins can manage users
  const userCanManageUsers = isAdmin();

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter((user) =>
      [user.email, user.firstName, user.lastName, user.globalRole]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query)),
    );
  }, [users, searchQuery]);

  const fetchCompanyUsers = async () => {
    if (!companyIdToUse) {
      setError("No company selected");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log(`📡 Fetching users for company: ${companyIdToUse}`);

      const response = await companyUsersAPI.getCompanyUsers(companyIdToUse);
      console.log("📦 API Response:", response);

      if (response.success) {
        setUsers(response.users);
        setCompanyInfo(response.company);
        console.log(`✅ Found ${response.users.length} users`);
      } else {
        setError(response.message || "Failed to load company users");
      }
    } catch (err: any) {
      console.error("❌ Error fetching users:", err);
      setError(err.response?.data?.error || "Failed to load company users");
    } finally {
      setLoading(false);
    }
  };

  // Only fetch if no initial users provided and we have companyId
  useEffect(() => {
    if (!initialUsers && companyIdToUse && userCanManageUsers) {
      fetchCompanyUsers();
    }
  }, [companyIdToUse, userCanManageUsers, initialUsers]);

  // Initialize users if passed as props
  useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  // UPDATED FOR 2-ROLE SYSTEM
  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      manager:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
    return colors[role] || colors.manager;
  };

  // UPDATED FOR 2-ROLE SYSTEM
  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      admin: "Administrator",
      manager: "Manager",
    };
    return labels[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleEditClick = (user: CompanyUser) => {
    setEditingUserId(user.id);
    setEditFormData({
      role: user.globalRole || "manager", // FIXED: Use globalRole
      department: user.department || "",
      isActive: user.isActive,
    });
  };

  const handleUpdateUser = async (userId: string) => {
    if (!companyIdToUse) return;

    // In 2-role system, only admins can update users
    if (!isAdmin()) {
      setError("Only administrators can update user roles");
      return;
    }

    try {
      setLoading(true);
      const response = await companyUsersAPI.updateUserRole(
        companyIdToUse,
        userId,
        {
          role: editFormData.role,
          department: editFormData.department || undefined,
          isActive: editFormData.isActive,
        },
      );

      if (response.success) {
        // Update local state
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, ...response.user } : u)),
        );
        setEditingUserId(null);

        // Call callback if provided
        if (onUserUpdated) {
          onUserUpdated();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!companyIdToUse) return;

    // In 2-role system, only admins can remove users
    if (!isAdmin()) {
      setError("Only administrators can remove users");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to remove this user from the company?",
      )
    ) {
      return;
    }

    try {
      const response = await companyUsersAPI.removeUser(companyIdToUse, userId);

      if (response.success) {
        // Remove from local state
        setUsers(users.filter((u) => u.id !== userId));

        // Call callback if provided
        if (onUserRemoved) {
          onUserRemoved();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to remove user");
    }
  };

  const handleUserAdded = async () => {
    // Refresh the list
    await fetchCompanyUsers();
  };

  if (!companyIdToUse) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            Please select a company to manage users
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userCanManageUsers) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can manage users in this company.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading && !initialUsers) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Loading users...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Team Management
          </h1>
          {companyInfo && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Managing users for{" "}
              <span className="font-semibold">{companyInfo.name}</span>
            </p>
          )}
        </div>
        {isAdmin() && (
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span className="mr-2">👤</span>
            Add Manager
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="text-red-700 dark:text-red-300 text-center">
              <p>{error}</p>
              <Button
                onClick={fetchCompanyUsers}
                variant="outline"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members by name, email, or role..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            🔍
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="text-red-700 dark:text-red-300 text-center">
              <p>{error}</p>
              <Button
                onClick={fetchCompanyUsers}
                variant="outline"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              {/* User Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user.firstName?.[0]}
                  {user.lastName?.[0] || user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email}
                  </h3>
                  {editingUserId === user.id && isAdmin() ? (
                    <div className="mt-2">
                      <select
                        value={editFormData.role}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            role: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                  ) : (
                    <Badge
                      className={getRoleColor(user.globalRole || "manager")}
                    >
                      {getRoleLabel(user.globalRole || "manager")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <span>📧</span>
                  <span className="truncate">{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <span>📞</span>
                    <span>{formatPhoneNumber(user.phone)}</span>
                  </div>
                )}

                {user.department && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <span>🏢</span>
                    <span>{user.department}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mt-3">
                {editingUserId === user.id && isAdmin() ? (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`active-${user.id}`} className="text-sm">
                      Active:
                    </Label>
                    <input
                      type="checkbox"
                      id={`active-${user.id}`}
                      checked={editFormData.isActive}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          isActive: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                ) : (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              {/* Actions - Only show for admins */}
              {isAdmin() && (
                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {editingUserId === user.id ? (
                    <>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleUpdateUser(user.id)}
                        disabled={loading}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUserId(null)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{searchQuery ? "🔍" : "👥"}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {searchQuery
                ? `No results for '${searchQuery}'`
                : "No Team Members Yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? "Try a different search term or clear the query."
                : "Start by adding managers to your company team"}
            </p>
            {isAdmin() && !searchQuery && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsAddModalOpen(true)}
              >
                <span className="mr-2">👤</span>
                Add First Manager
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {users.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <span>
                Total team members: <strong>{users.length}</strong>
              </span>
              <div className="flex space-x-4">
                <span>
                  Administrators:{" "}
                  <strong>
                    {users.filter((u) => u.globalRole === "admin").length}
                  </strong>
                </span>
                <span>
                  Managers:{" "}
                  <strong>
                    {users.filter((u) => u.globalRole === "manager").length}
                  </strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add User Modal */}
      {isAdmin() && (
        <AddUserModal
          isOpen={isAddModalOpen}
          companyId={companyIdToUse}
          onClose={() => setIsAddModalOpen(false)}
          onUserAdded={handleUserAdded}
        />
      )}
    </div>
  );
};

export default CompanyUsersList;
