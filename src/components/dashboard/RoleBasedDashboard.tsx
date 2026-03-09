// components/dashboard/RoleBasedDashboard.tsx - FIXED FOR 2-ROLE SYSTEM
import React from "react";
import { usePermissions } from "../../hooks/userPermissions";
import { EnhancedDashboard } from "./EnhancedDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Building2, Users } from "lucide-react";

interface RoleBasedDashboardProps {
  expenses: any[];
  loading?: boolean;
}

const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({
  expenses,
  loading = false,
}) => {
  const {
    isAdmin,
    isManager,
    canManageExpenses,
    canViewAnalytics,
    canManageUsers,
  } = usePermissions();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Admin Dashboard
  if (isAdmin()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Shield className="mr-3 h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Full company management and oversight
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => (window.location.href = "/companies")}
              variant="default"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Manage Company
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Permissions</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Manage Company</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Invite Managers</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Full Access</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {canManageUsers() && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => (window.location.href = "/companies")}
                  >
                    Manage Team
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = "/budgets")}
                >
                  Set Budgets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <EnhancedDashboard expenses={expenses} loading={false} />
      </div>
    );
  }

  // Manager Dashboard
  if (isManager()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage expenses and budgets
            </p>
          </div>
          {canManageExpenses() && (
            <Button
              onClick={() => (window.location.href = "/expenses")}
              variant="default"
            >
              + Add Expense
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Your Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manage Expenses</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      canManageExpenses()
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {canManageExpenses() ? "✓ Allowed" : "✗ Denied"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">View Analytics</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      canViewAnalytics()
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {canViewAnalytics() ? "✓ Allowed" : "✗ Denied"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Set Budgets</span>
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">
                    ✓ Allowed
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {canManageExpenses() && (
                  <Button
                    className="w-full"
                    onClick={() => (window.location.href = "/expenses")}
                  >
                    Submit Expense
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = "/budgets")}
                >
                  View Budgets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <EnhancedDashboard expenses={expenses} loading={false} />
      </div>
    );
  }

  // Fallback - Regular dashboard
  return <EnhancedDashboard expenses={expenses} loading={loading} />;
};

export default RoleBasedDashboard;
