import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <RegisterForm
      onSuccess={() => navigate("/dashboard")}
      onToggleToLogin={() => navigate("/login")}
    />
  );
};
export default RegisterPage;
