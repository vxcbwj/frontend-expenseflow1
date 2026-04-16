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
    currency: "DZD",
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
        setFormData({ name: "", industry: "", currency: "DZD" });
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
    setFormData({ name: "", industry: "", currency: "DZD" });
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
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
              🏢
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Company Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Administrator Control Panel
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              🔄 Refresh
            </button>
            {!company && (
              <button
                onClick={() => {
                  setEditingCompany(null);
                  setFormData({ name: "", industry: "", currency: "DZD" });
                  setShowForm(!showForm);
                }}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  showForm
                    ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                }`}
              >
                {showForm ? "✕ Cancel" : "＋ Create Company"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300 flex items-start gap-3">
          <span className="text-lg mt-0.5">✅</span>
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {/* Add/Edit Company Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {editingCompany ? "✏️ Edit Company" : "➕ Create New Company"}
          </h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 flex items-start gap-3">
              <span className="text-lg mt-0.5">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all"
                  placeholder="Enter industry"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Currency
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  DZD - د.ج
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (Algerian Dinar)
                </span>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-all"
              >
                {formLoading
                  ? editingCompany
                    ? "Updating..."
                    : "Creating..."
                  : editingCompany
                    ? "✅ Update Company"
                    : "✅ Create Company"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Company Info */}
      {company && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
                🏢
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {company.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Company Profile
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditCompany(company)}
                className="px-4 py-2.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 font-medium text-sm transition-colors"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleRefresh}
                className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium text-sm transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
                Industry
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {company.industry}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
                Currency
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  DZD
                </span>
                <span className="text-2xl">د.ج</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
                Created
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {company.createdAt
                  ? new Date(company.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">
                Company ID
              </p>
              <p className="text-lg font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-200 break-all">
                {company._id}
              </p>
            </div>
          </div>
        </div>
      )}

      {!company && !showForm && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <div className="text-5xl mb-4">🏢</div>
          <p className="text-lg">
            No company yet. Create your company to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
