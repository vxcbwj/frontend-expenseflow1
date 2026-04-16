// src/pages/CompanyUsersPage.tsx - UPDATED FOR 2-ROLE SYSTEM
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyUsersAPI } from "../services/companyUsersAPI";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/userPermissions";
import { useCompany } from "../contexts/CompanyContext";
import InviteUserModal from "../components/invitations/InviteUserModal";
import InvitationList from "../components/invitations/InvitationList";
import CompanyUsersList from "../components/company/CompanyUsersList";

interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  globalRole: string;
  companyRole: string;
  department?: string;
  isActive: boolean;
  joinedAt?: string;
}

const CompanyUsersPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { company } = useCompany();
  const { isAdmin } = usePermissions();

  const storedSearch =
    typeof window !== "undefined"
      ? sessionStorage.getItem("companyUserSearch") || ""
      : "";

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvitationList, setShowInvitationList] = useState(false);
  const [searchInput, setSearchInput] = useState(storedSearch);
  const [searchQuery, setSearchQuery] = useState(storedSearch);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasFetchedRef = useRef(false);

  // Get user's role display name
  const getUserRoleDisplay = useCallback(() => {
    const role = (user?.role || user?.globalRole || "").toLowerCase();
    if (role === "admin") return "Admin";
    if (role === "manager") return "Manager";
    return "Manager";
  }, [user]);

  const filteredUsers = React.useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return users;

    return users.filter((user) =>
      [user.email, user.firstName, user.lastName, user.companyRole]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchLower)),
    );
  }, [users, searchQuery]);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("companyUserSearch", searchInput);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchInput]);

  // Memoized fetchUsers with cleanup
  const fetchUsers = useCallback(async () => {
    if (!companyId) {
      setError("No company ID provided");
      setLoading(false);
      return;
    }

    if (hasFetchedRef.current) return;

    try {
      hasFetchedRef.current = true;
      setLoading(true);
      setError(null);

      const response = await companyUsersAPI.getCompanyUsers(companyId);

      if (response.success) {
        setUsers(response.users || []);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error("❌ Error fetching users:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to load users",
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Main data fetch - ONE TIME ONLY
  useEffect(() => {
    const fetchData = async () => {
      if (!companyId || hasFetchedRef.current) return;
      await fetchUsers();
    };

    fetchData();

    return () => {
      hasFetchedRef.current = false;
    };
  }, [companyId, fetchUsers]);

  // Check permissions - Admin only
  const hasAccess = isAdmin();

  // Early returns
  if (!companyId) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🏢</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-3">
            Company Required
          </h2>
          <p className="text-amber-700 dark:text-amber-400 mb-6 max-w-md mx-auto">
            Please select a company first to manage team members.
          </p>
          <button
            onClick={() => navigate("/companies")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <span>←</span>
            Go to Companies
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-300">
                Access Denied
              </h2>
              <p className="text-red-700 dark:text-red-400">
                Only admins can manage team members.
              </p>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Your Role
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {getUserRoleDisplay()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Required Role
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  Admin
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <span>←</span>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUserAdded = useCallback(async () => {
    setShowInviteModal(false);
    hasFetchedRef.current = false;
    await fetchUsers();
  }, [fetchUsers]);

  const handleUserUpdated = useCallback(() => {
    hasFetchedRef.current = false;
    fetchUsers();
  }, [fetchUsers]);

  const handleUserRemoved = useCallback(() => {
    hasFetchedRef.current = false;
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <span className="block">Team Management</span>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-base font-normal">
                  Manage users in{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {company?.name || "this company"}
                  </span>
                </p>
              </div>
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                {getUserRoleDisplay()}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Active Company</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/companies")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-300 dark:border-gray-600"
            >
              <span>←</span>
              Back to Company
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="text-lg">+</span>
              Invite Manager
            </button>
            <button
              onClick={() => setShowInvitationList(!showInvitationList)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200"
            >
              <span className="text-lg">📨</span>
              View Invitations
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {users.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Members
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {users.filter((u) => u.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Managers
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {
                    users.filter(
                      (u) => u.globalRole?.toLowerCase() === "manager",
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <span className="text-lg">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search team members by name, email, or role..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-500 dark:text-gray-400">🔍</span>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Found {filteredUsers.length} of {users.length} members
            </p>
          )}
        </div>
      </div>

      {/* Invitation List */}
      {showInvitationList && (
        <div className="mb-8">
          <InvitationList companyId={companyId} />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 dark:border-blue-400 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <span className="mt-6 text-gray-600 dark:text-gray-300 font-medium">
            Loading team members...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
                Error Loading Users
              </h2>
              <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  hasFetchedRef.current = false;
                  fetchUsers();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200"
              >
                <span>🔄</span>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">👥</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Team Members Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Start building your team by inviting managers to collaborate.
          </p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span className="text-lg">+</span>
            Invite First Manager
          </button>
        </div>
      )}

      {/* Users List */}
      {!loading && !error && users.length > 0 && (
        <CompanyUsersList
          users={filteredUsers}
          companyId={companyId}
          onUserUpdated={handleUserUpdated}
          onUserRemoved={handleUserRemoved}
        />
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteUserModal
          companyId={companyId}
          companyName={company?.name || "Company"}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleUserAdded}
        />
      )}
    </div>
  );
};

export default CompanyUsersPage;
