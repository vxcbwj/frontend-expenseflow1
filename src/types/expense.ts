// frontend/src/types/expense.ts
/**
 * Department type definitions for ExpenseFlow
 * These types ensure TypeScript safety across the application
 */

export type Department = 
  | 'Sales & Marketing'
  | 'Operations'
  | 'Technology'
  | 'Finance'
  | 'Human Resources'
  | 'Administration'
  | 'Other';

/**
 * List of all available departments
 */
export const DEPARTMENTS: Department[] = [
  'Sales & Marketing',
  'Operations',
  'Technology',
  'Finance',
  'Human Resources',
  'Administration',
  'Other'
];

/**
 * Get the color class for a department badge
 * Used for consistent styling across the application
 */
export const getDepartmentColor = (dept: Department): string => {
  const colors: Record<Department, string> = {
    'Sales & Marketing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Operations': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Technology': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Finance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Human Resources': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'Administration': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'Other': 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
  };
  return colors[dept];
};

/**
 * Get human-readable department label
 */
export const getDepartmentLabel = (dept: Department): string => {
  return dept;
};

/**
 * Department filter options for dropdowns
 */
export const departmentOptions = DEPARTMENTS.map(dept => ({
  value: dept,
  label: getDepartmentLabel(dept),
}));
