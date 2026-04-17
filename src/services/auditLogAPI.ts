// services/auditLogAPI.ts
import api from "./api";
import logger from "../utils/logger";

/**
 * Represents a single audit log entry
 */
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
      }
    | string;
  companyId: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

/**
 * Filter options for audit log queries
 */
export interface AuditLogFilters {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

/**
 * Standard response format for audit log queries
 */
export interface AuditLogResponse {
  success: boolean;
  logs: AuditLog[];
  count: number;
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Statistics response for audit logs
 */
export interface AuditLogStats {
  success: boolean;
  stats: {
    totalLogs: number;
    byAction: Record<string, number>;
    byEntity: Record<string, number>;
    recentActivity: Array<{ date: string; count: number }>;
  };
}

export const auditLogAPI = {
  /**
   * Get audit logs with optional filters and pagination
   * @param filters - Optional filter criteria (page, limit, action, entity, dates, userId)
   * @returns Promise with paginated audit logs
   */
  getAuditLogs: async (
    filters?: AuditLogFilters,
  ): Promise<AuditLogResponse> => {
    try {
      const params = new URLSearchParams();

      // Add pagination
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      else params.append("limit", "100"); // Default limit

      // Add filter criteria
      if (filters?.action) params.append("action", filters.action);
      if (filters?.entity) params.append("entity", filters.entity);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.userId) params.append("userId", filters.userId);

      const queryString = params.toString();
      logger.log(`Fetching audit logs with filters:`, filters);

      const response = await api.get(`/audit-logs?${queryString}`);

      logger.log(`Audit logs fetched:`, response.data);
      return response.data;
    } catch (error) {
      logger.error("Error fetching audit logs:", error);
      return {
        success: false,
        logs: [],
        count: 0,
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  },

  /**
   * Get audit logs for a specific entity
   * @param entity - Entity type (e.g., "Expense", "Budget", "User")
   * @param entityId - ID of the entity
   * @param limit - Maximum number of logs to return (default: 50)
   * @returns Promise with audit logs for the entity
   */
  getAuditLogsByEntity: async (
    entity: string,
    entityId: string,
    limit: number = 50,
  ): Promise<AuditLogResponse> => {
    try {
      logger.log(
        `Fetching audit logs for entity:`,
        entity,
        `with ID:`,
        entityId,
      );

      const response = await api.get(
        `/audit-logs/entity/${entity}/${entityId}?limit=${limit}`,
      );

      logger.log(`Entity audit logs fetched:`, response.data);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching audit logs for entity ${entity}:`, error);
      return {
        success: false,
        logs: [],
        count: 0,
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  },

  /**
   * Get audit logs for a specific user
   * @param userId - ID of the user
   * @param limit - Maximum number of logs to return (default: 50)
   * @returns Promise with user's activity logs
   */
  getAuditLogsByUser: async (
    userId: string,
    limit: number = 50,
  ): Promise<AuditLogResponse> => {
    try {
      logger.log(`Fetching audit logs for user:`, userId);

      const response = await api.get(
        `/audit-logs/user/${userId}?limit=${limit}`,
      );

      logger.log(`User audit logs fetched:`, response.data);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching audit logs for user ${userId}:`, error);
      return {
        success: false,
        logs: [],
        count: 0,
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  },

  /**
   * Get recent activity logs
   * @param limit - Maximum number of logs to return (default: 20)
   * @returns Promise with recent activity
   */
  getRecentLogs: async (limit: number = 20): Promise<AuditLogResponse> => {
    try {
      logger.log(`Fetching recent audit logs with limit:`, limit);

      const response = await api.get(`/audit-logs/recent?limit=${limit}`);

      logger.log(`Recent audit logs fetched:`, response.data);
      return response.data;
    } catch (error) {
      logger.error("Error fetching recent audit logs:", error);
      return {
        success: false,
        logs: [],
        count: 0,
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  },

  /**
   * Get audit statistics and aggregated data
   * @param days - Number of days to include in statistics (default: 30)
   * @returns Promise with audit statistics
   */
  getAuditStats: async (days: number = 30): Promise<AuditLogStats> => {
    try {
      logger.log(`Fetching audit statistics for last ${days} days`);

      const response = await api.get(`/audit-logs/stats?days=${days}`);

      logger.log(`Audit statistics fetched:`, response.data);
      return response.data;
    } catch (error) {
      logger.error("Error fetching audit statistics:", error);
      return {
        success: false,
        stats: {
          totalLogs: 0,
          byAction: {},
          byEntity: {},
          recentActivity: [],
        },
      };
    }
  },

  /**
   * Get list of available audit actions
   * @returns Promise with array of possible actions
   */
  getAvailableActions: async (): Promise<{
    success: boolean;
    actions: string[];
  }> => {
    try {
      logger.log(`Fetching available audit actions`);

      const response = await api.get(`/audit-logs/actions`);

      logger.log(`Available actions fetched:`, response.data);
      return response.data;
    } catch (error) {
      logger.error("Error fetching available actions:", error);
      return {
        success: false,
        actions: [],
      };
    }
  },

  /**
   * Get list of available audit entities
   * @returns Promise with array of possible entities
   */
  getAvailableEntities: async (): Promise<{
    success: boolean;
    entities: string[];
  }> => {
    try {
      logger.log(`Fetching available audit entities`);

      const response = await api.get(`/audit-logs/entities`);

      logger.log(`Available entities fetched:`, response.data);
      return response.data;
    } catch (error) {
      logger.error("Error fetching available entities:", error);
      return {
        success: false,
        entities: [],
      };
    }
  },
};
