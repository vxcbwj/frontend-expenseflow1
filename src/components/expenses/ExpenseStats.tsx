import React from "react";
import { type Expense } from "../../services/expenseAPI";

interface ExpenseStatsProps {
  expenses: Expense[];
}

const ExpenseStats: React.FC<ExpenseStatsProps> = ({ expenses }) => {
  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate this month's expenses
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

  // Calculate spending by category
  const categorySpending = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Find top spending category
  const topCategory = Object.entries(categorySpending).reduce(
    (max, [category, amount]) =>
      amount > max.amount ? { category, amount } : max,
    { category: "", amount: 0 }
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-accent-2 dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No expense data to show yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Spent Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <span className="text-blue-600 dark:text-blue-300 text-2xl">
              💰
            </span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Spent
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>
      </div>

      {/* This Month Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <span className="text-green-600 dark:text-green-300 text-2xl">
              📅
            </span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Month
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(thisMonthExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <span className="text-purple-600 dark:text-purple-300 text-2xl">
              📊
            </span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {expenses.length}
            </p>
          </div>
        </div>
      </div>

      {/* Top Category Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
        <div className="flex items-center">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <span className="text-orange-600 dark:text-orange-300 text-2xl">
              ⭐
            </span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Top Category
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {topCategory.category || "N/A"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatCurrency(topCategory.amount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;
