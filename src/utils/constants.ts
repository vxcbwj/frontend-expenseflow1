// src/utils/constants.ts

/**
 * DEFAULT CURRENCY CONFIGURATION
 * Algerian Dinar (DZD) is the primary market default
 */
export const DEFAULT_CURRENCY_CODE = "DZD";
export const DEFAULT_CURRENCY_SYMBOL = "د.ج";
export const DEFAULT_CURRENCY_DISPLAY = "DZD - د.ج";

/**
 * DEFAULT PHONE CONFIGURATION
 * Algeria (+213) is the primary market default
 */
export const DEFAULT_COUNTRY_CODE = "+213";
export const DEFAULT_COUNTRY_NAME = "Algeria";
export const DEFAULT_PHONE_PLACEHOLDER = "+213 553 97 67 88";
export const DEFAULT_PHONE_PATTERN = /^\+213\d{9}$/;

export const EXPENSE_CATEGORIES = [
  "Office Supplies",
  "Software",
  "Hardware",
  "Travel",
  "Meals & Entertainment",
  "Marketing",
  "Utilities",
  "Rent",
  "Salaries",
  "Consulting",
  "Insurance",
  "Training",
  "Maintenance",
  "Shipping",
  "Advertising",
  "Legal",
  "Taxes",
  "Transportation",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_DEPARTMENTS = [
  "Sales & Marketing",
  "Operations",
  "Technology",
  "Finance",
  "Human Resources",
  "Administration",
  "Other",
] as const;

export type ExpenseDepartment = (typeof EXPENSE_DEPARTMENTS)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  "Office Supplies":
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  Software: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Hardware: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  Travel:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Meals & Entertainment":
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Marketing: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Utilities: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  Rent: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  Salaries:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Consulting:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  Insurance: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  Training: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  Maintenance:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Shipping:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Advertising:
    "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  Legal: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300",
  Taxes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Transportation:
    "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
  Other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export const DEPARTMENT_COLORS: Record<string, string> = {
  "Sales & Marketing":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Operations:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Technology:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Finance:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Human Resources":
    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Administration:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  Other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
