// pages/Dashboard.tsx - FIXED VERSION
import { useState, useEffect } from "react";
import { EnhancedDashboard } from "../components/dashboard/EnhancedDashboard";
import { expenseAPI, type Expense } from "../services/expenseAPI";
import { useCompany } from "../contexts/CompanyContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [company]);

  if (!company) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          Please select a company to view dashboard
        </h2>
        <p className="text-gray-500 dark:text-gray-500">
          Use the company selector in the user menu to select a company
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Header - Clean without Add Expense button */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analytics for{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {company.name}
            </span>
          </p>
        </div>
      </div>

      {/* Dashboard Stats Only */}
      <EnhancedDashboard expenses={expenses} loading={loading} />

      {/* Quick Action Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Expense Action */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-lg">
                  💰
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Expense Management
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {expenses.length > 0
                ? `You have ${expenses.length} expenses recorded`
                : "Start tracking your business expenses"}
            </p>
            <button
              onClick={() => navigate("/expenses")}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              {expenses.length > 0 ? "View All Expenses" : "Add First Expense"}
            </button>
          </div>

          {/* Budgets Quick Action */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-lg">
                  📊
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Budget Planning
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Set and track budgets against your actual spending
            </p>
            <button
              onClick={() => navigate("/budgets")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Manage Budgets
            </button>
          </div>

          {/* Analytics Quick Action */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-lg">
                  📈
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Advanced Analytics
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Deep insights into spending patterns and trends
            </p>
            <button
              onClick={() => navigate("/analytics")}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              View Analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
