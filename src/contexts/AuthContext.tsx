// frontend/src/contexts/AuthContext.tsx - SIMPLIFIED 2-ROLE SYSTEM
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authAPI } from "../services/api";
import api from "../services/api";
import { UserProfile, normalizeBackendUser } from "../services/userAPI";

type AuthContextType = {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      // Set axios header for existing token
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    return storedToken;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? normalizeBackendUser(JSON.parse(storedUser)) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [initLoading, setInitLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Memoized login function with axios configuration
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });

      if (res.success && res.token) {
        // Set token state
        setToken(res.token);

        // Normalize backend response
        const normalizedUser = normalizeBackendUser(res.user);
        setUser(normalizedUser);

        // Save to localStorage
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));

        // Set axios default header for all future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;

        // Update authentication state
        setIsAuthenticated(true);

        console.log("✅ Login successful:", {
          email: normalizedUser.email,
          role: normalizedUser.role,
          companyId: normalizedUser.companyId,
        });

        return { success: true, message: "Login successful" };
      } else {
        throw new Error(res.message || "Login failed");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        message: error.response?.data?.error || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized logout function
  const logout = useCallback(() => {
    // Clear state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Remove axios header
    delete api.defaults.headers.common["Authorization"];

    console.log("✅ Logout successful");

    // Dispatch event for other components
    window.dispatchEvent(new Event("authChange"));
  }, []);

  // Memoized refresh profile function
  const refreshProfile = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await authAPI.getProfile();
      if (res.success) {
        // Normalize backend response
        const normalizedUser = normalizeBackendUser(res.user);

        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setIsAuthenticated(true);

        console.log("✅ Profile refreshed:", {
          email: normalizedUser.email,
          role: normalizedUser.role,
        });
      }
    } catch (error: any) {
      console.error("❌ Refresh profile error:", error);
      // If token is invalid, logout
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  // Initial load - check authentication
  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        try {
          await refreshProfile();
        } catch {
          logout();
        }
      } else if (token && user) {
        setIsAuthenticated(true);
      }
      setInitLoading(false);
    };

    initAuth();
  }, [token, user, refreshProfile, logout]);

  // Listen for auth changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        logout();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [logout]);

  // Listen for authChange event
  useEffect(() => {
    const handleAuthChange = () => {
      const newToken = localStorage.getItem("token");
      if (newToken !== token) {
        if (newToken) {
          setToken(newToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        } else {
          logout();
        }
      }
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading: loading || initLoading,
        login,
        logout,
        refreshProfile,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Helper hook for checking authentication
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};
