// components/expenses/ExpenseForm.tsx - UPDATED FOR 2-ROLE SYSTEM
import React, { useState } from "react";
import {
  expenseAPI,
  type CreateExpenseData,
  type Expense,
} from "../../services/expenseAPI";
import { useCompany } from "../../contexts/CompanyContext";
import { usePermissions } from "../../hooks/userPermissions"; // Added new import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseStatusBadge from "./ExpenseStatusBadge";
import { ReceiptUpload } from "./ReceiptUpload";
import { ReceiptGallery } from "./ReceiptGallery";
import { ReceiptModal } from "./ReceiptModal";
import { receiptAPI, Receipt } from "../../services/receiptAPI";
import { useFileUpload } from "../../hooks/useFileUpload";
import { Loader2 } from "lucide-react";

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  expense?: Expense; // For edit mode
  compact?: boolean; // Optional prop for compact version
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onExpenseAdded,
  expense,
  compact = false,
}) => {
  const { company } = useCompany(); // Changed from currentCompany to company
  const { canCreateExpenses } = usePermissions(); // Using new hook
  const { files, addFiles, removeFile, clearFiles, errors } = useFileUpload();
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

  const [formData, setFormData] = useState<CreateExpenseData>({
    amount: 0,
    category: "other",
    department: "Other",
    description: "",
    date: new Date().toISOString().split("T")[0],
    vendor: "",
    companyId: company?.id || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewingReceipt, setViewingReceipt] = useState<{
    receipts: Receipt[];
    index: number;
  } | null>(null);

  React.useEffect(() => {
    if (company) {
      setFormData((prev) => ({
        ...prev,
        companyId: company.id,
      }));
    }
  }, [company]);

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
    setUploading(true);
    setError("");
    setSuccess("");

    // Check permission first
    if (!canCreateExpenses()) {
      setError("You don't have permission to create expenses");
      setLoading(false);
      setUploading(false);
      return;
    }

    // check if company is selected
    if (!formData.companyId) {
      setError("No company selected. Please select a company first.");
      setLoading(false);
      setUploading(false);
      return;
    }

    // Basic validation
    if (formData.amount <= 0) {
      setError("Please enter a valid amount");
      setLoading(false);
      setUploading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a description");
      setLoading(false);
      setUploading(false);
      return;
    }

    try {
      let expenseId: string;

      // Create or update expense
      if (expense?.id) {
        await expenseAPI.updateExpense(expense.id, formData);
        expenseId = expense.id;
      } else {
        const result = await expenseAPI.createExpense(formData);
        expenseId = result.expense._id;
      }

      // Upload receipts if any
      if (files.length > 0) {
        await receiptAPI.uploadReceipts(expenseId, files, (progress) => {
          setUploadProgress(progress);
        });
      }

      setSuccess(
        "Expense " + (expense?.id ? "updated" : "added") + " successfully!",
      );

      // Reset form
      setFormData({
        amount: 0,
        category: "other",
        department: "Other",
        description: "",
        date: new Date().toISOString().split("T")[0],
        vendor: "",
        companyId: company?.id || "",
      });
      clearFiles();
      setUploadProgress(0);

      // Refresh parent component
      onExpenseAdded();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save expense");
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Check if user can create expenses
  if (!canCreateExpenses()) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have permission to create expenses.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Compact version for sidebar
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Amount */}
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block"
              >
                Amount
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
                className="h-9"
              />
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
                placeholder="What was this for?"
                className="h-9"
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
                className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
              >
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
                Department *
              </label>
              <select
                id="department"
                name="department"
                value={formData.department || "Other"}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
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

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full h-9">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Add Expense"
              )}
            </Button>

            {/* Messages */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                {success}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Error Message */}
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
                Department *
              </label>
              <select
                id="department"
                name="department"
                value={formData.department || "Other"}
                onChange={handleChange}
                required
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
              />
            </div>
          </div>

          {/* Receipts & Documents */}
          <div className="col-span-2 space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Receipts & Documents
              <span className="text-gray-500 ml-1">(Optional)</span>
            </label>

            <ReceiptUpload
              files={files}
              onFilesChange={(newFiles) => {
                // Clear existing files
                while (files.length > 0) removeFile(0);
                // Add new files
                addFiles(newFiles);
              }}
              uploading={uploading}
              disabled={uploading}
            />

            {errors.length > 0 && (
              <div className="space-y-1">
                {errors.map((error, i) => (
                  <p key={i} className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                ))}
              </div>
            )}

            {expense?.receipts && expense.receipts.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Existing Receipts ({expense.receipts.length})
                </h4>
                <ReceiptGallery
                  receipts={expense.receipts}
                  onView={(index) =>
                    setViewingReceipt({
                      receipts: expense.receipts || [],
                      index,
                    })
                  }
                  onDelete={async (receiptId) => {
                    if (!expense.id) return;
                    const result = await receiptAPI.deleteReceipt(
                      expense.id,
                      receiptId,
                    );
                    if (result.success) {
                      onExpenseAdded?.();
                    }
                  }}
                  canDelete={true}
                />
              </div>
            )}
          </div>

          {/* Approval Status Section (only if expense exists) */}
          {expense?.id && (
            <div className="col-span-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Approval Status
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    Current Status
                  </label>
                  <div className="mt-1">
                    <ExpenseStatusBadge
                      status={expense.status || "pending"}
                      approvedBy={expense.approvedBy}
                      approvedAt={expense.approvedAt}
                      showDetails={true}
                      size="md"
                    />
                  </div>
                </div>

                {expense.approvedBy && (
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Approved By
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {expense.approvedBy.firstName}{" "}
                      {expense.approvedBy.lastName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {expense.approvedBy.email}
                    </p>
                  </div>
                )}

                {expense.approvedAt && (
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Approval Date
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {new Date(expense.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || uploading}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {uploadProgress > 0
                  ? `Uploading... ${uploadProgress}%`
                  : "Uploading receipts..."}
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : expense?.id ? (
              "Update Expense"
            ) : (
              "Create Expense"
            )}
          </Button>

          {/* Modal for viewing receipts */}
          {viewingReceipt && (
            <ReceiptModal
              receipts={viewingReceipt.receipts}
              initialIndex={viewingReceipt.index}
              onClose={() => setViewingReceipt(null)}
            />
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
