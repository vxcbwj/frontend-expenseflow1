import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonthlyTrend } from "../../services/analyticsAPI";
import { useCompany } from "../../contexts/CompanyContext";
import { formatCurrency } from "../../utils/formatCurrency";

interface SpendingTrendsProps {
  data: MonthlyTrend[];
}

const SpendingTrends: React.FC<SpendingTrendsProps> = ({ data }) => {
  const { company } = useCompany();
  // Format compact currency for tooltips
  const formatCompactCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: company?.currency || "DZD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  // Calculate max amount for scaling
  const maxAmount =
    data.length > 0 ? Math.max(...data.map((item) => item.amount)) : 0;

  // Get bar color based on amount (gradient from blue to purple)
  const getBarColor = (amount: number) => {
    if (maxAmount === 0) return "bg-blue-500";

    const percentage = amount / maxAmount;

    // Color gradient based on percentage
    if (percentage > 0.8) return "bg-purple-500 hover:bg-purple-600";
    if (percentage > 0.6) return "bg-blue-600 hover:bg-blue-700";
    if (percentage > 0.4) return "bg-blue-500 hover:bg-blue-600";
    if (percentage > 0.2) return "bg-cyan-500 hover:bg-cyan-600";
    return "bg-cyan-400 hover:bg-cyan-500";
  };

  // Calculate trends
  const calculateTrends = () => {
    if (data.length < 2) return null;

    const recent = data[data.length - 1].amount;
    const previous = data[data.length - 2].amount;

    const change = recent - previous;
    const percentage = previous > 0 ? (change / previous) * 100 : 0;

    return {
      change,
      percentage: Math.abs(percentage),
      isPositive: change > 0,
      recent,
      previous,
    };
  };

  const trends = calculateTrends();

  return (
    <div className="space-y-6">
      {/* Main Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center">
              <span className="mr-2">📈</span>
              Monthly Spending Trends
              <Badge variant="secondary" className="ml-2">
                {data.length} months
              </Badge>
            </CardTitle>

            {trends && (
              <div
                className={`flex items-center space-x-2 mt-2 sm:mt-0 ${
                  trends.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <span>{trends.isPositive ? "📈" : "📉"}</span>
                <span className="font-semibold">
                  {trends.isPositive ? "+" : ""}
                  {formatCurrency(trends.change)}
                </span>
                <span className="text-sm">
                  ({trends.isPositive ? "+" : ""}
                  {trends.percentage.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <p>No trend data available</p>
              <p className="text-sm">Add expenses to see spending trends</p>
            </div>
          ) : (
            <>
              {/* Bar Chart */}
              <div className="mb-8">
                <div className="flex items-end justify-between space-x-2 h-48 pb-8 border-b border-gray-200 dark:border-gray-700">
                  {data.map((month) => {
                    const barHeight =
                      maxAmount > 0 ? (month.amount / maxAmount) * 80 : 0;
                    const barColor = getBarColor(month.amount);

                    return (
                      <div
                        key={month.monthKey}
                        className="flex flex-col items-center flex-1 group relative"
                      >
                        {/* Bar */}
                        <div
                          className={`w-full max-w-16 rounded-t-lg transition-all duration-500 ease-out ${barColor} shadow-sm hover:shadow-md cursor-pointer`}
                          style={{ height: `${barHeight}%` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              <div className="font-semibold">{month.month}</div>
                              <div>{formatCurrency(month.amount)}</div>
                              <div>{month.count} expenses</div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>

                        {/* Month Label */}
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                          {month.month.split(" ")[0]}
                        </div>

                        {/* Amount Label (shown on hover) */}
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          {formatCompactCurrency(month.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Y-axis labels */}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-2">
                  <span>$0</span>
                  <span>{formatCompactCurrency(maxAmount / 2)}</span>
                  <span>{formatCompactCurrency(maxAmount)}</span>
                </div>
              </div>

              {/* Monthly Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data
                  .slice(-6)
                  .reverse()
                  .map((month) => (
                    <div
                      key={month.monthKey}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {month.month}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {month.count}{" "}
                          {month.count === 1 ? "expense" : "expenses"}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(month.amount)}
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <span>
                          Avg:{" "}
                          {formatCurrency(
                            month.count > 0 ? month.amount / month.count : 0,
                          )}
                        </span>
                        <span>•</span>
                        <span>{month.count} items</span>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Trends Analysis Cards */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Highest Spending Month */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                {(() => {
                  const highestMonth = [...data].sort(
                    (a, b) => b.amount - a.amount,
                  )[0];
                  return (
                    <>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {highestMonth.month}
                      </div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                        {formatCurrency(highestMonth.amount)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Highest Spending
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {highestMonth.count} expenses
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Average Monthly Spending */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                {(() => {
                  const total = data.reduce(
                    (sum, month) => sum + month.amount,
                    0,
                  );
                  const average = data.length > 0 ? total / data.length : 0;
                  return (
                    <>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(average)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Monthly Average
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Over {data.length} months
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Insights */}
      {data.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">💡</span>
              Trend Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Trend */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Recent Performance
                </h4>
                {trends && (
                  <div
                    className={`p-4 rounded-lg ${
                      trends.isPositive
                        ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {trends.isPositive ? "Increased" : "Decreased"} by
                      </span>
                      <span className="font-bold">
                        {formatCurrency(Math.abs(trends.change))}
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      from {formatCurrency(trends.previous)} to{" "}
                      {formatCurrency(trends.recent)}
                    </div>
                  </div>
                )}
              </div>

              {/* Consistency Analysis */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Spending Consistency
                </h4>
                {(() => {
                  const amounts = data.map((month) => month.amount);
                  const average =
                    amounts.reduce((sum, amount) => sum + amount, 0) /
                    amounts.length;
                  const variance =
                    amounts.reduce(
                      (sum, amount) => sum + Math.pow(amount - average, 2),
                      0,
                    ) / amounts.length;
                  const consistency = Math.max(
                    0,
                    100 - (Math.sqrt(variance) / average) * 100,
                  );

                  return (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Consistency Score</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {consistency.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${consistency}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {consistency > 80
                          ? "Very consistent"
                          : consistency > 60
                            ? "Moderately consistent"
                            : "Variable spending"}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpendingTrends;
