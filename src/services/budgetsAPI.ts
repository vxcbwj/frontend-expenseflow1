// services/budgetAPI.ts
import api from "./api";

// Define what a Budget looks like
export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  name?: string;
  description?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetData {
  category: string;
  amount: number;
  period?: string;
  startDate?: string;
  endDate?: string;
  name?: string;
  description?: string;
  companyId: string;
}

export interface UpdateBudgetData {
  category?: string;
  amount?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Budget with spending progress
export interface BudgetWithProgress extends Budget {
  currentSpending: number;
  percentageUsed: number;
  remaining: number;
  status: "on_track" | "warning" | "exceeded";
}

export const budgetAPI = {
  // Get all budgets for user
  getBudgets: async (
    companyId?: string
  ): Promise<{
    success: boolean;
    message: string;
    count: number;
    budgets: Budget[];
  }> => {
    const url = companyId ? `/budgets?companyId=${companyId}` : "/budgets";
    const response = await api.get(url);
    return response.data;
  },

  // Create new budget
  createBudget: async (
    budgetData: CreateBudgetData
  ): Promise<{
    success: boolean;
    message: string;
    budget: Budget;
  }> => {
    const response = await api.post("/budgets", budgetData);
    return response.data;
  },

  // Update budget
  updateBudget: async (
    id: string,
    budgetData: UpdateBudgetData
  ): Promise<{
    success: boolean;
    message: string;
    budget: Budget;
  }> => {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  // Delete budget
  deleteBudget: async (
    id: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};
