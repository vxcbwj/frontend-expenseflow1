// components/expenses/EditExpenseForm.tsx - UPDATED
import React, { useState } from "react";
//import { useAuth } from "@/contexts/AuthContext";
import {
  expenseAPI,
  type CreateExpenseData,
  type Expense,
} from "../../services/expenseAPI";
import { usePermissions } from "../../hooks/userPermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditExpenseFormProps {
  expense: Expense;
  onSave: () => void;
  onCancel: () => void;
}

const EditExpenseForm: React.FC<EditExpenseFormProps> = ({
  expense,
  onSave,
  onCancel,
}) => {
  const { canManageExpenses, isAdmin } = usePermissions();
  const categories = [
    "electricity",
    "water",
    "internet",
    "rent",
    "supplies",
    "salaries",
    "marketing",
    "transportation",
    "other",
  ];

  // Permission check for 2-role system
  // Since expenses don't have userId field, we can't track ownership
  // In 2-role system:
  // - Admin: can edit any expense (if canManageExpenses is true)
  // - Manager: can edit any expense (if canManageExpenses is true)
  const userCanEditExpense = canManageExpenses();

  // Safe date formatting function
  const formatDateForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split("T")[0];
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      return new Date().toISOString().split("T")[0];
    }
  };

  // Pre-fill form with current expense data
  const [formData, setFormData] = useState<CreateExpenseData>({
    amount: expense.amount,
    category: expense.category,
    department: expense.department || "Other",
    description: expense.description,
    date: formatDateForInput(expense.date),
    vendor: expense.vendor || "",
    companyId: expense.companyId,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check permission
    if (!userCanEditExpense) {
      setError("You don't have permission to edit expenses");
      setLoading(false);
      return;
    }

    // Validation
    if (formData.amount <= 0) {
      setError("Please enter a valid amount");
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a description");
      setLoading(false);
      return;
    }

    try {
      await expenseAPI.updateExpense(expense.id, formData);
      onSave(); // Tell parent to refresh
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  if (!userCanEditExpense) {
    return (
      <Card className="mb-6 border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🔒</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to edit expenses.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Your role: {isAdmin() ? "Administrator" : "Manager"}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle>Edit Expense</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block"
              >
                Amount ($)
              </label>
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
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label
                htmlFor="department"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block"
              >
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department || "Other"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Select Department</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Administration">Administration</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block"
            >
              Description
            </label>
            <Input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="What was this expense for?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor */}
            <div className="space-y-2">
              <label
                htmlFor="vendor"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block"
              >
                Vendor (Optional)
              </label>
              <Input
                type="text"
                id="vendor"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                placeholder="Who did you pay?"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label
                htmlFor="date"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block"
              >
                Date
              </label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Expense"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditExpenseForm;
