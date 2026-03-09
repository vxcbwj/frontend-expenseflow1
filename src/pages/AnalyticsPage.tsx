// pages/AnalyticsPage.tsx - MODERN UI UPGRADE
import React, { useState, useEffect, useCallback } from "react";
import { useCompany } from "../contexts/CompanyContext";
import {
  analyticsAPI,
  type OverviewData,
  type CategoryBreakdown,
  type MonthlyTrend,
  type AnalyticsFilters,
} from "../services/analyticsAPI";
import AnalyticsOverview from "../components/Analytics/AnalyticsOverview";
import CategoryBreakdownComponent from "../components/Analytics/CategoryBreakdown";
import SpendingTrends from "../components/Analytics/SpendingTrends";
import AnalyticsFiltersPanel from "../components/Analytics/AnalyticsFiltersPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermissions } from "../hooks/userPermissions";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Building,
  Shield,
  RefreshCw,
  AlertCircle,
  Download,
  Filter,
} from "lucide-react";

const AnalyticsPage: React.FC = () => {
  const { company } = useCompany();
  const { user } = useAuth();
  const { canViewAnalytics } = usePermissions();

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "categories" | "trends"
  >("overview");

  // Default filters - last 3 months
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: "3months",
    companyId: company?.id,
  });

  // Permission check
  const userRole = user?.globalRole || user?.role;
  const isCompanyOwner = userRole?.toLowerCase() === "company_owner";
  const isCompanyAdmin = userRole?.toLowerCase() === "company_admin";

  const canAccessAnalytics = React.useMemo(() => {
    return (
      isCompanyOwner ||
      isCompanyAdmin ||
      userRole?.toLowerCase() === "super_admin" ||
      canViewAnalytics()
    );
  }, [isCompanyOwner, isCompanyAdmin, userRole, canViewAnalytics]);

  const fetchAnalytics = useCallback(async () => {
    if (!company) {
      setLoading(false);
      setError("Please select a company to view analytics");
      return;
    }

    try {
      setError(null);
      const updatedFilters = {
        ...filters,
        companyId: company.id,
      };

      const [overviewRes, categoriesRes, trendsRes] = await Promise.all([
        analyticsAPI.getOverview(updatedFilters),
        analyticsAPI.getCategories(updatedFilters),
        analyticsAPI.getTrends(updatedFilters),
      ]);

      // Handle responses
      if (overviewRes.success) {
        setOverview(overviewRes.data);
      } else {
        console.error("Overview API error:", overviewRes);
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      } else {
        console.error("Categories API error:", categoriesRes);
      }

      if (trendsRes.success) {
        setTrends(trendsRes.data);
      } else {
        console.error("Trends API error:", trendsRes);
      }

      // Check if all requests failed
      if (
        !overviewRes.success &&
        !categoriesRes.success &&
        !trendsRes.success
      ) {
        setError("Failed to load analytics data. Please try again.");
      }
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [company, filters]);

  // Initial fetch
  useEffect(() => {
    if (company && canAccessAnalytics) {
      setLoading(true);
      fetchAnalytics();
    }
  }, [company, canAccessAnalytics, fetchAnalytics]);

  const handleFiltersChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchAnalytics();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleExportData = () => {
    // Export functionality placeholder
    console.log("Exporting analytics data...");
  };

  // ========== PERMISSION DENIED VIEW ==========
  if (!canAccessAnalytics) {
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
              You don't have permission to view analytics in this company.
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
                    Current Company
                  </span>
                  <span className="font-medium truncate max-w-[150px]">
                    {company?.name || "None selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Required Permission
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    VIEW_ANALYTICS
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
              <Building className="h-10 w-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-3">
              Select a Company
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please select a company to view analytics data.
            </p>
            <Button
              onClick={() => (window.location.href = "/companies")}
              className="w-full"
            >
              <Building className="mr-2 h-4 w-4" />
              Browse Companies
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== MAIN ANALYTICS DASHBOARD ==========
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Analytics Dashboard
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

          {/* Role Badge */}
          {userRole && (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                userRole.toLowerCase() === "super_admin"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : userRole.toLowerCase() === "company_owner"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
              }`}
            >
              <Shield className="h-3 w-3" />
              {userRole.replace("_", " ")}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
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
        </div>
      </div>

      {/* Filters Panel */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h2>
          </div>
          <AnalyticsFiltersPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                  Error Loading Data
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

      {/* Tab Navigation */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-6 text-center font-medium transition-all duration-300 flex flex-col items-center gap-2 ${
                activeTab === "overview"
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <BarChart3
                className={`h-5 w-5 ${
                  activeTab === "overview" ? "text-white" : "text-gray-400"
                }`}
              />
              <span className="text-sm font-medium">Overview</span>
              {activeTab === "overview" && (
                <div className="h-1 w-12 bg-white rounded-full mt-1"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-4 px-6 text-center font-medium transition-all duration-300 flex flex-col items-center gap-2 ${
                activeTab === "categories"
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <PieChart
                className={`h-5 w-5 ${
                  activeTab === "categories" ? "text-white" : "text-gray-400"
                }`}
              />
              <span className="text-sm font-medium">Categories</span>
              {activeTab === "categories" && (
                <div className="h-1 w-12 bg-white rounded-full mt-1"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`py-4 px-6 text-center font-medium transition-all duration-300 flex flex-col items-center gap-2 ${
                activeTab === "trends"
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <TrendingUp
                className={`h-5 w-5 ${
                  activeTab === "trends" ? "text-white" : "text-gray-400"
                }`}
              />
              <span className="text-sm font-medium">Trends</span>
              {activeTab === "trends" && (
                <div className="h-1 w-12 bg-white rounded-full mt-1"></div>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="animate-fadeIn">
        {loading ? (
          <div className="space-y-6">
            <div className="h-48 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-xl"></div>
              <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-xl"></div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "overview" &&
              (overview ? (
                <AnalyticsOverview data={overview} />
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Overview Data
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      No overview data available for the selected period. Try
                      adjusting your filters.
                    </p>
                  </CardContent>
                </Card>
              ))}

            {activeTab === "categories" &&
              (categories.length > 0 ? (
                <CategoryBreakdownComponent data={categories} />
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <PieChart className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Category Data
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      No category data available for the selected period. Try
                      adjusting your filters.
                    </p>
                  </CardContent>
                </Card>
              ))}

            {activeTab === "trends" &&
              (trends.length > 0 ? (
                <SpendingTrends data={trends} />
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Trend Data
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      No trend data available for the selected period. Try
                      adjusting your filters.
                    </p>
                  </CardContent>
                </Card>
              ))}
          </>
        )}
      </div>

      {/* Data Summary Footer */}
      {!loading &&
        !error &&
        (overview || categories.length > 0 || trends.length > 0) && (
          <div className="flex flex-wrap gap-3 justify-center">
            {overview && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-sm">
                <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <BarChart3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Period:{" "}
                  <span className="font-medium">
                    {filters.dateRange || "Custom"}
                  </span>
                </span>
              </div>
            )}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-sm">
                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30">
                  <PieChart className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {categories.length} categories
                </span>
              </div>
            )}
            {trends.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-sm">
                <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {trends.length} months analyzed
                </span>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default AnalyticsPage;
