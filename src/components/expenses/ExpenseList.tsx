// components/expenses/ExpenseList.tsx - UPDATED
import React, { useState } from "react";
import { expenseAPI, type Expense } from "../../services/expenseAPI";
//import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { usePermissions } from "../../hooks/userPermissions";
import EditExpenseForm from "./EditExpenseForm";
import ExpenseStatusBadge from "./ExpenseStatusBadge";
import ExpenseApprovalActions from "./ExpenseApprovalActions";
import { Paperclip } from "lucide-react";
import { ReceiptModal } from "./ReceiptModal";
import { Receipt } from "../../services/receiptAPI";

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseUpdated: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onExpenseUpdated,
}) => {
  // Debug: Check if keys are unique
  React.useEffect(() => {
    if (expenses.length > 0) {
      const ids = expenses.map((e) => e.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn("⚠️ ExpenseList: Duplicate expense IDs found!");
      }
      // Log first expense to see what fields are available
    }
  }, [expenses]);

  // const { user } = useAuth();
  const { company: _company } = useCompany();
  const { canManageExpenses, isAdmin } = usePermissions();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [viewingReceipt, setViewingReceipt] = useState<{
    receipts: Receipt[];
    index: number;
  } | null>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Category colors
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      electricity: "text-blue-600",
      water: "text-cyan-600",
      internet: "text-purple-600",
      rent: "text-red-600",
      supplies: "text-green-600",
      salaries: "text-orange-600",
      marketing: "text-pink-600",
      transportation: "text-indigo-600",
      other: "text-gray-600",
    };
    return colors[category] || "text-gray-600";
  };

  // Department badge component
  const DepartmentBadge = ({ department }: { department: string }) => {
    const colors: Record<string, string> = {
      "Sales & Marketing":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Operations:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Technology:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Finance:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "Human Resources":
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      Administration:
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      Other: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[department] || colors["Other"]
        }`}
      >
        {department}
      </span>
    );
  };

  // Check if user can edit expenses (same as canManageExpenses)
  const canEditExpense = canManageExpenses;

  // Check if user can delete expenses (same as canManageExpenses in 2-role system)
  // Note: Since we don't have canDeleteExpenses method, use canManageExpenses
  const canDeleteExpense = canManageExpenses;

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      setLoading(true);
      await expenseAPI.deleteExpense(expenseId);
      onExpenseUpdated();
    } catch (err: any) {
      setError("Failed to delete expense");
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleSaveEdit = () => {
    setEditingExpense(null);
    onExpenseUpdated();
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  // Filter expenses by status and department
  const filteredExpenses = expenses.filter((expense) => {
    if (statusFilter !== "all" && expense.status !== statusFilter) return false;
    if (departmentFilter !== "all" && expense.department !== departmentFilter)
      return false;
    return true;
  });

  if (error) {
    return (
      <div
        key="expense-list-error"
        className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-center"
      >
        {error}
      </div>
    );
  }

  if (filteredExpenses.length === 0) {
    return (
      <div
        key="expense-list-empty"
        className="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <p className="text-lg">No expenses yet</p>
        <p className="text-sm">Add your first expense to see it here</p>
      </div>
    );
  }

  return (
    <div
      key="expense-list-container"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
    >
      {/* Edit Form */}
      {editingExpense && (
        <EditExpenseForm
          key={`edit-form-${editingExpense.id}`}
          expense={editingExpense}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Table Header */}
      <div
        key="table-header"
        className="px-6 py-4 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Expense History
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredExpenses.length} expenses
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Your role: {isAdmin() ? "Administrator" : "Manager"}
              {canManageExpenses() && " - Can manage expenses"}
            </p>
          </div>

          {/* Status and Department Filters */}
          <div className="flex flex-col sm:flex-row gap-2 min-w-max">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
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
        </div>
      </div>

      {/* Table Content */}
      <div key="table-content" className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr key="table-header-row">
              <th
                key="header-description"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                key="header-category"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                key="header-department"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Department
              </th>
              <th
                key="header-status"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                key="header-date"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                key="header-vendor"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Vendor
              </th>
              <th
                key="header-amount"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                key="header-approval-actions"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Approval
              </th>
              <th
                key="header-receipts"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Receipts
              </th>
              {(canEditExpense() || canDeleteExpense()) && (
                <th
                  key="header-actions"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {(filteredExpenses || []).map((expense, index) => {
              const showEditButton = canEditExpense();
              const showDeleteButton = canDeleteExpense();
              const showActions = showEditButton || showDeleteButton;

              return (
                <tr
                  key={`expense-row-${expense.id || index}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {expense.description}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        expense.category,
                      )} bg-opacity-10`}
                    >
                      {expense.category.charAt(0).toUpperCase() +
                        expense.category.slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <DepartmentBadge
                      department={expense.department || "Other"}
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <ExpenseStatusBadge
                      status={expense.status || "pending"}
                      approvedBy={expense.approvedBy}
                      approvedAt={expense.approvedAt}
                      showDetails={true}
                      size="sm"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(expense.date)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {expense.vendor || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white">
                    {formatCurrency(expense.amount)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <ExpenseApprovalActions
                      expenseId={expense.id}
                      currentStatus={expense.status || "pending"}
                      amount={expense.amount}
                      description={expense.description}
                      onApprove={() => {
                        onExpenseUpdated();
                      }}
                      onReject={() => {
                        onExpenseUpdated();
                      }}
                      compact={true}
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {expense.receipts && expense.receipts.length > 0 ? (
                      <button
                        onClick={() =>
                          setViewingReceipt({
                            receipts: expense.receipts || [],
                            index: 0,
                          })
                        }
                        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Paperclip className="w-4 h-4" />
                        {expense.receipts.length}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {showEditButton && (
                          <button
                            key={`edit-btn-${expense.id}`}
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-800 transition-colors px-2 py-1"
                          >
                            Edit
                          </button>
                        )}
                        {showDeleteButton && (
                          <button
                            key={`delete-btn-${expense.id}`}
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-800 transition-colors px-2 py-1"
                            disabled={loading}
                          >
                            {loading ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Receipt viewer modal */}
      {viewingReceipt && (
        <ReceiptModal
          receipts={viewingReceipt.receipts}
          initialIndex={viewingReceipt.index}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
};

export default ExpenseList;
