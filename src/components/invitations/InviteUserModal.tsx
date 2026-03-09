// components/invitations/InviteUserModal.tsx - UPDATED FOR 2-ROLE SYSTEM
import React, { useState } from "react";
import { usePermissions } from "../../hooks/userPermissions";

interface InviteUserModalProps {
  companyId: string;
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  companyId,
  companyName,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [role] = useState("manager"); // Default to "manager" in 2-role system
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAdmin, canInviteManagers } = usePermissions();

  // Only admins can invite users
  if (!isAdmin()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Only administrators can invite users to the company.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check permission
    if (!canInviteManagers()) {
      setError("You don't have permission to invite users");
      setLoading(false);
      return;
    }

    // Validate email
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/invitations/company/${companyId}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            email,
            role, // In 2-role system, always "manager"
            message: message || undefined,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Failed to send invitation");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Invitation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              Invite Manager to {companyName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Invite a manager to join your company
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="manager@company.com"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                User will be invited as a Manager
              </p>
            </div>

            {/* Role Selection - Fixed to "manager" in 2-role system */}
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <div className="p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-300">👔</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Manager
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Can manage expenses, view budgets and analytics
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Only "Manager" role is available in the current system
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Personal Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add a personal message to the invitation..."
                rows={3}
                maxLength={500}
                disabled={loading}
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {message.length}/500 characters
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Info Message */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-medium">Note:</span> In the 2-role system,
                you can only invite users as{" "}
                <span className="font-semibold">Managers</span>. Administrators
                are created during company setup.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
