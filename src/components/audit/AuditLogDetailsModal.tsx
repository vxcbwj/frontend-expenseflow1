// components/audit/AuditLogDetailsModal.tsx
import React, { useEffect } from "react";
import { X, Copy, User, Calendar, Globe, Monitor } from "lucide-react";
import { AuditLog } from "../../services/auditLogAPI";

interface AuditLogDetailsModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  // Helper: Format JSON with syntax highlighting
  const formatJSON = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
  };

  // Helper: Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Copied to clipboard");
    });
  };

  // Helper: Parse user agent
  const parseUserAgent = (ua: string): string => {
    if (!ua) return "Not available";
    return ua;
  };

  // Helper: Get user initials
  const getUserInitials = (user: any): string => {
    if (typeof user === "string") return "U";
    const first = user?.firstName?.[0] || "";
    const last = user?.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  // Helper: Format action color
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
      default:
        return "text-foreground bg-muted";
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !log) return null;

  // Extract user and userId with proper type guards
  const user =
    typeof log.userId === "string"
      ? { email: log.userId, firstName: "User", lastName: "", avatar: undefined }
      : log.userId;

  const userId = typeof log.userId !== "string" ? log.userId._id : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border bg-muted/50">
            <div className="flex-1">
              <h2
                id="modal-title"
                className="text-xl font-bold text-foreground mb-2"
              >
                Audit Log Details
              </h2>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getActionColor(
                    log.action
                  )}`}
                >
                  {log.action}
                </span>
                <span className="text-sm text-muted-foreground">
                  {log.entity}
                  {log.entityId && ` • ID: ${log.entityId.substring(0, 12)}...`}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-primary"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* User Information Section */}
            <div className="p-6 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                User Information
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.email}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials(user)
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">
                      {user?.email}
                    </p>
                  </div>
                  {userId && (
                    <div>
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {userId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(userId)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Copy ID"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Request Details Section */}
            <div className="p-6 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Request Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" />
                    Timestamp
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>

                {log.ipAddress && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Globe className="w-3 h-3" />
                      IP Address
                    </p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-foreground">
                      {log.ipAddress}
                    </p>
                  </div>
                )}

                {log.userAgent && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Monitor className="w-3 h-3" />
                      User Agent
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary hover:underline">
                        View user agent
                      </summary>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground mt-2 whitespace-pre-wrap break-words">
                        {parseUserAgent(log.userAgent)}
                      </p>
                    </details>
                  </div>
                )}
              </div>
            </div>

            {/* Entity Context Section */}
            <div className="p-6 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Entity Context
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Entity Type</p>
                  <p className="text-sm font-medium text-foreground bg-muted px-2 py-1 rounded inline-block">
                    {log.entity}
                  </p>
                </div>
                {log.entityId && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Entity ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1">
                        {log.entityId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(log.entityId || "")}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="Copy ID"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Change Details Section */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Change Details
              </h3>
              {log.details && Object.keys(log.details).length > 0 ? (
                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                    {formatJSON(log.details)}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(formatJSON(log.details))}
                    className="mt-3 flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    Copy JSON
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No additional details available
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4 bg-muted/50 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium focus:ring-2 focus:ring-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default AuditLogDetailsModal;