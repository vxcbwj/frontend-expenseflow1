// components/layout/SearchBar.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon,
  CloseIcon,
  DashboardNavIcon,
  BudgetNavIcon,
  AnalyticsNavIcon,
  CompanyNavIcon,
  ProfileNavIcon,
  PlusIcon,
  TargetIcon,
} from "../ui/Icons";

interface SearchResult {
  type: "page" | "action";
  label: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  action?: () => void;
}

interface SearchBarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isExpanded, onToggle }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Available search items with SVG icons
  const searchItems: SearchResult[] = [
    // Pages
    {
      type: "page",
      label: "Dashboard",
      path: "/dashboard",
      icon: DashboardNavIcon,
      description: "Overview and analytics",
    },
    {
      type: "page",
      label: "Expenses",
      path: "/expenses",
      icon: BudgetNavIcon,
      description: "Manage expenses and transactions",
    },
    {
      type: "page",
      label: "Budgets",
      path: "/budgets",
      icon: AnalyticsNavIcon,
      description: "Set and track budgets",
    },
    {
      type: "page",
      label: "Analytics",
      path: "/analytics",
      icon: AnalyticsNavIcon,
      description: "Detailed charts and insights",
    },
    {
      type: "page",
      label: "Companies",
      path: "/companies",
      icon: CompanyNavIcon,
      description: "Manage your companies",
    },
    {
      type: "page",
      label: "Profile",
      path: "/profile",
      icon: ProfileNavIcon,
      description: "Your account settings",
    },

    // Actions
    {
      type: "action",
      label: "Add Expense",
      path: "/expenses",
      icon: PlusIcon,
      description: "Create new expense",
    },
    {
      type: "action",
      label: "Create Budget",
      path: "/budgets",
      icon: TargetIcon,
      description: "Set up new budget",
    },
    {
      type: "action",
      label: "Add Company",
      path: "/companies",
      icon: CompanyNavIcon,
      description: "Register new company",
    },
  ];

  // Filter results based on query
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const filtered = searchItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered.slice(0, 8)); // Limit to 8 results
  }, [query]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onToggle();
      }
      if (event.key === "Escape" && isExpanded) {
        onToggle();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isExpanded, onToggle]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isExpanded]);

  const handleResultClick = (result: SearchResult) => {
    if (result.path) {
      navigate(result.path);
    }
    if (result.action) {
      result.action();
    }
    onToggle();
    setQuery("");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onToggle();
      setQuery("");
    }
  };

  // Collapsed state - just the search icon
  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
        title="Search (Ctrl+K)"
      >
        <SearchIcon className="w-5 h-5" />
      </button>
    );
  }

  // Expanded state - full search modal
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <SearchIcon className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for pages, actions..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <CloseIcon className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Close (ESC)"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => {
                  const IconComponent = result.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          result.type === "page"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        } group-hover:scale-105 transition-transform`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                          {result.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.description}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          result.type === "page"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        }`}
                      >
                        {result.type === "page" ? "Page" : "Action"}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : query ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No results found for "
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {query}
                  </span>
                  "
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Try searching for pages like "expenses" or "budgets"
                </p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">
                  Search for pages and actions
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-left">
                  <div className="space-y-3">
                    <div className="font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide">
                      Quick Access
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <DashboardNavIcon className="w-4 h-4" />
                      <span>Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <BudgetNavIcon className="w-4 h-4" />
                      <span>Expenses</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <AnalyticsNavIcon className="w-4 h-4" />
                      <span>Budgets</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide">
                      Actions
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <PlusIcon className="w-4 h-4" />
                      <span>Add Expense</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <TargetIcon className="w-4 h-4" />
                      <span>Create Budget</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <CompanyNavIcon className="w-4 h-4" />
                      <span>Add Company</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Ctrl+K Open</span>
                <span>ESC Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
