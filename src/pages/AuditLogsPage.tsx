// pages/AuditLogsPage.tsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  Activity,
  Download,
  RefreshCw,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePermissions } from "../hooks/userPermissions";
import { useCompany } from "../contexts/CompanyContext";
import {
  auditLogAPI,
  AuditLog,
  AuditLogFilters as AuditLogFiltersType,
  AuditLogStats,
} from "../services/auditLogAPI";
import AuditLogTable from "../components/audit/AuditLogTable";
import AuditLogFilters from "../components/audit/AuditLogFilters";
import AuditLogDetailsModal from "../components/audit/AuditLogDetailsModal";

const AuditLogsPage: React.FC = () => {
  const { isAdmin, getCompanyId } = usePermissions();
  const { company } = useCompany();

  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogFiltersType>({
    page: 1,
    limit: 100,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableEntities, setAvailableEntities] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch logs
  const fetchLogs = useCallback(async (newFilters: AuditLogFiltersType) => {
    setLoading(true);
    setError(null);

    try {
      const response = await auditLogAPI.getAuditLogs(newFilters);

      if (response.success) {
        setLogs(response.logs);
        setTotalPages(response.totalPages);
        setTotalLogs(response.total);
      } else {
        setError("Failed to load audit logs");
        setLogs([]);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Failed to load audit logs. Please try again.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch metadata (actions and entities)
  const fetchMetadata = useCallback(async () => {
    try {
      const [actionsRes, entitiesRes] = await Promise.all([
        auditLogAPI.getAvailableActions(),
        auditLogAPI.getAvailableEntities(),
      ]);

      if (actionsRes.success) {
        setAvailableActions(actionsRes.actions);
      }

      if (entitiesRes.success) {
        setAvailableEntities(entitiesRes.entities);
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsRes = await auditLogAPI.getAuditStats(30);
      if (statsRes.success) {
        setStats(statsRes);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMetadata();
    fetchStats();
    fetchLogs(filters);
  }, []);

  // Fetch on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, fetchLogs]);

  // Permission check
  if (!isAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  if (!getCompanyId()) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
        <p className="text-muted-foreground">
          You need to be assigned to a company to view audit logs.
        </p>
      </div>
    );
  }

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: AuditLogFiltersType) => {
    setFilters(newFilters);
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchLogs(filters), fetchMetadata(), fetchStats()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle row click
  const handleRowClick = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("No logs to export");
      return;
    }

    const headers = [
      "Timestamp",
      "User",
      "Email",
      "Action",
      "Entity",
      "Entity ID",
      "IP Address",
      "Details",
    ];

    const csvContent = [
      headers.join(","),
      ...logs.map((log) => {
        const user =
          typeof log.userId === "string"
            ? { email: log.userId, firstName: "User", lastName: "" }
            : log.userId;

        return [
          new Date(log.timestamp).toLocaleString(),
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          user?.email || "",
          log.action,
          log.entity,
          log.entityId || "",
          log.ipAddress || "",
          JSON.stringify(log.details || "{}").replace(/"/g, '""'),
        ]
          .map((cell) => `"${cell}"`)
          .join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Format number
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Calculate start and end items for pagination display
  const startItem = (filters.page! - 1) * filters.limit! + 1;
  const endItem = Math.min(filters.page! * filters.limit!, totalLogs);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            System activity and security logs
            {company ? ` for ${company.name}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={loading || logs.length === 0}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logs */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Total Logs (30 days)
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats?.stats.totalLogs ? formatNumber(stats.stats.totalLogs) : "0"}
          </div>
        </div>

        {/* Actions Count */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Unique Actions
          </div>
          <div className="text-2xl font-bold text-foreground">
            {Object.keys(stats?.stats.byAction || {}).length}
          </div>
        </div>

        {/* Entity Types */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Entity Types</div>
          <div className="text-2xl font-bold text-foreground">
            {Object.keys(stats?.stats.byEntity || {}).length}
          </div>
        </div>

        {/* Most Common Action */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Most Common</div>
          <div className="text-2xl font-bold text-foreground">
            {stats?.stats.byAction
              ? Object.entries(stats.stats.byAction).sort(
                  ([, a], [, b]) => (b as number) - (a as number),
                )[0]?.[0] || "N/A"
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Filters */}
      <AuditLogFilters
        onFilterChange={handleFilterChange}
        availableActions={availableActions}
        availableEntities={availableEntities}
        loading={loading}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={handleRefresh}
            className="text-sm text-red-600 dark:text-red-300 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <AuditLogTable
        logs={logs}
        loading={loading}
        onRowClick={handleRowClick}
        emptyMessage="No audit logs found"
      />

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalLogs} logs
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, filters.page! - 1))}
              disabled={filters.page! <= 1 || loading}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`w-8 h-8 rounded-lg transition-colors ${
                      filters.page === pageNum
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:bg-muted"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <span className="text-muted-foreground">... {totalPages}</span>
              )}
            </div>

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, filters.page! + 1))
              }
              disabled={filters.page! >= totalPages || loading}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={filters.limit}
            onChange={(e) =>
              setFilters({
                ...filters,
                limit: parseInt(e.target.value),
                page: 1,
              })
            }
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={200}>200 per page</option>
          </select>
        </div>
      )}

      {/* Modal */}
      <AuditLogDetailsModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
};

export default AuditLogsPage;
