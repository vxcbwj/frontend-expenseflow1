// App.tsx - UPDATED FOR 2-ROLE SYSTEM
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { AuthProvider } from "./contexts/AuthContext";
import { usePermissions } from "./hooks/userPermissions";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import CompanyManagement from "./components/company/CompanyManagement";
import AnalyticsPage from "./pages/AnalyticsPage";
import BudgetPage from "./pages/BudgetPage";
import ExpenseListPage from "./pages/ExpenseListPage";
import CompanyUsersPage from "./pages/CompanyUsersPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import LandingPage from "./pages/LandingPage";

// ========== ROUTE PROTECTION COMPONENTS ==========
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = !!localStorage.getItem("token");

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

// ========== MAIN APP CONTENT ==========
function AppContent() {
  const isLoggedIn = !!localStorage.getItem("token");
  const { isDark } = useTheme();

  // Start with sidebar collapsed by default
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : true;
  });

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "sidebarCollapsed",
      JSON.stringify(isSidebarCollapsed),
    );
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector("[data-sidebar]");
      const toggleButton = document.querySelector("[data-toggle-button]");

      if (
        window.innerWidth < 1024 &&
        !isSidebarCollapsed &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node)
      ) {
        setIsSidebarCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarCollapsed]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "dark" : ""
      }`}
    >
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar
            onToggleSidebar={toggleSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <div className="flex">
            {/* Sidebar with toggle functionality */}
            {isLoggedIn && (
              <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
              />
            )}

            {/* Main content with dynamic margin */}
            <main
              className={`
                flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300
                ${isLoggedIn && !isSidebarCollapsed ? "lg:ml-64" : ""}
                mt-16 p-6
              `}
            >
              <div className="max-w-7xl mx-auto">
                <Routes>
                  {/* ========== PUBLIC ROUTES ========== */}
                  <Route
                    path="/"
                    element={
                      localStorage.getItem("token") ? (
                        <Navigate to="/dashboard" />
                      ) : (
                        <LandingPage />
                      )
                    }
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* ========== ALL AUTHENTICATED USERS ========== */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/expenses"
                    element={
                      <ProtectedRoute>
                        <ExpenseListPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/budgets"
                    element={
                      <ProtectedRoute>
                        <BudgetPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ========== ADMIN ONLY ROUTES ========== */}
                  <Route
                    path="/companies"
                    element={
                      <ProtectedRoute>
                        <AdminRoute>
                          <CompanyManagement />
                        </AdminRoute>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/company-users/:companyId"
                    element={
                      <ProtectedRoute>
                        <AdminRoute>
                          <CompanyUsersPage />
                        </AdminRoute>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/audit-logs"
                    element={
                      <ProtectedRoute>
                        <AdminRoute>
                          <AuditLogsPage />
                        </AdminRoute>
                      </ProtectedRoute>
                    }
                  />

                  {/* ========== 404 ROUTE ========== */}
                  <Route
                    path="*"
                    element={
                      <div className="text-center py-20">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                          404
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                          Page not found
                        </p>
                      </div>
                    }
                  />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CompanyProvider>
          <AppContent />
        </CompanyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
