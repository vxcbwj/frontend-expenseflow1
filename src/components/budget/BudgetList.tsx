// components/budget/BudgetList.tsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { budgetAPI, type Budget } from "../../services/budgetsAPI";
import { expenseAPI, type Expense } from "../../services/expenseAPI";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { usePermissions } from "../../hooks/userPermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "../../utils/formatCurrency";
import BudgetForm from "./BudgetForm";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Shield } from "lucide-react";

interface BudgetWithProgress extends Budget {
  currentSpending: number;
  percentageUsed: number;
  remaining: number;
  status: "on_track" | "warning" | "exceeded";
}

interface BudgetListProps {
  budgets: Budget[];
  loading: boolean;
  onBudgetUpdated: () => void;
  canEdit?: boolean;
}

const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  loading,
  onBudgetUpdated,
  canEdit = false,
}) => {
  const { user } = useAuth();
  const { company } = useCompany();
  const { canManageBudgets, canViewBudgets } = usePermissions();

  const [budgetsWithProgress, setBudgetsWithProgress] = useState<
    BudgetWithProgress[]
  >([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [calculating, setCalculating] = useState(true);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    onConfirm: () => void;
  } | null>(null);

  // ========== PERMISSION CHECKS ==========
  const userCanViewBudgets = canViewBudgets();
  const userCanManageBudgets = canManageBudgets();
  const showEditButtons =
    canEdit !== undefined ? canEdit : userCanManageBudgets;

  // ========== DATA FETCHING ==========

  const fetchExpenses = async () => {
    if (!company) return;
    try {
      const response = await expenseAPI.getExpenses(company.id);
      if (response.success) {
        setExpenses(response.expenses);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  const calculateBudgetProgress = () => {
    if (!budgets.length || !expenses.length) {
      setBudgetsWithProgress([]);
      setCalculating(false);
      return;
    }

    const budgetsWithProgressData = budgets.map((budget) => {
      const periodExpenses = expenses.filter((expense) => {
        if (expense.category !== budget.category) return false;

        const expenseDate = new Date(expense.date);
        const budgetStartDate = budget.startDate
          ? new Date(budget.startDate)
          : null;
        const budgetEndDate = budget.endDate ? new Date(budget.endDate) : null;

        if (!budgetStartDate || !budgetEndDate) {
          return true;
        }

        return expenseDate >= budgetStartDate && expenseDate <= budgetEndDate;
      });

      const currentSpending = periodExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );
      const percentageUsed = (currentSpending / budget.amount) * 100;
      const remaining = budget.amount - currentSpending;

      let status: "on_track" | "warning" | "exceeded" = "on_track";
      if (percentageUsed >= 100) {
        status = "exceeded";
      } else if (percentageUsed >= 80) {
        status = "warning";
      }

      return { ...budget, currentSpending, percentageUsed, remaining, status };
    });

    setBudgetsWithProgress(budgetsWithProgressData);
    setCalculating(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [company]);

  useEffect(() => {
    if (expenses.length > 0) {
      calculateBudgetProgress();
    } else {
      setCalculating(false);
    }
  }, [budgets, expenses]);

  // ========== HANDLERS ==========

  const handleDeleteBudget = (budgetId: string) => {
    setConfirmState({
      open: true,
      onConfirm: async () => {
        try {
          await budgetAPI.deleteBudget(budgetId);
          onBudgetUpdated();
        } catch (error: any) {
          console.error("Failed to delete budget:", error);
        }
        setConfirmState(null);
      },
    });
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
  };

  const handleBudgetUpdated = () => {
    setEditingBudget(null);
    onBudgetUpdated();
  };

  // ========== HELPERS ==========

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "on_track":
        return {
          color: "text-green-600",
          bgColor: "bg-green-100",
          text: "On Track",
          darkColor: "dark:text-green-400",
          darkBg: "dark:bg-green-900/30",
        };
      case "warning":
        return {
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          text: "Warning",
          darkColor: "dark:text-orange-400",
          darkBg: "dark:bg-orange-900/30",
        };
      case "exceeded":
        return {
          color: "text-red-600",
          bgColor: "bg-red-100",
          text: "Exceeded",
          darkColor: "dark:text-red-400",
          darkBg: "dark:bg-red-900/30",
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          text: "Unknown",
          darkColor: "dark:text-gray-400",
          darkBg: "dark:bg-gray-900/30",
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      "Office Supplies": "📎",
      Software: "💻",
      Hardware: "🖥️",
      Travel: "✈️",
      "Meals & Entertainment": "🍽️",
      Marketing: "📢",
      Utilities: "⚡",
      Rent: "🏠",
      Salaries: "💰",
      Consulting: "👔",
      Insurance: "🛡️",
      Training: "🎓",
      Maintenance: "🔧",
      Shipping: "🚚",
      Advertising: "📺",
      Legal: "⚖️",
      Taxes: "🧾",
      Other: "📋",
    };
    return icons[category] || "📋";
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // ========== ACCESS DENIED CARD ==========
  // Declared before early returns so it is in scope for the final return
  const accessDeniedCard = (
    <Card>
      <CardContent className="py-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-900/10 flex items-center justify-center">
          <Shield className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You don't have permission to view budgets.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Required permission: VIEW_BUDGETS
          </p>
          <Badge
            variant="outline"
            className={
              user?.role === "admin"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            }
          >
            Your role: {user?.role === "admin" ? "Administrator" : "Manager"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  // ========== EARLY GUARD RETURNS ==========

  if (loading || calculating) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {loading ? "Loading budgets..." : "Calculating spending..."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (editingBudget) {
    return (
      <BudgetForm
        onBudgetCreated={handleBudgetUpdated}
        onCancel={handleCancelEdit}
        editBudget={editingBudget}
      />
    );
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No Budgets Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {showEditButtons
              ? "Create your first budget to start tracking your spending"
              : "No budgets have been created for this company yet"}
          </p>
          {!showEditButtons && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contact your company admin to create a budget
              </p>
              <Badge
                variant="outline"
                className={
                  user?.role === "admin"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                }
              >
                Your role:{" "}
                {user?.role === "admin" ? "Administrator" : "Manager"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ========== MAIN CONTENT ==========

  const mainContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📊 Budget Overview</span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {budgets.length} budget{budgets.length !== 1 ? "s" : ""}
              </Badge>
              <Badge
                variant="outline"
                className={
                  user?.role === "admin"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                }
              >
                {user?.role === "admin" ? "Administrator" : "Manager"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {
                  budgetsWithProgress.filter((b) => b.status === "on_track")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                On Track
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {
                  budgetsWithProgress.filter((b) => b.status === "warning")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Warning
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {
                  budgetsWithProgress.filter((b) => b.status === "exceeded")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Exceeded
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {budgetsWithProgress.map((budget) => {
          const statusConfig = getStatusConfig(budget.status);

          return (
            <Card
              key={budget.id}
              className={`border-l-4 ${
                budget.status === "exceeded"
                  ? "border-l-red-500"
                  : budget.status === "warning"
                    ? "border-l-orange-500"
                    : "border-l-green-500"
              } hover:shadow-md transition-shadow`}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getCategoryIcon(budget.category)}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {budget.name ||
                            `${
                              budget.category.charAt(0).toUpperCase() +
                              budget.category.slice(1)
                            } Budget`}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {budget.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {budget.period}
                          </Badge>
                          <Badge
                            className={`text-xs ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.darkBg} ${statusConfig.darkColor}`}
                          >
                            {statusConfig.text}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(budget.startDate)} –{" "}
                            {formatDate(budget.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Spent: {formatCurrency(budget.currentSpending)} of{" "}
                          {formatCurrency(budget.amount)}
                        </span>
                        <span
                          className={`font-semibold ${
                            budget.status === "exceeded"
                              ? "text-red-600"
                              : budget.status === "warning"
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {Math.min(budget.percentageUsed, 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                            budget.status === "exceeded"
                              ? "bg-red-500"
                              : budget.status === "warning"
                                ? "bg-orange-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(budget.percentageUsed, 100)}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Remaining:{" "}
                          <span
                            className={`font-semibold ${
                              budget.remaining < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {formatCurrency(Math.max(budget.remaining, 0))}
                          </span>
                        </span>
                        <span
                          className={
                            budget.remaining < 0
                              ? "text-red-600 font-semibold"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {budget.remaining < 0
                            ? "Over budget: " +
                              formatCurrency(Math.abs(budget.remaining))
                            : "On track"}
                        </span>
                      </div>
                    </div>

                    {budget.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {budget.description}
                      </p>
                    )}
                  </div>

                  {showEditButtons && (
                    <div className="flex space-x-2 md:self-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBudget(budget)}
                        className="whitespace-nowrap"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 whitespace-nowrap"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // ========== SINGLE FINAL RETURN ==========

  return (
    <>
      {userCanViewBudgets ? mainContent : accessDeniedCard}
      <ConfirmDialog
        isOpen={confirmState?.open ?? false}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmState?.onConfirm ?? (() => {})}
        onCancel={() => setConfirmState(null)}
      />
    </>
  );
};

export default BudgetList;
