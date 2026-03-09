// components/audit/AuditLogTable.tsx
import React from "react";
import {
  Activity,
  User,
  Clock,
  ChevronRight,
  Shield,
  Trash2,
  Edit,
  LogIn,
  UserPlus,
  Ban,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AuditLog } from "../../services/auditLogAPI";

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  onRowClick?: (log: AuditLog) => void;
  emptyMessage?: string;
}

// Helper: Get color classes for action
const getActionColor = (action: string): string => {
  switch (action) {
    case "CREATE":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
    case "UPDATE":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
    case "DELETE":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
    case "APPROVE":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
    case "REJECT":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
    case "INVITE":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
    case "LOGIN":
    case "LOGOUT":
      return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950";
    default:
      return "text-foreground bg-muted";
  }
};

// Helper: Get icon for action
const getActionIcon = (action: string) => {
  switch (action) {
    case "CREATE":
      return Shield;
    case "UPDATE":
      return Edit;
    case "DELETE":
      return Trash2;
    case "LOGIN":
      return LogIn;
    case "LOGOUT":
      return LogIn;
    case "APPROVE":
      return CheckCircle;
    case "REJECT":
      return XCircle;
    case "INVITE":
      return UserPlus;
    case "REVOKE_INVITATION":
      return Ban;
    default:
      return Activity;
  }
};

// Helper: Format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Show relative time for recent logs (< 24 hours)
  if (diffHours < 1) {
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    const hours = Math.round(diffHours);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper: Get user initials
const getUserInitials = (user: any): string => {
  if (typeof user === "string") return "U";
  const first = user?.firstName?.[0] || "";
  const last = user?.lastName?.[0] || "";
  return (first + last).toUpperCase() || "U";
};

// Helper: Truncate details
const truncateDetails = (details: any): string => {
  if (!details || Object.keys(details).length === 0) {
    return "No details";
  }
  const str = JSON.stringify(details);
  return str.length > 100 ? str.substring(0, 100) + "..." : str;
};

// Skeleton Loading Row
const SkeletonRow: React.FC = () => (
  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
    <td className="p-3">
      <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
    </td>
    <td className="p-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
        <div className="space-y-1 flex-1">
          <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
          <div className="h-3 bg-muted rounded animate-pulse w-32"></div>
        </div>
      </div>
    </td>
    <td className="p-3">
      <div className="h-6 bg-muted rounded animate-pulse w-20"></div>
    </td>
    <td className="p-3">
      <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
    </td>
    <td className="p-3">
      <div className="h-4 bg-muted rounded animate-pulse w-40"></div>
    </td>
  </tr>
);

const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  loading,
  onRowClick,
  emptyMessage = "No audit logs found",
}) => {
  // Desktop Table View
  const DesktopTable = () => (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full border-collapse">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="p-3 text-left text-sm font-semibold text-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Timestamp
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                User
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-foreground">
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Action
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Entity
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-foreground">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Activity className="w-12 h-12 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            logs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              const user =
                typeof log.userId === "string"
                  ? { email: log.userId, firstName: "User", lastName: "" }
                  : log.userId;

              return (
                <tr
                  key={log.id}
                  onClick={() => onRowClick?.(log)}
                  className={`border-b border-border transition-colors ${
                    onRowClick
                      ? "hover:bg-muted/50 cursor-pointer"
                      : ""
                  }`}
                  role={onRowClick ? "button" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onRowClick(log);
                    }
                  }}
                >
                  {/* Timestamp */}
                  <td className="p-3 text-sm text-foreground">
                    {formatTimestamp(log.timestamp)}
                  </td>

                  {/* User */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                        {user && "avatar" in user && user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user?.email}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getUserInitials(user)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <ActionIcon className="w-4 h-4" />
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </div>
                  </td>

                  {/* Entity */}
                  <td className="p-3 text-sm text-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{log.entity}</span>
                      {log.entityId && (
                        <span className="text-xs text-muted-foreground">
                          ({log.entityId.substring(0, 8)}...)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Details */}
                  <td className="p-3 text-sm text-muted-foreground truncate">
                    {truncateDetails(log.details)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  // Mobile Card View
  const MobileCards = () => (
    <div className="space-y-3">
      {loading ? (
        <>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-2" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        logs.map((log) => {
          const user =
            typeof log.userId === "string"
              ? { email: log.userId, firstName: "User", lastName: "" }
              : log.userId;

          return (
            <div
              key={log.id}
              onClick={() => onRowClick?.(log)}
              className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
  {user && "avatar" in user && user.avatar ? (
    <img
      src={user.avatar}
      alt={user.email}
      className="w-10 h-10 rounded-full object-cover"
    />
  ) : (
    getUserInitials(user)
  )}
</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        on {log.entity}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
              <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                {formatTimestamp(log.timestamp)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <DesktopTable />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <MobileCards />
      </div>
    </>
  );
};

export default AuditLogTable;
