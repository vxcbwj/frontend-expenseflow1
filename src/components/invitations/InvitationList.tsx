// components/invitations/InvitationList.tsx - UPDATED FOR 2-ROLE SYSTEM
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { usePermissions } from "../../hooks/userPermissions";

interface Invitation {
  _id: string;
  email: string;
  role: string; // Changed from companyRole to role for 2-role system
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  sentAt: string;
  invitedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface InvitationListProps {
  companyId: string;
}

const InvitationList: React.FC<InvitationListProps> = ({ companyId }) => {
  const { isAdmin } = usePermissions(); // Added permission check
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin()) {
      fetchInvitations();
    }
  }, [companyId, isAdmin]);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/invitations/company/${companyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setInvitations(data.invitations);
      } else {
        setError(data.error || "Failed to load invitations");
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      setError("An error occurred while loading invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/resend/${invitationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchInvitations(); // Refresh list
        alert("Invitation resent successfully!");
      } else {
        alert(data.error || "Failed to resend invitation");
      }
    } catch (error) {
      console.error("Failed to resend invitation:", error);
      alert("An error occurred while resending invitation");
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;

    try {
      const response = await fetch(`/api/invitations/revoke/${invitationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchInvitations(); // Refresh list
        alert("Invitation revoked successfully!");
      } else {
        alert(data.error || "Failed to revoke invitation");
      }
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
      alert("An error occurred while revoking invitation");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "revoked":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "accepted":
        return "✅";
      case "expired":
        return "⏰";
      case "revoked":
        return "🚫";
      default:
        return "📄";
    }
  };

  // Only admins can view invitations
  if (!isAdmin()) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can view and manage invitations.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={fetchInvitations}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Invitations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage invitations for your company
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
              {invitations.length} total
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium rounded-full">
              Administrator
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {invitations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              No Invitations
            </h4>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              You haven't sent any invitations yet. Invite managers to join your
              company.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invitations.map((invitation) => (
                <tr
                  key={invitation._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm">
                          {getStatusIcon(invitation.status)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {invitation.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Invited by {invitation.invitedBy.firstName}{" "}
                          {invitation.invitedBy.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invitation.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {invitation.role === "admin"
                        ? "Administrator"
                        : "Manager"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        invitation.status,
                      )}`}
                    >
                      {invitation.status.charAt(0).toUpperCase() +
                        invitation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(invitation.sentAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white">
                        {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(invitation.expiresAt) > new Date()
                          ? `${Math.ceil(
                              (new Date(invitation.expiresAt).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24),
                            )} days left`
                          : "Expired"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {invitation.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleResend(invitation._id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Resend invitation"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => handleRevoke(invitation._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Revoke invitation"
                        >
                          Revoke
                        </button>
                      </div>
                    )}
                    {invitation.status === "accepted" && (
                      <span className="text-green-600 dark:text-green-400">
                        Accepted
                      </span>
                    )}
                    {invitation.status === "expired" && (
                      <button
                        onClick={() => handleResend(invitation._id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        Resend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InvitationList;
