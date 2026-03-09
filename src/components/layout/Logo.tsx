// components/layout/Logo.tsx
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  showBadge?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = "md",
  className = "",
  onClick,
  showBadge = false,
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const badgeSizes = {
    sm: "text-[10px] px-1 py-0.5",
    md: "text-xs px-1.5 py-0.5",
    lg: "text-sm px-2 py-1",
    xl: "text-base px-2 py-1",
  };

  return (
    <div
      className={`flex items-center space-x-2 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {/* Main Logo Text */}
      <div className="flex items-baseline space-x-1">
        <span
          className={`font-bold text-gray-900 dark:text-white ${sizeClasses[size]} tracking-tight`}
        >
          Expense
        </span>
        <span
          className={`font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent ${sizeClasses[size]} tracking-tight`}
        >
          Flow
        </span>
      </div>

      {/* Optional Beta Badge */}
      {showBadge && (
        <span
          className={`${badgeSizes[size]} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded font-medium tracking-wide`}
        >
          BETA
        </span>
      )}
    </div>
  );
};

export default Logo;
