// pages/ExpenseListPage.tsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useCompany } from "../contexts/CompanyContext";
import { expenseAPI, type Expense } from "../services/expenseAPI";
import ExpenseList from "../components/expenses/ExpenseList";
import ExpenseForm from "../components/expenses/ExpenseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermissions } from "../hooks/userPermissions";

const ExpenseListPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { canManageExpenses } = usePermissions();

  const { company } = useCompany();

  const fetchExpenses = async () => {
    if (!company) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await expenseAPI.getExpenses(company.id);

      // ✅ FIXED: Handle response properly
      if (response.success) {
        setExpenses(response.expenses);
      }
    } catch (err: any) {
      setError("Failed to load expenses");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [company]);

  const handleExpenseAdded = () => {
    fetchExpenses();
    setShowForm(false);
  };

  const handleExpenseUpdated = () => {
    fetchExpenses();
  };

  if (!company) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          Please select a company to view expenses
        </h2>
        <p className="text-gray-500 dark:text-gray-500">
          Use the company selector in the user menu to select a company
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Expense Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage expenses for{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {company.name}
            </span>
          </p>
        </div>
        {canManageExpenses() && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-800 hover:bg-blue-700"
          >
            {showForm ? <>✕ Cancel</> : <>＋ Add Expense</>}
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => setError("")}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Add Expense Form */}
      {/* ✅ FIXED: Removed argument from canManageExpenses() */}
      {showForm && canManageExpenses() && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">💰</span>
              Add New Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {!loading && expenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {expenses.length}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Total Expenses
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    expenses.reduce((sum, expense) => sum + expense.amount, 0),
                  )}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Total Spent
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    expenses.length > 0
                      ? expenses.reduce(
                          (sum, expense) => sum + expense.amount,
                          0,
                        ) / expenses.length
                      : 0,
                  )}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Average Expense
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {new Date().getMonth() + 1}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  Current Month
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
        onExpenseUpdated={handleExpenseUpdated}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && expenses.length === 0 && !showForm && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Expenses Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking your business expenses to get insights into your
              spending
            </p>
            {/* ✅ FIXED: Removed argument from canManageExpenses() */}
            {canManageExpenses() && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-800 hover:bg-blue-700"
              >
                Add Your First Expense
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseListPage;
