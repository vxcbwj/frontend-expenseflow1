// components/expenses/ExpenseList.tsx - UPDATED
import React, { useState, useEffect, useRef, useMemo } from "react";
import { expenseAPI, type Expense } from "../../services/expenseAPI";
//import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { usePermissions } from "../../hooks/userPermissions";
import EditExpenseForm from "./EditExpenseForm";
import ExpenseApprovalActions from "./ExpenseApprovalActions";
import {
  Paperclip,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
} from "lucide-react";
import { ReceiptModal } from "./ReceiptModal";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Receipt } from "../../services/receiptAPI";
import {
  EXPENSE_DEPARTMENTS,
  CATEGORY_COLORS,
  DEPARTMENT_COLORS,
} from "../../utils/constants";
import ExpenseStatusBadge from "./ExpenseStatusBadge";
import { formatCurrency } from "../../utils/formatCurrency";

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
  const storedSearch =
    typeof window !== "undefined"
      ? sessionStorage.getItem("expenseSearchQuery") || ""
      : "";
  const [searchInput, setSearchInput] = useState<string>(storedSearch);
  const [searchQuery, setSearchQuery] = useState<string>(storedSearch);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Expense>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewingReceipt, setViewingReceipt] = useState<{
    receipts: Receipt[];
    index: number;
  } | null>(null);

  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const escapeRegExp = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const escaped = escapeRegExp(query.trim());
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.split(regex).map((part, idx) =>
      regex.test(part) ? (
        <span
          key={idx}
          className="bg-yellow-100 dark:bg-yellow-900/40 rounded px-0.5"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("expenseSearchQuery", searchInput);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchInput]);

  const SortableHeader = ({
    field,
    label,
    align = "left",
  }: {
    field: keyof Expense;
    label: string;
    align?: "left" | "right";
  }) => (
    <th
      className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group select-none`}
      onClick={() => handleSort(field)}
    >
      <div
        className={`flex items-center space-x-1 ${align === "right" ? "justify-end" : ""}`}
      >
        <span>{label}</span>
        <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
          {sortField === field ? (
            sortDirection === "asc" ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          )}
        </span>
      </div>
    </th>
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, _company?.currency || "DZD");
  };

  // Category colors
  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"];
  };

  // Department badge component
  const DepartmentBadge = ({ department }: { department: string }) => {
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          DEPARTMENT_COLORS[department] || DEPARTMENT_COLORS["Other"]
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

  const handleDeleteExpense = async () => {
    if (!deleteConfirmId) return;

    try {
      setLoading(true);
      await expenseAPI.deleteExpense(deleteConfirmId);
      onExpenseUpdated();
    } catch (err: any) {
      setError("Failed to delete expense");
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
      setDeleteConfirmId(null);
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
  const filteredExpenses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return expenses.filter((expense) => {
      if (statusFilter !== "all" && expense.status !== statusFilter)
        return false;
      if (departmentFilter !== "all" && expense.department !== departmentFilter)
        return false;

      if (!query) return true;

      const matchesDescription = expense.description
        .toLowerCase()
        .includes(query);
      const matchesVendor = expense.vendor?.toLowerCase().includes(query);
      const matchesCategory = expense.category?.toLowerCase().includes(query);
      const matchesDepartment = expense.department
        ?.toLowerCase()
        .includes(query);
      const matchesStatus = expense.status?.toLowerCase().includes(query);
      const matchesAmount = expense.amount.toString().includes(query);

      return (
        matchesDescription ||
        matchesVendor ||
        matchesCategory ||
        matchesDepartment ||
        matchesStatus ||
        matchesAmount
      );
    });
  }, [expenses, statusFilter, departmentFilter, searchQuery]);

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === undefined) valA = "";
    if (valB === undefined) valB = "";

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
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

  if (expenses.length === 0) {
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

  if (filteredExpenses.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-300">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Search className="w-7 h-7 text-gray-500 dark:text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No results found for "{searchQuery}"
        </h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters to find the expense.
        </p>
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

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center min-w-max">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6 sm:mt-0">
                <Search className="h-4 w-4 text-gray-400 mt-6" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by vendor, category, amount, or description..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 pr-9 w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status and Department Filters */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {EXPENSE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
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
              <SortableHeader field="description" label="Description" />
              <SortableHeader field="category" label="Category" />
              <SortableHeader field="department" label="Department" />
              <SortableHeader field="status" label="Status" />
              <SortableHeader field="date" label="Date" />
              <SortableHeader field="vendor" label="Vendor" />
              <SortableHeader field="amount" label="Amount" align="right" />
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
            {(sortedExpenses || []).map((expense, index) => {
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
                      {highlightText(expense.description, searchQuery)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        expense.category,
                      )}`}
                    >
                      {highlightText(expense.category, searchQuery)}
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
                    {expense.vendor
                      ? highlightText(expense.vendor, searchQuery)
                      : "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white">
                    {formatAmount(expense.amount)}
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
                            onClick={() => setDeleteConfirmId(expense.id)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel={loading ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteExpense}
        onCancel={() => !loading && setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default ExpenseList;
