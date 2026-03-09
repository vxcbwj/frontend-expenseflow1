// components/company/AddUserModal.tsx - FIXED (removed unused function)
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { companyUsersAPI } from "../../services/companyUsersAPI.ts";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface AddUserModalProps {
  isOpen: boolean;
  companyId: string;
  onClose: () => void;
  onUserAdded: () => Promise<void>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  companyId,
  onClose,
  onUserAdded,
}) => {
  const { user } = useAuth();
  const { company } = useCompany();
  const [formData, setFormData] = useState({
    email: "",
    role: "manager", // FIXED: Default to "manager" in 2-role system
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Role is fixed to "manager" in 2-role system
  // No need for getAvailableRoles function anymore

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setError("No company selected");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    // In 2-role system, only admins can invite managers
    if (user?.role !== "admin") {
      setError("Only administrators can invite users");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      console.log("📨 Inviting user to company:", {
        companyId,
        userData: formData,
        currentUser: user?.id,
      });

      const response = await companyUsersAPI.inviteUser(companyId, {
        email: formData.email.trim(),
        role: formData.role, // Will always be "manager" in 2-role system
        department: formData.department.trim() || undefined,
      });

      console.log("✅ Invite response:", response);

      if (response.success) {
        setSuccessMessage(`Invitation sent successfully to ${formData.email}`);

        // Call the callback to refresh the user list
        await onUserAdded();

        // Reset form and close modal after delay
        setTimeout(() => {
          setFormData({ email: "", role: "manager", department: "" });
          setSuccessMessage("");
          onClose();
        }, 2000);
      } else {
        setError(response.message || "Failed to invite user");
      }
    } catch (err: any) {
      console.error("❌ Invite error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to invite user";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: "", role: "manager", department: "" });
    setError("");
    setSuccessMessage("");
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  // If user is not admin, don't show the modal
  if (user?.role !== "admin") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <div className="px-6 py-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Only administrators can invite users to the company.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 dark:text-blue-400 text-lg">
                  👤
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Invite Manager
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {company?.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="block mb-2 font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@company.com"
                required
                disabled={loading}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                User will be invited as a Manager
              </p>
            </div>

            {/* Role - Fixed to "manager" */}
            <div>
              <Label className="block mb-2 font-medium">Role</Label>
              <div className="space-y-2">
                <div className="flex items-start p-3 border rounded-lg border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 ring-1 ring-blue-500/20">
                  <div className="flex items-center h-5 mt-0.5">
                    <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Manager
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Can manage expenses, view budgets and analytics
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      This is the only role available in the current system
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department (Optional) */}
            <div>
              <Label htmlFor="department" className="block mb-2 font-medium">
                Department (Optional)
              </Label>
              <Input
                id="department"
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="e.g., Marketing, Engineering, Sales"
                disabled={loading}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Helps organize team members by department
              </p>
            </div>

            {/* Current User Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You are inviting as:{" "}
                <span className="font-semibold">
                  {user?.firstName} {user?.lastName}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your role:{" "}
                <span className="font-medium">
                  {user?.role === "admin" ? "Administrator" : "Manager"}
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Invitation...
                  </div>
                ) : (
                  "Send Invitation"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The invited user will receive an email notification and will be
            added to the company as a Manager.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;