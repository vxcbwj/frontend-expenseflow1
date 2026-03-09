// components/expenses/ExpenseStatusBadge.tsx
import React, { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Banknote,
  AlertCircle,
} from "lucide-react";

interface ExpenseStatusBadgeProps {
  status: "pending" | "approved" | "rejected" | "paid";
  approvedBy?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  approvedAt?: string | null;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

// Helper: Format approval date
const formatApprovalDate = (date: string): string => {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get status color classes
const getStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    case "approved":
      return "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
    case "rejected":
      return "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    case "paid":
      return "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    default:
      return "bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
  }
};

// Get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return Clock;
    case "approved":
      return CheckCircle;
    case "rejected":
      return XCircle;
    case "paid":
      return Banknote;
    default:
      return AlertCircle;
  }
};

// Get status label
const getStatusLabel = (status: string): string => {
  switch (status) {
    case "pending":
      return "Pending Approval";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "paid":
      return "Paid";
    default:
      return status;
  }
};

// Get size classes
const getSizeClasses = (size: string): { badge: string; icon: string } => {
  switch (size) {
    case "sm":
      return { badge: "px-2 py-0.5 text-xs", icon: "w-3 h-3" };
    case "lg":
      return { badge: "px-4 py-2 text-base", icon: "w-5 h-5" };
    case "md":
    default:
      return { badge: "px-3 py-1 text-sm", icon: "w-4 h-4" };
  }
};

const ExpenseStatusBadge: React.FC<ExpenseStatusBadgeProps> = ({
  status,
  approvedBy,
  approvedAt,
  showDetails = false,
  size = "md",
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const Icon = getStatusIcon(status);
  const colorClasses = getStatusColor(status);
  const sizeClasses = getSizeClasses(size);
  const label = getStatusLabel(status);

  const hasDetails = showDetails && (approvedBy || approvedAt);

  return (
    <div className="relative inline-block">
      <div
        className={`
          border rounded-full font-semibold flex items-center gap-1
          ${sizeClasses.badge} ${colorClasses}
          ${hasDetails ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
        `}
        onClick={() => {
          if (hasDetails) setShowPopover(!showPopover);
        }}
        role="status"
        aria-label={`Expense status: ${label}`}
      >
        <Icon className={sizeClasses.icon} />
        <span>{label}</span>
      </div>

      {/* Details Popover */}
      {hasDetails && showPopover && (
        <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-3 z-10">
          {approvedBy && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">
                Approved By
              </p>
              <p className="text-sm font-medium text-foreground">
                {approvedBy.firstName} {approvedBy.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {approvedBy.email}
              </p>
            </div>
          )}

          {approvedAt && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Approval Date
              </p>
              <p className="text-sm font-medium text-foreground">
                {formatApprovalDate(approvedAt)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseStatusBadge;
