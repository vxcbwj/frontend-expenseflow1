// frontend/src/contexts/CompanyContext.tsx - SIMPLIFIED 2-ROLE SYSTEM
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import api from "../services/api";

// ========== TYPE DEFINITIONS ==========

interface Company {
  id: string;
  _id: string;
  name: string;
  industry: string;
  currency: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  adminId?: string;
  managerIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  globalRole: string; // "admin" or "manager"
  joinedAt: string;
}

interface CreateCompanyData {
  name: string;
  industry: string;
  currency?: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  description?: string;
  logo?: string;
}

interface UpdateCompanyData {
  name?: string;
  industry?: string;
  currency?: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

interface CompanyContextType {
  company: Company | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCompany: () => Promise<Company | null>;
  createCompany: (companyData: CreateCompanyData) => Promise<{
    success: boolean;
    company?: Company;
    error?: string;
  }>;
  updateCompany: (companyData: UpdateCompanyData) => Promise<{
    success: boolean;
    company?: Company;
    error?: string;
  }>;
  deleteCompany: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  getCompanyUsers: () => Promise<{
    success: boolean;
    users?: CompanyUser[];
    error?: string;
  }>;

  // Helpers
  hasCompany: boolean;
  isAdmin: boolean;
}

interface CompanyProviderProps {
  children: ReactNode;
}

// ========== CONTEXT CREATION ==========

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// ========== PROVIDER COMPONENT ==========

export const CompanyProvider: React.FC<CompanyProviderProps> = ({
  children,
}) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Fetch company — guarded to fire only once per session
  const fetchCompany = useCallback(async (): Promise<Company | null> => {
    // Prevent duplicate fetches
    if (hasFetchedRef.current) {
      return company;
    }
    hasFetchedRef.current = true;

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching company...");

      const response = await api.get("/companies");

      if (response.data.success) {
        const companyData = response.data.company;

        if (companyData) {
          console.log("✅ Company found:", companyData.name);
          setCompany(companyData);
          return companyData;
        } else {
          console.log("⚠️ No company assigned to user");
          setCompany(null);
          return null;
        }
      } else {
        throw new Error(response.data.error || "Failed to fetch company");
      }
    } catch (err: any) {
      console.error("❌ CompanyContext: Fetch company error:", err);

      // Handle specific error cases — set error ONCE, do not retry
      if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied to company");
      } else if (err.code === "ERR_NETWORK" || err.code === "ERR_CONNECTION_REFUSED") {
        setError("Server is unreachable. Please check your connection.");
      } else {
        setError(err.message || "Failed to load company");
      }

      setCompany(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new company
  const createCompany = useCallback(
    async (
      companyData: CreateCompanyData,
    ): Promise<{ success: boolean; company?: Company; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        console.log("🏢 Creating new company:", companyData.name);

        const response = await api.post("/companies", companyData);

        if (response.data.success) {
          console.log(
            "✅ Company created successfully:",
            response.data.company,
          );

          // Set as current company
          setCompany(response.data.company);

          return { success: true, company: response.data.company };
        } else {
          throw new Error(response.data.error || "Failed to create company");
        }
      } catch (err: any) {
        console.error("❌ Create company error:", err);
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          "Failed to create company";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Update company
  const updateCompany = useCallback(
    async (
      companyData: UpdateCompanyData,
    ): Promise<{ success: boolean; company?: Company; error?: string }> => {
      if (!company) {
        return { success: false, error: "No company to update" };
      }

      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Updating company:", company.id || company._id);

        const companyId = company.id || company._id;
        const response = await api.put(`/companies/${companyId}`, companyData);

        if (response.data.success) {
          console.log("✅ Company updated successfully");

          setCompany(response.data.company);

          return { success: true, company: response.data.company };
        } else {
          throw new Error(response.data.error || "Failed to update company");
        }
      } catch (err: any) {
        console.error("❌ Update company error:", err);
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          "Failed to update company";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [company],
  );

  // Delete company
  const deleteCompany = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!company) {
      return { success: false, error: "No company to delete" };
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🗑️ Deleting company:", company.id || company._id);

      const companyId = company.id || company._id;
      const response = await api.delete(`/companies/${companyId}`);

      if (response.data.success) {
        console.log("✅ Company deleted successfully");

        setCompany(null);

        return { success: true };
      } else {
        throw new Error(response.data.error || "Failed to delete company");
      }
    } catch (err: any) {
      console.error("❌ Delete company error:", err);
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to delete company";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [company]);

  // Get company users
  const getCompanyUsers = useCallback(async (): Promise<{
    success: boolean;
    users?: CompanyUser[];
    error?: string;
  }> => {
    if (!company) {
      return { success: false, error: "No company selected" };
    }

    setLoading(true);
    setError(null);

    try {
      const companyId = company.id || company._id;
      console.log("👥 Fetching users for company:", companyId);

      const response = await api.get(`/companies/${companyId}/users`);

      if (response.data.success) {
        console.log(`✅ Fetched ${response.data.users?.length || 0} users`);
        return {
          success: true,
          users: response.data.users || [],
        };
      } else {
        throw new Error(response.data.error || "Failed to fetch company users");
      }
    } catch (err: any) {
      console.error("❌ Get company users error:", err);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch company users";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, [company]);

  // Initialize on mount — fires once
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("🔄 CompanyContext: Initializing with token");
      fetchCompany();
    } else {
      console.log("⚠️ CompanyContext: No token found, skipping initialization");
      setCompany(null);
    }
  }, []); // stable — fetchCompany is already memoized with []

  // Listen for auth changes (login/logout from other components)
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("🔄 CompanyContext: Auth changed, refreshing company");
        // Reset guard so a new login can fetch
        hasFetchedRef.current = false;
        fetchCompany();
      } else {
        console.log("⚠️ CompanyContext: Auth cleared, resetting company");
        hasFetchedRef.current = false;
        setCompany(null);
        setError(null);
      }
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, [fetchCompany]);

  // Determine if user is admin
  // TODO: derive from AuthContext once circular dependency is resolved
  const isAdmin = false;

  // Memoized context value — prevents cascading re-renders to consumers
  const contextValue = useMemo<CompanyContextType>(() => ({
    company,
    loading,
    error,

    // Actions
    fetchCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyUsers,

    // Helpers
    hasCompany: !!company,
    isAdmin,
  }), [company, loading, error, fetchCompany, createCompany, updateCompany, deleteCompany, getCompanyUsers, isAdmin]);

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};

// ========== CUSTOM HOOK ==========

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within CompanyProvider");
  }
  return context;
};
