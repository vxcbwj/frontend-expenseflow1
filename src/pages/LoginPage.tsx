import LoginForm from "../components/auth/LoginForm";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <LoginForm
        onSuccess={() => navigate("/dashboard")}
        onToggleToRegister={() => navigate("/register")}
      />
    </div>
  );
};
export default LoginPage;
