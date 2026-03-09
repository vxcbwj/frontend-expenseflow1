// components/company/CompanyManagement.tsx - FIXED WITH CORRECT PROPERTIES
import React, { useState } from "react";
import { useCompany } from "../../contexts/CompanyContext";
import { usePermissions } from "../../hooks/userPermissions";

const CompanyManagement: React.FC = () => {
  const { company, loading, createCompany, updateCompany } = useCompany();
  const { isAdmin } = usePermissions();
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    currency: "USD",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Only admins can access this page
  if (!isAdmin()) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can manage companies.
          </p>
        </div>
      </div>
    );
  }

  // Create or Update Company
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (editingCompany) {
        // Update existing company
        const result = await updateCompany(formData);
        if (result.success) {
          setSuccessMessage("Company updated successfully!");
        } else {
          setError(result.error || "Failed to update company");
        }
      } else {
        // Create new company
        const result = await createCompany(formData);
        if (result.success) {
          setSuccessMessage("Company created successfully!");
        } else {
          setError(result.error || "Failed to create company");
        }
      }

      // Just close the form - the context will update automatically
      setTimeout(() => {
        setShowForm(false);
        setEditingCompany(null);
        setFormData({ name: "", industry: "", currency: "USD" });
        setSuccessMessage("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save company");
    } finally {
      setFormLoading(false);
    }
  };

  // Edit Company
  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      currency: company.currency,
    });
    setShowForm(true);
    setError("");
    setSuccessMessage("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Cancel edit/create
  const handleCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
    setFormData({ name: "", industry: "", currency: "USD" });
    setError("");
    setSuccessMessage("");
  };

  // Refresh company data
  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading company...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Company Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administrator Dashboard
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
          >
            <span className="mr-2">🔄</span>
            Refresh
          </button>
          {!company && (
            <button
              onClick={() => {
                setEditingCompany(null);
                setFormData({ name: "", industry: "", currency: "USD" });
                setShowForm(!showForm);
              }}
              className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {showForm ? "✕ Cancel" : "＋ Create Company"}
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Add/Edit Company Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">
            {editingCompany ? "Edit Company" : "Create New Company"}
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="DZD">DZD (د.ج)</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading
                  ? editingCompany
                    ? "Updating..."
                    : "Creating..."
                  : editingCompany
                    ? "Update Company"
                    : "Create Company"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Company Info */}
      {company && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Your Company
          </h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Name:
              </span>{" "}
              <span className="text-gray-900 dark:text-white">
                {company.name}
              </span>
            </div>
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
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
              <button
                onClick={() => handleEditCompany(company)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit Company
              </button>
              <button
                onClick={handleRefresh}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {!company && !showForm && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No company yet. Create your company to get started!</p>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
