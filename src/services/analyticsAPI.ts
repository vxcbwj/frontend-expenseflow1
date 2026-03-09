// services/analyticsAPI.ts
import api from "./api";

export interface OverviewData {
  totalSpent: number;
  totalExpenses: number;
  monthlyAverage: number;
  largestExpense: number;
  topCategory: string;
  topCategoryAmount: number;
  averageExpense: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  average: number;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
  count: number;
  monthKey: string;
}

export interface AnalyticsFilters {
  dateRange?: string; // "30days" | "3months" | "6months" | "custom"
  companyId?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
}

export const analyticsAPI = {
  // Get overview metrics
  getOverview: async (
    filters?: AnalyticsFilters,
  ): Promise<{
    success: boolean;
    data: OverviewData;
  }> => {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append("companyId", filters.companyId);
    if (filters?.dateRange) params.append("dateRange", filters.dateRange);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(`/analytics/overview?${params.toString()}`);
    return response.data;
  },

  // Get category breakdown
  getCategories: async (
    filters?: AnalyticsFilters,
  ): Promise<{
    success: boolean;
    data: CategoryBreakdown[];
  }> => {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append("companyId", filters.companyId);
    if (filters?.dateRange) params.append("dateRange", filters.dateRange);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/analytics/categories?${params.toString()}`,
    );
    return response.data;
  },

  // Get monthly trends
  getTrends: async (
    filters?: AnalyticsFilters,
  ): Promise<{
    success: boolean;
    data: MonthlyTrend[];
  }> => {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append("companyId", filters.companyId);
    if (filters?.dateRange) params.append("dateRange", filters.dateRange);
    if (filters?.department) params.append("department", filters.department);
    params.append("months", "6"); // Default to 6 months for trends

    const response = await api.get(`/analytics/trends?${params.toString()}`);
    return response.data;
  },
};
