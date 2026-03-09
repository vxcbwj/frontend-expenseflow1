import React from "react";
// import from the ui folder
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { type Expense } from "../../services/expenseAPI";
import {
  TrendingUp,
  Calendar,
  FileText,
  Star,
  DollarSign,
  ArrowUpRight,
  Clock,
  Layers,
  Zap,
  Droplets,
  Wifi,
  Home,
  Package,
  Users,
  Megaphone,
  Truck,
  MoreHorizontal,
} from "lucide-react";

interface EnhancedDashboardProps {
  expenses: Expense[];
  loading?: boolean;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  expenses,
  loading = false,
}) => {
  // Calculate statistics
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const navigate = useNavigate();
  const thisMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const categorySpending = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categorySpending).reduce(
    (max, [category, amount]) =>
      amount > max.amount ? { category, amount } : max,
    { category: "", amount: 0 }
  );

  // Calculate month-over-month change if available
  const lastMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        expenseDate.getMonth() === lastMonth.getMonth() &&
        expenseDate.getFullYear() === lastMonth.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const monthlyChange =
    lastMonthExpenses > 0
      ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Enhanced category icons and colors
  const getCategoryConfig = (category: string) => {
    const configs: {
      [key: string]: {
        icon: React.ReactNode;
        color: string;
        bgColor: string;
        borderColor: string;
        progressColor: string;
      };
    } = {
      electricity: {
        icon: <Zap className="h-4 w-4" />,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/30",
        borderColor: "border-blue-200 dark:border-blue-800",
        progressColor: "bg-blue-500",
      },
      water: {
        icon: <Droplets className="h-4 w-4" />,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-50 dark:bg-cyan-900/30",
        borderColor: "border-cyan-200 dark:border-cyan-800",
        progressColor: "bg-cyan-500",
      },
      internet: {
        icon: <Wifi className="h-4 w-4" />,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-900/30",
        borderColor: "border-purple-200 dark:border-purple-800",
        progressColor: "bg-purple-500",
      },
      rent: {
        icon: <Home className="h-4 w-4" />,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/30",
        borderColor: "border-red-200 dark:border-red-800",
        progressColor: "bg-red-500",
      },
      supplies: {
        icon: <Package className="h-4 w-4" />,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/30",
        borderColor: "border-green-200 dark:border-green-800",
        progressColor: "bg-green-500",
      },
      salaries: {
        icon: <Users className="h-4 w-4" />,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/30",
        borderColor: "border-orange-200 dark:border-orange-800",
        progressColor: "bg-orange-500",
      },
      marketing: {
        icon: <Megaphone className="h-4 w-4" />,
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-50 dark:bg-pink-900/30",
        borderColor: "border-pink-200 dark:border-pink-800",
        progressColor: "bg-pink-500",
      },
      transportation: {
        icon: <Truck className="h-4 w-4" />,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
        borderColor: "border-indigo-200 dark:border-indigo-800",
        progressColor: "bg-indigo-500",
      },
      other: {
        icon: <MoreHorizontal className="h-4 w-4" />,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-900/30",
        borderColor: "border-gray-200 dark:border-gray-800",
        progressColor: "bg-gray-500",
      },
    };

    return configs[category] || configs.other;
  };

  // Custom Progress component wrapper to handle custom colors
  const CustomProgress = ({
    value,
    color,
  }: {
    value: number;
    color: string;
  }) => {
    return (
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${value}%`,
            backgroundColor:
              color === "bg-blue-500"
                ? "#3b82f6"
                : color === "bg-cyan-500"
                ? "#06b6d4"
                : color === "bg-purple-500"
                ? "#8b5cf6"
                : color === "bg-red-500"
                ? "#ef4444"
                : color === "bg-green-500"
                ? "#10b981"
                : color === "bg-orange-500"
                ? "#f97316"
                : color === "bg-pink-500"
                ? "#ec4899"
                : color === "bg-indigo-500"
                ? "#6366f1"
                : "#6b7280", // gray-500
          }}
        />
      </div>
    );
  };

  // Sort categories by amount for consistent rendering
  const sortedCategories = Object.entries(categorySpending).sort(
    ([, a], [, b]) => b - a
  );

  // Get recent expenses (max 5)
  const recentExpenses = expenses.slice(0, 5);

  // Show skeletons cards while data is loading
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" key="enhanced-dashboard-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={`skeleton-card-${i}`} className="space-y-3">
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // When there's no data yet
  if (expenses.length === 0) {
    return (
      <Card key="no-data-card" className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No expenses yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start tracking your expenses to see insights here
              </p>
            </div>
            <Button className="mt-4">Add Your First Expense</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" key="enhanced-dashboard-content">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Spent */}
        <Card key="total-spent-card" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-12 translate-x-12" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All-time spending across {expenses.length} expenses
            </p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card key="this-month-card" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-12 translate-x-12" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold tracking-tight">
                {formatCurrency(thisMonthExpenses)}
              </div>
              {monthlyChange !== 0 && (
                <Badge
                  variant={monthlyChange > 0 ? "destructive" : "default"}
                  className="flex items-center gap-1"
                >
                  <TrendingUp
                    className={`h-3 w-3 ${
                      monthlyChange > 0 ? "rotate-0" : "rotate-180"
                    }`}
                  />
                  {Math.abs(monthlyChange).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Current month spending
              {lastMonthExpenses > 0 && (
                <span className="block text-xs">
                  {monthlyChange > 0 ? "Up" : "Down"} from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card key="total-expenses-card" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-12 translate-x-12" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {expenses.length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total number of expenses tracked
            </p>
          </CardContent>
        </Card>

        {/* Top Category */}
        <Card key="top-category-card" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -translate-y-12 translate-x-12" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Category
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Star className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {topCategory.category ? (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      getCategoryConfig(topCategory.category).bgColor
                    }`}
                  >
                    {getCategoryConfig(topCategory.category).icon}
                  </div>
                  <div>
                    <div className="text-xl font-bold capitalize">
                      {topCategory.category}
                    </div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(topCategory.amount)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Highest spending category
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No category data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <Card key="category-breakdown-card" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedCategories.map(([category, amount]) => {
                const percentage =
                  totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                const categoryConfig = getCategoryConfig(category);

                return (
                  <div key={`category-${category}`} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${categoryConfig.bgColor}`}
                        >
                          {categoryConfig.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">
                              {category}
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}% of total
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {((amount / totalSpent) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CustomProgress
                      value={percentage}
                      color={categoryConfig.progressColor}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses Preview - Table Version */}
        <Card key="recent-expenses-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-1 font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="text-left py-2 px-1 font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="text-left py-2 px-1 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-2 px-1 font-medium text-muted-foreground">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((expense) => {
                    const categoryConfig = getCategoryConfig(expense.category);
                    const date = new Date(expense.date);
                    const formattedDate = date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <tr
                        key={`recent-expense-${expense.id}`}
                        className="border-b hover:bg-muted/50"
                      >
                        <td
                          className="py-3 px-1 max-w-[150px] truncate"
                          title={expense.description}
                        >
                          {expense.description}
                        </td>
                        <td className="py-3 px-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1 rounded ${categoryConfig.bgColor}`}
                            >
                              {categoryConfig.icon}
                            </div>
                            <span className="text-xs capitalize truncate max-w-[80px]">
                              {expense.category}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-1 text-muted-foreground text-xs">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-1 font-medium whitespace-nowrap">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {expenses.length > 5 && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full group"
                  size="sm"
                  onClick={() => navigate("/expenses")} // Add this onClick
                >
                  <span>View All Expenses</span>
                  <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
