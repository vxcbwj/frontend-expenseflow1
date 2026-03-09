// components/audit/AuditLogFilters.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Filter, X, Calendar, Activity, User } from "lucide-react";
import { AuditLogFilters } from "../../services/auditLogAPI";

interface AuditLogFiltersProps {
  onFilterChange: (filters: AuditLogFilters) => void;
  availableActions: string[];
  availableEntities: string[];
  loading?: boolean;
}

const AuditLogFiltersComponent: React.FC<AuditLogFiltersProps> = ({
  onFilterChange,
  availableActions,
  availableEntities,
  loading = false,
}) => {
  // Local state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [entity, setEntity] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [limit, setLimit] = useState<number>(100);
  const [isExpanded, setIsExpanded] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Get today's date for max attribute
  const today = new Date().toISOString().split("T")[0];

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (startDate) count++;
    if (endDate) count++;
    if (action) count++;
    if (entity) count++;
    if (userEmail) count++;
    return count;
  };

  // Debounced filter change handler
  const handleFilterChange = useCallback(() => {
    const filters: AuditLogFilters = {
      page: 1,
      limit,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(action && { action }),
      ...(entity && { entity }),
      ...(userEmail && { userId: userEmail }),
    };

    onFilterChange(filters);
  }, [startDate, endDate, action, entity, userEmail, limit, onFilterChange]);

  // Apply debounced filter changes
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      handleFilterChange();
    }, 500);

    setDebounceTimer(timer);

    return () => clearTimeout(timer);
  }, [startDate, endDate, action, entity, userEmail, limit, handleFilterChange]);

  // Reset all filters
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setAction("");
    setEntity("");
    setUserEmail("");
    setLimit(100);

    const resetFilters: AuditLogFilters = {
      page: 1,
      limit: 100,
    };
    onFilterChange(resetFilters);
  };

  const activeFilterCount = getActiveFilterCount();

  // Desktop filters layout
  const FilterControls = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Start Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={today}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={today}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        {/* Action Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Action
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">All Actions</option>
            {availableActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            Entity
          </label>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">All Entities</option>
            {availableEntities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>

        {/* Page Size */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Show</label>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value={25}>25 items</option>
            <option value={50}>50 items</option>
            <option value={100}>100 items</option>
            <option value={200}>200 items</option>
          </select>
        </div>
      </div>

      {/* User Search and Buttons Row */}
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            User Email
          </label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Search by user email..."
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleReset}
            disabled={loading || activeFilterCount === 0}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <X className="w-4 h-4 inline mr-2" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      {/* Header with expand button for mobile */}
      <div className="flex items-center justify-between lg:hidden mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <X className="w-5 h-5" />
          ) : (
            <Filter className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Desktop filters always visible, mobile toggle */}
      <div className={`${isExpanded ? "block" : "hidden"} lg:block`}>
        <FilterControls />
      </div>

      {/* Active filters indicator for desktop */}
      {activeFilterCount > 0 && (
        <div className="hidden lg:flex mt-4 pt-4 border-t border-border gap-2 flex-wrap items-center">
          <span className="text-xs font-medium text-muted-foreground">
            Active filters: {activeFilterCount}
          </span>
          <button
            onClick={handleReset}
            className="text-xs text-primary hover:underline font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogFiltersComponent;
