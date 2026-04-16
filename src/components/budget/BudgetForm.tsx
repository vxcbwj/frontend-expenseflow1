// components/budget/BudgetForm.tsx - FINAL VERSION WITH PROPER INTEGRATION
import React, { useState, useEffect } from "react";
import {
  budgetAPI,
  type CreateBudgetData,
  type Budget,
} from "../../services/budgetsAPI";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { usePermissions } from "../../hooks/userPermissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Building,
  Shield,
  AlertCircle,
  Save,
  X,
  Calendar,
  Tag,
  FileText,
} from "lucide-react";

interface BudgetFormProps {
  onBudgetCreated: () => void;
  onCancel: () => void;
  editBudget?: Budget;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  onBudgetCreated,
  onCancel,
  editBudget,
}) => {
  const { user } = useAuth();
  const { company } = useCompany();
  const { isAdmin, canManageBudgets } = usePermissions();

  // Use the hook's permission method
  const hasPermission = canManageBudgets();

  // Available categories with icons
  const categories = [
    { value: "Office Supplies", label: "📎 Office Supplies", icon: "📎" },
    { value: "Software", label: "💻 Software", icon: "💻" },
    { value: "Hardware", label: "🖥️ Hardware", icon: "🖥️" },
    { value: "Travel", label: "✈️ Travel", icon: "✈️" },
    {
      value: "Meals & Entertainment",
      label: "🍽️ Meals & Entertainment",
      icon: "🍽️",
    },
    { value: "Marketing", label: "📢 Marketing", icon: "📢" },
    { value: "Utilities", label: "⚡ Utilities", icon: "⚡" },
    { value: "Rent", label: "🏠 Rent", icon: "🏠" },
    { value: "Salaries", label: "💰 Salaries", icon: "💰" },
    { value: "Consulting", label: "👥 Consulting", icon: "👥" },
    { value: "Insurance", label: "🛡️ Insurance", icon: "🛡️" },
    { value: "Training", label: "📚 Training", icon: "📚" },
    { value: "Maintenance", label: "🔧 Maintenance", icon: "🔧" },
    { value: "Shipping", label: "📦 Shipping", icon: "📦" },
    { value: "Advertising", label: "📺 Advertising", icon: "📺" },
    { value: "Legal", label: "⚖️ Legal", icon: "⚖️" },
    { value: "Taxes", label: "💼 Taxes", icon: "💼" },
    { value: "Other", label: "📋 Other", icon: "📋" },
  ];

  // Budget periods with icons
  const periods = [
    { value: "monthly", label: "Monthly", icon: "📅" },
    { value: "quarterly", label: "Quarterly", icon: "📊" },
    { value: "yearly", label: " Yearly", icon: "📈" },
  ];

  // Form state
  const [formData, setFormData] = useState<CreateBudgetData>({
    category: "Other",
    amount: 0,
    period: "monthly",
    companyId: company?.id || "",
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If editing, populate form with existing budget data
  useEffect(() => {
    if (editBudget && company) {
      setFormData({
        category: editBudget.category,
        amount: editBudget.amount,
        period: editBudget.period,
        companyId: company.id,
        name: editBudget.name || "",
        description: editBudget.description || "",
      });
    } else if (company) {
      // Reset form for new budget
      setFormData({
        category: "other",
        amount: 0,
        period: "monthly",
        companyId: company.id,
        name: "",
        description: "",
      });
    }
  }, [editBudget, company]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.category) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    if (formData.amount <= 0) {
      setError("Please enter a valid budget amount");
      setLoading(false);
      return;
    }

    if (!formData.companyId) {
      setError("No company selected");
      setLoading(false);
      return;
    }

    try {
      if (editBudget) {
        // Update existing budget
        await budgetAPI.updateBudget(editBudget.id, formData);
      } else {
        // Create new budget
        await budgetAPI.createBudget(formData);
      }

      onBudgetCreated(); // Refresh the budget list
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  // If user doesn't have permission to manage budgets
  if (!hasPermission) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-xl bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-red-900/10">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-900/10 flex items-center justify-center">
              <Shield className="h-10 w-10 text-red-500 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              Access Restricted
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {isAdmin()
                ? "You need budget management permissions to access this feature."
                : "Only administrators can create or manage budgets."}
            </p>

            <div className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Your Role
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user?.role === "admin"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    {user?.role === "admin" ? "Administrator" : "Manager"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Required Permission
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    SET_BUDGETS
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slideDown">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {editBudget ? "Edit Budget" : "Create New Budget"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              {editBudget
                ? "Update budget details"
                : "Set up a new spending plan"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {company && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
              <Building className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {company.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/10">
        <CardContent className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                    Error
                  </h3>
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Budget Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Budget Name (Optional)
                </label>
              </div>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Q1 Marketing Budget, Office Supplies 2024"
                className="w-full h-11"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Give your budget a descriptive name for easy identification
              </p>
            </div>

            {/* Category and Period Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/10">
                    <span className="text-purple-600 dark:text-purple-400">
                      📊
                    </span>
                  </div>
                  <label
                    htmlFor="category"
                    className="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Category *
                  </label>
                </div>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) =>
                      handleSelectChange("category", e.target.value)
                    }
                    className="w-full h-11 pl-11 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white appearance-none bg-white dark:bg-gray-800"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-lg">
                      {categories.find((c) => c.value === formData.category)
                        ?.icon || "📋"}
                    </span>
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Period */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-900/10">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <label
                    htmlFor="period"
                    className="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Period *
                  </label>
                </div>
                <div className="relative">
                  <select
                    id="period"
                    name="period"
                    value={formData.period}
                    onChange={(e) =>
                      handleSelectChange("period", e.target.value)
                    }
                    className="w-full h-11 pl-11 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white appearance-none bg-white dark:bg-gray-800"
                  >
                    {periods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-lg">
                      {periods.find((p) => p.value === formData.period)?.icon ||
                        "📅"}
                    </span>
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-900/10">
                  <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <label
                  htmlFor="amount"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Budget Amount *
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  $
                </div>
                <Input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount || ""}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="w-full h-11 pl-10"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total budget for the selected period
                </p>
                {formData.amount > 0 && (
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(formData.amount)}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Description (Optional)
                </label>
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is this budget for? e.g., Online ads, office supplies, team events, software subscriptions, etc."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white resize-none bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add details about what this budget covers
              </p>
            </div>

            {/* Company Info */}
            {company && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20">
                    <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">
                      Company Association
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      This budget will be created for{" "}
                      <span className="font-semibold">{company.name}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {editBudget ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editBudget ? "Update Budget" : "Create Budget"}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Budget Preview (Optional) */}
      {formData.name || formData.amount > 0 ? (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/10">
                <span className="text-lg">👁️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Budget Preview
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Name
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formData.name || "Unnamed Budget"}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Amount
                </div>
                <div className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(formData.amount)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Period
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {periods
                    .find((p) => p.value === formData.period)
                    ?.label.replace(/[^a-zA-Z]/g, "") || "Monthly"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default BudgetForm;
