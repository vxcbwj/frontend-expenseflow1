import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CategoryBreakdown as CategoryBreakdownType } from "../../services/analyticsAPI";

// Renamed the prop interface to avoid conflict
interface CategoryBreakdownProps {
  data: CategoryBreakdownType[];
}

// Renamed the component to avoid duplicate identifier
const CategoryBreakdownComponent: React.FC<CategoryBreakdownProps> = ({
  data,
}) => {
  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get category configuration
  const getCategoryConfig = (category: string) => {
    const config: {
      [key: string]: {
        color: string;
        bgColor: string;
        icon: string;
        darkColor: string;
        progressColor: string;
      };
    } = {
      "Office Supplies": {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        darkColor: "dark:text-blue-300",
        progressColor: "bg-blue-500",
        icon: "📎",
      },
      Software: {
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        darkColor: "dark:text-purple-300",
        progressColor: "bg-purple-500",
        icon: "💻",
      },
      Hardware: {
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        darkColor: "dark:text-gray-300",
        progressColor: "bg-gray-500",
        icon: "🖥️",
      },
      Travel: {
        color: "text-cyan-700",
        bgColor: "bg-cyan-100",
        darkColor: "dark:text-cyan-300",
        progressColor: "bg-cyan-500",
        icon: "✈️",
      },
      "Meals & Entertainment": {
        color: "text-pink-700",
        bgColor: "bg-pink-100",
        darkColor: "dark:text-pink-300",
        progressColor: "bg-pink-500",
        icon: "🍽️",
      },
      Marketing: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        darkColor: "dark:text-green-300",
        progressColor: "bg-green-500",
        icon: "📢",
      },
      Utilities: {
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
        darkColor: "dark:text-yellow-300",
        progressColor: "bg-yellow-500",
        icon: "⚡",
      },
      Rent: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        darkColor: "dark:text-red-300",
        progressColor: "bg-red-500",
        icon: "🏠",
      },
      Salaries: {
        color: "text-orange-700",
        bgColor: "bg-orange-100",
        darkColor: "dark:text-orange-300",
        progressColor: "bg-orange-500",
        icon: "💰",
      },
      Consulting: {
        color: "text-indigo-700",
        bgColor: "bg-indigo-100",
        darkColor: "dark:text-indigo-300",
        progressColor: "bg-indigo-500",
        icon: "👔",
      },
      Insurance: {
        color: "text-teal-700",
        bgColor: "bg-teal-100",
        darkColor: "dark:text-teal-300",
        progressColor: "bg-teal-500",
        icon: "🛡️",
      },
      Training: {
        color: "text-emerald-700",
        bgColor: "bg-emerald-100",
        darkColor: "dark:text-emerald-300",
        progressColor: "bg-emerald-500",
        icon: "🎓",
      },
      Maintenance: {
        color: "text-lime-700",
        bgColor: "bg-lime-100",
        darkColor: "dark:text-lime-300",
        progressColor: "bg-lime-500",
        icon: "🔧",
      },
      Shipping: {
        color: "text-amber-700",
        bgColor: "bg-amber-100",
        darkColor: "dark:text-amber-300",
        progressColor: "bg-amber-500",
        icon: "🚚",
      },
      Advertising: {
        color: "text-rose-700",
        bgColor: "bg-rose-100",
        darkColor: "dark:text-rose-300",
        progressColor: "bg-rose-500",
        icon: "📺",
      },
      Legal: {
        color: "text-violet-700",
        bgColor: "bg-violet-100",
        darkColor: "dark:text-violet-300",
        progressColor: "bg-violet-500",
        icon: "⚖️",
      },
      Taxes: {
        color: "text-fuchsia-700",
        bgColor: "bg-fuchsia-100",
        darkColor: "dark:text-fuchsia-300",
        progressColor: "bg-fuchsia-500",
        icon: "🧾",
      },
      Other: {
        color: "text-slate-700",
        bgColor: "bg-slate-100",
        darkColor: "dark:text-slate-300",
        progressColor: "bg-slate-500",
        icon: "📋",
      },
    };

    return config[category] || config.Other;
  };

  // Calculate total amount for percentage calculations
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  // Sort by amount (highest first)
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* Main Category Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">🏷️</span>
            Category Breakdown
            <Badge variant="secondary" className="ml-2">
              {data.length} categories
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedData.map((category, index) => {
              const config = getCategoryConfig(category.category);
              const percentage =
                category.percentage ||
                (totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0);

              return (
                <div key={category.category} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="secondary"
                        className={`${config.bgColor} ${config.color} ${config.darkColor} font-medium`}
                      >
                        {config.icon} {category.category}
                      </Badge>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {category.count}{" "}
                        {category.count === 1 ? "expense" : "expenses"}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <Progress value={percentage} className="h-3" />
                    <div
                      className={`absolute top-0 left-0 h-3 rounded-full ${config.progressColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="text-center">
                      <div className="font-semibold">Avg/Expense</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(category.average || 0)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">Count</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {category.count}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">Share</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Separator */}
                  {index < sortedData.length - 1 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spending Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Spending
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Category Card */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              {sortedData.length > 0 ? (
                <>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {sortedData[0].category}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {((sortedData[0].amount / totalAmount) * 100).toFixed(1)}%
                    of total
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">No data</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Categories
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">💡</span>
            Category Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Highest Average Expense */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="mr-2">📈</span>
                Highest Average Expense
              </h4>
              {sortedData.length > 0 ? (
                (() => {
                  const highestAvg = [...sortedData].sort(
                    (a, b) => (b.average || 0) - (a.average || 0)
                  )[0];
                  const config = getCategoryConfig(highestAvg.category);
                  return (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className={config.color}>{config.icon}</span>
                        <span className="font-medium">
                          {highestAvg.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(highestAvg.average || 0)}
                        </div>
                        <div className="text-xs text-gray-500">per expense</div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-gray-500 text-sm">No data available</div>
              )}
            </div>

            {/* Most Frequent Category */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="mr-2">🔄</span>
                Most Frequent Category
              </h4>
              {sortedData.length > 0 ? (
                (() => {
                  const mostFrequent = [...sortedData].sort(
                    (a, b) => b.count - a.count
                  )[0];
                  const config = getCategoryConfig(mostFrequent.category);
                  return (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className={config.color}>{config.icon}</span>
                        <span className="font-medium">
                          {mostFrequent.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {mostFrequent.count}
                        </div>
                        <div className="text-xs text-gray-500">expenses</div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-gray-500 text-sm">No data available</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryBreakdownComponent;
