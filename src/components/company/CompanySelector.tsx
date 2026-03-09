// components/company/CompanySelector.tsx - SIMPLIFIED FOR 2-ROLE SYSTEM
import React from "react";
import { useCompany } from "../../contexts/CompanyContext";

interface CompanySelectorProps {
  compact?: boolean;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
  compact = false,
}) => {
  const { company, loading } = useCompany(); // Removed setCompany

  // In 2-role system, users only have one company
  // This component just displays the company name

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-8"></div>
    );
  }

  if (!company) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
        No company assigned
      </div>
    );
  }

  // Compact version for user menu
  if (compact) {
    return (
      <div className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
        <div className="font-medium text-gray-900 dark:text-white">
          {company.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Your Company
        </div>
      </div>
    );
  }

  // Regular version
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        Company:
      </span>
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm min-w-32">
        <div className="font-medium text-gray-900 dark:text-white">
          {company.name}
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;