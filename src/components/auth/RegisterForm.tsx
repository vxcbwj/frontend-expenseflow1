import React, { useState } from "react";
import { authAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import toast from "react-hot-toast";

interface RegisterFormProps {
  onSuccess: () => void;
  onToggleToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onToggleToLogin,
}) => {
  const { login } = useAuth();
  const { fetchCompany } = useCompany();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    registerAsAdmin: false,
    invitationToken: "",
  });
  const [loading, setLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState<"admin" | "manager">(
    "manager",
  );
  const [invitationToken, setInvitationToken] = useState("");

  // Check URL for invitation token
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setInvitationToken(token);
      setRegistrationType("manager");
      setFormData((prev) => ({ ...prev, invitationToken: token }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const isValidPhoneNumber = (value: string) => {
    if (!value) return true;
    const normalized = value.replace(/\s+/g, "");
    if (/^\+213\d{9}$/.test(normalized)) return true;
    return /^\+\d{4,15}$/.test(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      toast.error(
        "Please enter a valid phone number. Algerian numbers must start with +213 followed by 9 digits.",
      );
      setLoading(false);
      return;
    }

    try {
      // Prepare registration data
      const registrationData: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      // Add registration type based on selection
      if (registrationType === "admin") {
        registrationData.registerAsAdmin = true;
      } else if (invitationToken) {
        registrationData.invitationToken = invitationToken;
      }

      const response = await authAPI.register(registrationData);

      if (response.success) {
        await login(formData.email, formData.password);
        await fetchCompany();
        toast.success("Account created successfully!");
        onSuccess();
      }
    } catch (err: any) {
      // Global axios interceptor toasts the exact backend error payload. We only need to catch 401s manually if login part fails.
      if (err.response?.status === 401)
        toast.error("Could not auto-login after registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Join ExpenseFlow
      </h2>

      {invitationToken ? (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-600 dark:text-blue-400 text-sm">
            🎉 You've been invited to join a company! Please complete your
            registration.
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Registration Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="registrationType"
                checked={registrationType === "admin"}
                onChange={() => setRegistrationType("admin")}
                className="mr-2"
              />
              <span>Register as Company Admin</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="registrationType"
                checked={registrationType === "manager"}
                onChange={() => setRegistrationType("manager")}
                className="mr-2"
              />
              <span>Register as Manager (via invitation)</span>
            </label>
          </div>
        </div>
      )}

      {registrationType === "manager" && !invitationToken && (
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Invitation Token
          </label>
          <input
            type="text"
            name="invitationToken"
            value={invitationToken}
            onChange={(e) => {
              setInvitationToken(e.target.value);
              setFormData((prev) => ({
                ...prev,
                invitationToken: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
            placeholder="Enter invitation token (if you have one)"
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
            placeholder="Create a password"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Phone (Optional)
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="+213 XX XX XX XX XX"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all flex justify-center items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button
            onClick={onToggleToLogin}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-all"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
