// components/layout/Sidebar.tsx - UPDATED FOR 2-ROLE SYSTEM
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePermissions } from "../../hooks/userPermissions";
import { useCompany } from "../../contexts/CompanyContext";
import {
  UsersIcon,
  DashboardIcon,
  BudgetIcon,
  AnalyticsIcon,
  CompanyIcon,
  ProfileIcon,
  ChevronLeftIcon,
  ShieldIcon,
} from "../ui/Icons";

// Define proper types
interface SidebarItem {
  path: string;
  icon: React.ComponentType<{ className?: string }> | React.ElementType;
  label: string;
  show: boolean;
  disabled?: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAdmin,
    canViewDashboard,
    canViewCompanies,
    canViewBudgets,
    canViewExpenses,
    canViewAnalytics,
    canViewUsers,
    canViewProfile,
  } = usePermissions();

  const { company } = useCompany();

  const isLoggedIn = !!localStorage.getItem("token");
  const isActive = (path: string) => location.pathname === path;

  // Sidebar items for 2-role system
  const sidebarItems: SidebarItem[] = [
    {
      path: "/dashboard",
      icon: DashboardIcon,
      label: "Dashboard",
      show: canViewDashboard(),
    },
    {
      path: "/expenses",
      icon: BudgetIcon,
      label: "Expenses",
      show: canViewExpenses(),
    },
    {
      path: "/budgets",
      icon: BudgetIcon,
      label: "Budgets",
      show: canViewBudgets(),
    },
    {
      path: "/analytics",
      icon: AnalyticsIcon,
      label: "Analytics",
      show: canViewAnalytics(),
    },
    {
      path: "/companies",
      icon: CompanyIcon,
      label: "Company",
      show: isAdmin() && canViewCompanies(),
    },
    {
      path: company ? `/company-users/${company.id}` : "/companies",
      icon: UsersIcon,
      label: "Team",
      show: isAdmin() && canViewUsers(),
      disabled: !company,
    },
    {
      path: "/audit-logs",
      icon: ShieldIcon,
      label: "Audit Logs",
      show: isAdmin(),
    },
    {
      path: "/profile",
      icon: ProfileIcon,
      label: "Profile",
      show: canViewProfile(),
    },
  ].filter((item) => item.show);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div
      className={`
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          shadow-sm fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 
          transition-all duration-300
          ${isCollapsed ? "w-0 -ml-64" : "w-64 ml-0"}
          overflow-hidden
        `}
      data-sidebar
    >
      <div
        className={`w-64 h-full flex flex-col ${
          isCollapsed ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/dashboard")}
          >
            <div className="flex items-baseline space-x-2">
              <span className="font-bold text-gray-900 dark:text-white text-xl tracking-tight">
                ExpenseFlow
              </span>
            </div>
          </div>

          {/* Close Button */}
          {!isCollapsed && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
              title="Hide sidebar"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <nav className="mt-6 space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isDisabled = item.disabled || false;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (!isDisabled) {
                      navigate(item.path);
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }
                  }}
                  disabled={isDisabled}
                  className={`
                      w-full flex items-center space-x-3 px-4 py-4 sm:py-3 rounded-lg 
                      transition-all duration-200 group relative active:scale-[0.98]
                      ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500"
                          : isActive(item.path)
                            ? "bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:shadow-sm"
                      }
                    `}
                >
                  <IconComponent
                    className={`
                        w-5 h-5 transition-colors flex-shrink-0
                        ${
                          isDisabled
                            ? "text-gray-400 dark:text-gray-500"
                            : isActive(item.path)
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        }
                      `}
                  />
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                    {isDisabled && (
                      <span className="text-xs text-gray-500 ml-2">
                        (No company)
                      </span>
                    )}
                  </span>

                  {/* Active indicator */}
                  {!isDisabled && isActive(item.path) && (
                    <div className="absolute right-3 w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Current Company Info */}
          {company && (
            <div className="px-4 mt-6">
              <div className="p-3 flex flex-col gap-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Current Company
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {company.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  ID:{" "}
                  {company.id?.substring(0, 8) || company._id?.substring(0, 8)}
                  ...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="px-4 pb-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              ExpenseFlow v1.0
            </div>
            <div
              className={`text-xs text-center mt-1 px-2 py-1 rounded-full ${
                isAdmin()
                  ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 dark:from-blue-900/30 dark:text-blue-300"
                  : "bg-gradient-to-r from-green-100 to-green-50 text-green-700 dark:from-green-900/30 dark:text-green-300"
              }`}
            >
              {isAdmin() ? "Admin" : "Manager"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
