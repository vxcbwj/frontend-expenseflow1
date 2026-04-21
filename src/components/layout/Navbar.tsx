// components/layout/Navbar.tsx - UPDATED FOR 2-ROLE SYSTEM
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useCompany } from "../../contexts/CompanyContext";
import { usePermissions } from "../../hooks/userPermissions";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CompanySelector from "../company/CompanySelector";
import {
  MenuIcon,
  ProfileNavIcon,
  LogoutIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  BuildingIcon,
  ShieldIcon,
} from "../ui/Icons";

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { company } = useCompany();
  const { isAdmin } = usePermissions();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
    setShowUserMenu(false);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  // Get role display text
  const getRoleDisplay = () => {
    const role = (user.role || user.globalRole || "").toLowerCase();

    switch (role) {
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      default:
        return role;
    }
  };

  // Get role icon
  const getRoleIcon = () => {
    const role = (user.role || user.globalRole || "").toLowerCase();

    if (role === "admin") {
      return <ShieldIcon className="w-3 h-3" />;
    }
    return null;
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    const role = (user.role || user.globalRole || "").toLowerCase();

    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "manager":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  if (!isLoggedIn) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-16">
            <Logo
              onClick={() => navigate("/")}
              size="lg"
              showBadge={true}
              className="hover:opacity-80 transition-opacity"
            />

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400"
              >
                {theme === "light" ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <SunIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-6">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar Toggle & Logo */}
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
              title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <Logo
              onClick={() => navigate("/dashboard")}
              size="md"
              className="hover:opacity-80 transition-opacity"
            />
          </div>

          {/* Center: Role/Company Indicator */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              {user.role && (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRoleBadgeColor()}`}
                >
                  {getRoleIcon()}
                  <span>{getRoleDisplay()}</span>
                </div>
              )}

              {/* Company Name */}
              {company && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <BuildingIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {company.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Icons Area - Search, Theme, User Menu */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            {/* Search Icon */}
            <div className="hidden lg:block">
              <SearchBar
                isExpanded={isSearchExpanded}
                onToggle={toggleSearch}
              />
            </div>

            {/* Mobile Search Button */}
            <div className="lg:hidden">
              <SearchBar
                isExpanded={isSearchExpanded}
                onToggle={toggleSearch}
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400"
              title={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
            >
              {theme === "light" ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {user.firstName} {user.lastName}
                  </span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                      {company?.name || getRoleDisplay()}
                    </span>
                    {getRoleIcon() && (
                      <span className="text-gray-400">{getRoleIcon()}</span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                  {/* Role Indicator Dot */}
                  {(user.role || user.globalRole)?.toLowerCase() ===
                    "admin" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transform transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {/* User Info with Role */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor()}`}
                      >
                        {getRoleDisplay()}
                      </div>
                    </div>
                    {user.companyId && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Company ID:{" "}
                        {(user.companyId._id || user.companyId)
                          .toString()
                          .substring(0, 8)}
                        ...
                      </p>
                    )}
                  </div>

                  {/* Company Selector Section */}
                  {company && (
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                          <BuildingIcon className="w-4 h-4" />
                          <span>Current Company</span>
                        </span>
                        {isAdmin() && (
                          <button
                            onClick={() => {
                              navigate("/companies");
                              setShowUserMenu(false);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            Manage
                          </button>
                        )}
                      </div>
                      <CompanySelector compact />
                    </div>
                  )}

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <ProfileNavIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Your Profile</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Manage account settings
                      </div>
                    </div>
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <SettingsIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Settings</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        App preferences
                      </div>
                    </div>
                  </button>

                  <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <LogoutIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Sign Out</div>
                      <div className="text-xs text-red-500 dark:text-red-400">
                        Log out of your account
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for User Menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
