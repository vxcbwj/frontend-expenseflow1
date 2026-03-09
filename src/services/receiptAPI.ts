// frontend/src/services/receiptAPI.ts
import api from "./api";

export interface Receipt {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: "image" | "pdf";
  cloudinaryId: string;
  thumbnailUrl?: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

/**
 * Upload receipts for an expense
 */
export const uploadReceipts = async (
  expenseId: string,
  files: File[],
  onProgress?: (progress: number) => void,
): Promise<{ success: boolean; receipts: Receipt[]; errors?: any[] }> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("receipts", file);
  });

  const response = await api.post(`/expenses/${expenseId}/receipts`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * Delete a receipt from an expense
 */
export const deleteReceipt = async (
  expenseId: string,
  receiptId: string,
): Promise<{ success: boolean }> => {
  const response = await api.delete(
    `/expenses/${expenseId}/receipts/${receiptId}`,
  );
  return response.data;
};

/**
 * Get receipt URL
 */
export const getReceiptUrl = async (
  expenseId: string,
  receiptId: string,
): Promise<{ success: boolean; url: string; receipt: Receipt }> => {
  const response = await api.get(
    `/expenses/${expenseId}/receipts/${receiptId}`,
  );
  return response.data;
};

export const receiptAPI = {
  uploadReceipts,
  deleteReceipt,
  getReceiptUrl,
};

export default receiptAPI;
