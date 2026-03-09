// pages/BudgetPage.tsx - HYBRID VERSION (Working permissions + Better UI)
import React, { useState, useEffect, useCallback } from "react";
import { useCompany } from "../contexts/CompanyContext";
import { budgetAPI, type Budget } from "../services/budgetsAPI";
import BudgetList from "../components/budget/BudgetList";
import BudgetForm from "../components/budget/BudgetForm";
import CompanySelector from "../components/company/CompanySelector";
import { usePermissions } from "../hooks/userPermissions";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Building,
  Shield,
  RefreshCw,
  AlertCircle,
  PlusCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Activity,
} from "lucide-react";

const BudgetPage: React.FC = () => {
  const { company } = useCompany();
  const { user } = useAuth();
  const { canViewBudgets, canManageBudgets } = usePermissions();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ========== HYBRID PERMISSION SYSTEM ==========
  // Use hooks for permissions (this is what works)
  const canAccessBudgets = canViewBudgets();
  const canCreateBudgets = canManageBudgets();

  // Keep direct checks for debugging/fallback
  const userRole = user?.globalRole || user?.role || "member";

  const fetchBudgets = useCallback(async () => {
    if (!company) {
      setLoading(false);
      setError("Please select a company to view budgets");
      return;
    }

    try {
      setError(null);
      const response = await budgetAPI.getBudgets(company.id);

      if (response.success) {
        setBudgets(response.budgets || []);
      } else {
        console.error("Budgets API error:", response);
        setError(response.message || "Failed to load budgets");
      }
    } catch (err: any) {
      console.error("Budgets fetch error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [company]);

  // Initial fetch
  useEffect(() => {
    if (company && canAccessBudgets) {
      setLoading(true);
      fetchBudgets();
    }
  }, [company, canAccessBudgets, fetchBudgets]);

  const handleBudgetCreated = () => {
    fetchBudgets();
    setShowForm(false);
  };

  const handleBudgetUpdated = () => {
    fetchBudgets();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBudgets();
  };

  // Calculate budget statistics
  const activeBudgets = budgets.filter((b) => b.isActive).length;
  const totalBudgetAmount = budgets.reduce(
    (sum, budget) => sum + budget.amount,
    0,
  );
  const averageBudget =
    budgets.length > 0 ? totalBudgetAmount / budgets.length : 0;

  // ========== PERMISSION DENIED VIEW ==========
  if (!canAccessBudgets) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-900/10 flex items-center justify-center">
              <Shield className="h-10 w-10 text-red-500 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              Access Restricted
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You don't have permission to view budgets.
            </p>

            <div className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Your Role
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
                    {userRole || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Hook Result
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      canViewBudgets()
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    canViewBudgets(): {canViewBudgets() ? "TRUE" : "FALSE"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Required Roles
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400 text-sm text-right">
                    company_owner
                    <br />
                    company_admin
                    <br />
                    super_admin
                    <br />
                    member
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
              {!company && (
                <Button
                  onClick={() => (window.location.href = "/companies")}
                  className="w-full"
                >
                  <Building className="mr-2 h-4 w-4" />
                  Select Company
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== NO COMPANY SELECTED VIEW ==========
  if (!company) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/10">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10 flex items-center justify-center">
              <DollarSign className="h-10 w-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-3">
              Budget Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please select a company to manage budgets.
            </p>
            <CompanySelector />
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>
                Your role: <span className="font-medium">{userRole}</span>
              </p>
              <p>
                Access granted:{" "}
                <span className="font-medium text-green-600">Yes</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== MAIN BUDGET MANAGEMENT VIEW ==========
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Budget Management
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Building className="h-4 w-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {company.name}
                  </span>
                  {company.industry && (
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      • {company.industry}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Role and Permission Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                userRole.toLowerCase() === "super_admin"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : userRole.toLowerCase() === "company_owner"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : userRole.toLowerCase() === "company_admin"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
              }`}
            >
              <Shield className="h-3 w-3" />
              {userRole.replace("_", " ")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading || refreshing}
            className="gap-2"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <CompanySelector />
        </div>
      </div>
      {/* Permission Status */}
      <div className="bg-green-50 border border-green-200 dark:border-green-800 dark:bg-green-900/10 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-800 dark:text-green-300">
            Access Granted ✓
          </span>
        </div>
        <div className="text-sm text-green-700 dark:text-green-400">
          User role: <span className="font-bold">{userRole}</span> • Can view
          budgets: <span className="font-bold">Yes</span> • Can create budgets:{" "}
          <span className="font-bold">{canCreateBudgets ? "Yes" : "No"}</span>
        </div>
      </div>
      {/* Budget Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {budgets.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  Total Budgets
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {activeBudgets}
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  Active Budgets
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  ${(totalBudgetAmount / 1000).toFixed(1)}k
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-300">
                  Total Amount
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                  ${(averageBudget / 1000).toFixed(1)}k
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-300">
                  Average Budget
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Stats and Actions Bar */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Budget Overview
                </h2>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>{budgets.length} total budgets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>{activeBudgets} active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span>{budgets.length - activeBudgets} inactive</span>
                </div>
              </div>
            </div>

            {canCreateBudgets && (
              <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                {showForm ? (
                  <>
                    <XCircle className="h-4 w-4" />
                    Cancel Creation
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    Create New Budget
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Error Display */}
      {error && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                  Error Loading Budgets
                </h3>
                <p className="text-red-600 dark:text-red-400 text-sm mb-3">
                  {error}
                </p>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Budget Form */}
      {canCreateBudgets && showForm && (
        <div className="animate-slideDown">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10">
                  <PlusCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Budget
                </h2>
              </div>
              <BudgetForm
                onBudgetCreated={handleBudgetCreated}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
      {/* Budget List */}
      {(!showForm || !canCreateBudgets) && (
        <div className={showForm ? "opacity-50 pointer-events-none" : ""}>
          <BudgetList
            budgets={budgets}
            loading={loading}
            onBudgetUpdated={handleBudgetUpdated}
            canEdit={canCreateBudgets}
          />
        </div>
      )}

      {/* Empty State - Only show when no budgets AND user can create budgets */}
      {!loading &&
        !error &&
        budgets.length === 0 &&
        !showForm &&
        canCreateBudgets && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <DollarSign className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                No Budgets Configured
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                You haven't created any budgets for{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {company.name}
                </span>{" "}
                yet.
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        )}
      {/* For Members when no budgets exist - Show a different message */}
      {!loading &&
        !error &&
        budgets.length === 0 &&
        !showForm &&
        !canCreateBudgets && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Budgets Available
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
                No budgets have been configured for{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {company.name}
                </span>{" "}
                yet.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contact your company admin to create budgets
              </p>
            </CardContent>
          </Card>
        )}
      {/* Debug Info - Only in development */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-dashed border-gray-300 dark:border-gray-700 mt-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Debug Information
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                className="text-xs h-7"
              >
                Log to Console
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">Role</div>
                <div className="font-medium">{userRole}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">
                  View Access
                </div>
                <div
                  className={`font-medium ${
                    canAccessBudgets ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {canAccessBudgets ? "Yes" : "No"}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">
                  Create Access
                </div>
                <div
                  className={`font-medium ${
                    canCreateBudgets ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {canCreateBudgets ? "Yes" : "No"}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">Budgets</div>
                <div className="font-medium">{budgets.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetPage;
