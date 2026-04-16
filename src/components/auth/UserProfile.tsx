import React, { useState, useEffect } from "react";
import {
  userAPI,
  type UserProfile,
  type UpdateProfileData,
} from "../../services/userAPI";
import { useAuth } from "../../contexts/AuthContext";

const UserProfile: React.FC = () => {
  const { user: authUser, refreshProfile } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setLoading(false);
    } else {
      loadProfile();
    }
  }, [authUser]);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const isValidPhoneNumber = (value: string) => {
    if (!value) return true;
    const normalized = value.replace(/\s+/g, "");
    if (/^\+213\d{9}$/.test(normalized)) return true;
    return /^\+\d{4,15}$/.test(normalized);
  };

  const handleSave = async () => {
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      setMessage(
        "Please enter a valid phone number. Algerian numbers must start with +213 followed by 9 digits.",
      );
      return;
    }

    try {
      const response = await userAPI.updateProfile(formData);
      if (response.success) {
        setUser(response.user);
        setEditMode(false);
        setFormData({});
        setMessage("Profile updated successfully");
        // Refresh auth context
        if (refreshProfile) {
          await refreshProfile();
        }
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Failed to update profile");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("preferences.")) {
      const prefField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No user data found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {user.email}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {user.role === "admin" ? "Admin" : "Manager"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              editMode
                ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
          >
            {editMode ? "✕ Cancel" : "✏️ Edit Profile"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`px-5 py-4 rounded-lg border transition-all ${
            message.includes("success")
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">
              {message.includes("success") ? "✅" : "⚠️"}
            </span>
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                👤
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Personal Information
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                First Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName ?? user.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Last Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName ?? user.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.lastName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Email Address
              </label>
              <p className="text-base text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                {user.email}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Phone Number
              </label>
              {editMode ? (
                <input
                  type="tel"
                  name="phone"
                  placeholder="+213 553 97 67 88"
                  value={formData.phone ?? user.phone ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              ) : (
                <p className="text-base text-gray-700 dark:text-gray-300">
                  {user.phone ? (
                    <span className="font-mono">{user.phone}</span>
                  ) : (
                    <span className="text-gray-500 italic">Not provided</span>
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Role
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === "admin"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {user.role === "admin" ? "Administrator" : "Manager"}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl">
                ⚙️
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Preferences
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Theme
              </label>
              {editMode ? (
                <select
                  name="preferences.theme"
                  value={formData.preferences?.theme ?? user.preferences.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="auto">Auto (System)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              ) : (
                <p className="text-base font-semibold capitalize text-gray-900 dark:text-white">
                  {user.preferences.theme === "auto"
                    ? "Auto (System)"
                    : user.preferences.theme}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Default Currency
              </label>
              {editMode ? (
                <select
                  name="preferences.currency"
                  value={
                    formData.preferences?.currency ?? user.preferences.currency
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="DZD">DZD - د.ج (Algerian Dinar)</option>
                  <option value="USD">USD - $ (US Dollar)</option>
                  <option value="EUR">EUR - € (Euro)</option>
                  <option value="GBP">GBP - £ (British Pound)</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {user.preferences.currency || "DZD"}
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {user.preferences.currency === "DZD" ||
                    !user.preferences.currency
                      ? "Algerian Dinar"
                      : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {editMode && (
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setEditMode(false)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg"
            >
              ✅ Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Password Change Section */}
      <ChangePasswordSection />
    </div>
  );
};

// Separate component for password change
const ChangePasswordSection: React.FC = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords don't match");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setMessage("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Change Password
        </h2>
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showPasswordForm ? "Cancel" : "Change Password"}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.includes("success")
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {showPasswordForm && (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserProfile;
