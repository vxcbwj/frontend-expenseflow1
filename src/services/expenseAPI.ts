// frontend/src/services/expenseAPI.ts

import api from "./api";
import { Receipt } from "./receiptAPI";

export interface Expense {
  id: string;
  _id: string; // MongoDB uses _id
  amount: number;
  category: string;
  department?: string;
  description: string;
  date: string;
  vendor?: string;
  companyId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status?: "pending" | "approved" | "rejected" | "paid";
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedAt?: string;
  receipts?: Receipt[]; // Receipt array
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  amount: number;
  category: string;
  department?: string;
  description: string;
  date: string;
  vendor?: string;
  companyId: string;
}

export interface UpdateExpenseData {
  amount?: number;
  category?: string;
  department?: string;
  description?: string;
  date?: string;
  vendor?: string;
}

export const expenseAPI = {
  // Create expense
  createExpense: async (
    expenseData: CreateExpenseData,
  ): Promise<{
    success: boolean;
    message: string;
    expense: Expense;
  }> => {
    const response = await api.post("/expenses", expenseData);
    return response.data;
  },

  // Get all expenses for a company
  getExpenses: async (
    companyId: string,
  ): Promise<{
    success: boolean;
    expenses: Expense[];
    message?: string;
  }> => {
    const response = await api.get(`/expenses?companyId=${companyId}`);
    return {
      success: true,
      expenses: response.data.expenses || response.data || [],
      message: response.data.message,
    };
  },

  // Update expense
  updateExpense: async (
    id: string,
    expenseData: UpdateExpenseData,
  ): Promise<{
    success: boolean;
    message: string;
    expense: Expense;
  }> => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (
    id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Approve expense
  approveExpense: async (
    id: string,
  ): Promise<{
    success: boolean;
    message: string;
    expense?: Expense;
  }> => {
    try {
      console.log(`✅ Approving expense: ${id}`);
      const response = await api.post(`/expenses/${id}/approve`);
      console.log(`✅ Expense approved successfully`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Approve expense error:", error);
      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to approve expense",
      };
    }
  },

  // Reject expense
  rejectExpense: async (
    id: string,
    reason?: string,
  ): Promise<{
    success: boolean;
    message: string;
    expense?: Expense;
  }> => {
    try {
      console.log(
        `❌ Rejecting expense: ${id}`,
        reason ? `Reason: ${reason}` : "",
      );
      const response = await api.post(`/expenses/${id}/reject`, { reason });
      console.log(`✅ Expense rejected successfully`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Reject expense error:", error);
      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to reject expense",
      };
    }
  },
};

export default expenseAPI;
