// pages/ProfilePage.tsx
import React from "react";
import UserProfile from "../components/auth/UserProfile";

const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <UserProfile />
      </div>
    </div>
  );
};

export default ProfilePage;
