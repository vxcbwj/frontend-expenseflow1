// components/company/CompanyOwnerManagement.tsx - FIXED WITH CORRECT PROPERTIES
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { usePermissions } from "../../hooks/userPermissions";

const CompanyOwnerManagement: React.FC = () => {
  const navigate = useNavigate();
  const { company, loading, fetchCompany } = useCompany(); // Now using fetchCompany
  const { isAdmin } = usePermissions();

  // In 2-role system, only admins manage companies
  const shouldShowPage = isAdmin();

  if (!shouldShowPage) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Only administrators can access company management.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading company...
        </span>
      </div>
    );
  }

  // If no company found
  if (!company) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            🏢 Company Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administrator Dashboard
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            ⚠️ No Company Found
          </h2>
          <div className="space-y-3">
            <p>As an administrator, you need to create a company first.</p>
            <div className="mt-4 space-x-3">
              <button
                onClick={() => navigate("/companies/create")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Create Company
              </button>
              <button
                onClick={() => fetchCompany()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh Data
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              🏢 Company Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administrator Control Panel
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchCompany()}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              <span className="mr-2">🔄</span>
              Refresh
            </button>
            <span
              className={`px-3 py-2 text-sm rounded-lg ${
                isAdmin()
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              }`}
            >
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Company Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {company.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Company Information
            </p>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full ${"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"}`}
          >
            Administrator
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Industry:
              </span>{" "}
              <span className="text-gray-900 dark:text-white">
                {company.industry}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Currency:
              </span>{" "}
              <span className="text-gray-900 dark:text-white">
                {company.currency}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Created:
              </span>{" "}
              <span className="text-gray-900 dark:text-white">
                {company.createdAt
                  ? new Date(company.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Company ID:
              </span>{" "}
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {company.id ? company.id.substring(0, 8) + "..." : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => navigate("/expenses")}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center"
          >
            💰 Expenses
          </button>
          <button
            onClick={() => navigate("/budgets")}
            className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center justify-center"
          >
            📈 Budgets
          </button>
          <button
            onClick={() => navigate("/analytics")}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center"
          >
            📊 Analytics
          </button>
        </div>

        {/* Admin Only Actions */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/company-users")}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center justify-center"
          >
            👥 Manage Team
          </button>
          <button
            onClick={() => navigate(`/companies/edit/${company.id}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs font-medium flex items-center justify-center"
          >
            ⚙️ Company Settings
          </button>
          <button
            onClick={() => navigate("/invitations")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium flex items-center justify-center"
          >
            📨 Invitations
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyOwnerManagement;
