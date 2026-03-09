import React from "react";
import { usePermissions } from "../../hooks/userPermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnalyticsFilters } from "../../services/analyticsAPI";

interface AnalyticsFiltersPanelProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onApplyFilters: () => void;
  loading: boolean;
}

const AnalyticsFiltersPanel: React.FC<AnalyticsFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  loading,
}) => {
  const { canViewAnalytics } = usePermissions();

  const dateRangeOptions = [
    { value: "30days", label: "Last 30 Days" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "12months", label: "Last 12 Months" },
  ];

  const handleDateRangeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onFiltersChange({
      ...filters,
      dateRange: event.target.value,
    });
  };

  // Get the current label for display
  const currentLabel =
    dateRangeOptions.find((opt) => opt.value === filters.dateRange)?.label ||
    "Select date range";

  if (!canViewAnalytics()) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <span className="mr-2">🔒</span>
            Analytics Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to view analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          ⚙️ Filters & Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Date Range Filter */}
            <div className="flex-1 space-y-2">
              <label
                htmlFor="date-range"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2"
              >
                Date Range
              </label>
              <select
                id="date-range"
                value={filters.dateRange || ""}
                onChange={handleDateRangeChange}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:placeholder:text-gray-400 appearance-none pr-8"
              >
                <option value="" disabled>
                  Select date range
                </option>
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex-1 space-y-2">
              <label
                htmlFor="department"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2"
              >
                Department
              </label>
              <select
                id="department"
                value={filters.department || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    department: e.target.value || undefined,
                  })
                }
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:placeholder:text-gray-400 appearance-none pr-8"
              >
                <option value="">All Departments</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Administration">Administration</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Apply Button */}
            <Button
              onClick={onApplyFilters}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <span className="mr-2">🚀</span>
              )}
              Apply Filters
            </Button>

            {/* Export Button (Placeholder for now) */}
            <Button variant="outline" disabled className="opacity-50">
              <span className="mr-2">📥</span>
              Export CSV
            </Button>
          </div>

          {/* Active Filters Info */}
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Showing data for:{" "}
              <span className="font-medium">{currentLabel}</span>
              {filters.department && (
                <span>
                  {" "}
                  • Department:{" "}
                  <span className="font-medium">{filters.department}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsFiltersPanel;
