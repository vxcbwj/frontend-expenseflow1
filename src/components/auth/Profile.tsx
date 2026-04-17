import React, { useState, useEffect } from "react";
import { userAPI, type UserProfile } from "../../services/userAPI";
import { useAuth } from "../../contexts/AuthContext";
import { formatPhoneNumber } from "../../utils/phoneValidator";

const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
        Error: {error}
      </div>
    );

  if (!user)
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No user data found
      </div>
    );

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Your Profile
      </h2>

      <div className="space-y-4">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            First Name:
          </label>
          <p className="text-gray-800 dark:text-white">{user.firstName}</p>
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Last Name:
          </label>
          <p className="text-gray-800 dark:text-white">{user.lastName}</p>
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Email:
          </label>
          <p className="text-gray-800 dark:text-white">{user.email}</p>
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Phone:
          </label>
          <p className="text-gray-800 dark:text-white">
            {user.phone ? formatPhoneNumber(user.phone) : "Not provided"}
          </p>
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Role:
          </label>
          <p className="text-gray-800 dark:text-white">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === "admin"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              }`}
            >
              {user.role === "admin" ? "Admin" : "Manager"}
            </span>
          </p>
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            User ID:
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {user.id}
          </p>
        </div>

        {user.companyId && (
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Company ID:
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              {user.companyId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
