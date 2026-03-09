// components/expenses/ExpenseApprovalActions.tsx
import React, { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { usePermissions } from "../../hooks/userPermissions";
import { expenseAPI } from "../../services/expenseAPI";
import ExpenseStatusBadge from "./ExpenseStatusBadge";

interface ExpenseApprovalActionsProps {
  expenseId: string;
  currentStatus: string;
  amount: number;
  description: string;
  onApprove?: () => void;
  onReject?: () => void;
  showConfirmation?: boolean;
  compact?: boolean;
}

const ExpenseApprovalActions: React.FC<ExpenseApprovalActionsProps> = ({
  expenseId,
  currentStatus,
  amount,
  description,
  onApprove,
  onReject,
  showConfirmation = false,
  compact = false,
}) => {
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");

  const PERMISSIONS = {
    EDIT_EXPENSES: "EDIT_EXPENSES",
  };

  // Check if user has permission
  if (!hasPermission(PERMISSIONS.EDIT_EXPENSES)) {
    return null;
  }

  // Only show actions if status is pending
  if (currentStatus !== "pending") {
    return (
      // Line 54 in ExpenseApprovalActions.tsx
      <ExpenseStatusBadge
        status={currentStatus as "pending" | "approved" | "rejected" | "paid"}
        showDetails={true}
        size={compact ? "sm" : "md"}
      />
    );
  }

  // Handle approve
  const handleApprove = async () => {
    if (showConfirmation && !showConfirmDialog) {
      setActionType("approve");
      setShowConfirmDialog(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await expenseAPI.approveExpense(expenseId);

      if (response.success) {
        console.log("✅ Expense approved successfully");
        setShowConfirmDialog(false);
        setActionType(null);
        onApprove?.();
      } else {
        setError(response.message || "Failed to approve expense");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "An error occurred while approving",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (showConfirmation && !showConfirmDialog) {
      setActionType("reject");
      setShowConfirmDialog(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await expenseAPI.rejectExpense(
        expenseId,
        rejectReason || undefined,
      );

      if (response.success) {
        console.log("✅ Expense rejected successfully");
        setShowConfirmDialog(false);
        setActionType(null);
        setRejectReason("");
        onReject?.();
      } else {
        setError(response.message || "Failed to reject expense");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "An error occurred while rejecting",
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirmation Dialog
  const ConfirmDialog = () => (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setShowConfirmDialog(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-card rounded-lg shadow-2xl max-w-md w-full p-6 pointer-events-auto"
          role="dialog"
          aria-modal="true"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">
            {actionType === "approve" ? "Approve Expense" : "Reject Expense"}
          </h2>

          {/* Expense Details */}
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-semibold text-foreground">
                  ${amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm text-foreground">{description}</p>
              </div>
            </div>
          </div>

          {/* Reject Reason (if rejecting) */}
          {actionType === "reject" && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why are you rejecting this expense?"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={actionType === "approve" ? handleApprove : handleReject}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {actionType === "approve" ? "Approve" : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            onClick={handleApprove}
            disabled={loading}
            title="Approve"
            className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            title="Reject"
            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <div className="mt-2 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {showConfirmDialog && <ConfirmDialog />}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            Approve
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            Reject
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>

      {showConfirmDialog && <ConfirmDialog />}
    </>
  );
};

export default ExpenseApprovalActions;
