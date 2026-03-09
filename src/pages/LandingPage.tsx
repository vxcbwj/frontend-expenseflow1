// pages/LandingPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard

  const features = [
    {
      icon: "📊",
      title: "Smart Dashboard",
      description:
        "Real-time insights into your company's financial performance with interactive charts and analytics.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: "💰",
      title: "Expense Tracking",
      description:
        "Effortlessly track and categorize expenses across all departments and teams.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: "📈",
      title: "Budget Management",
      description:
        "Set, monitor, and optimize budgets with intelligent forecasting and alerts.",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      description:
        "Multi-company support with role-based access control and team management.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: "🔒",
      title: "Secure & Compliant",
      description:
        "Enterprise-grade security with audit trails and compliance reporting.",
      gradient: "from-red-500 to-rose-600",
    },
    {
      icon: "🚀",
      title: "Fast & Reliable",
      description:
        "Lightning-fast performance with 99.9% uptime and seamless integration.",
      gradient: "from-cyan-500 to-blue-600",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Companies" },
    { value: "50M+", label: "Expenses Managed" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">EF</span>
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              ExpenseFlow
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-full text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
              <span>✨</span>
              The Future of Expense Management
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
              Take Control of Your
              <span className="block bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                Company Finances
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 lg:mb-12 max-w-2xl">
              ExpenseFlow is the all-in-one platform for expense tracking,
              budget management, and financial analytics designed for modern
              businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                Start now
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-lg"
              >
                Already have an account?
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏢</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        Acme Corp
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monthly Overview
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Expenses
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      $42,580
                    </p>
                  </div>
                </div>

                {/* Dashboard Preview */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 rounded-xl p-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Marketing
                      </p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        $12,450
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 rounded-xl p-4">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Operations
                      </p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        $18,230
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/10 rounded-xl p-4">
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        R&D
                      </p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        $11,900
                      </p>
                    </div>
                  </div>

                  {/* Chart Preview */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        Expense Trends
                      </h4>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        +12.5%
                      </span>
                    </div>
                    <div className="h-32 flex items-end space-x-2">
                      {[40, 65, 80, 60, 75, 90, 70].map((height, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map(
                        (month) => (
                          <span key={month}>{month}</span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 lg:py-24">
        <div className="text-center mb-12 lg:mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From expense tracking to financial reporting, ExpenseFlow provides
            all the tools your business needs to stay on top of finances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all duration-300"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className={`h-1 bg-gradient-to-r ${feature.gradient} rounded-full`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-6 lg:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EF</span>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              ExpenseFlow
            </span>
          </div>
          <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
            <a
              href="#"
              className="hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
          <div className="mt-6 lg:mt-0 text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} ExpenseFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
