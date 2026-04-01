import "./login.scss";

import LoginForm from "@/components/forms/LoginForm/LoginForm";
import Navbar from "@/components/Navbar/Navbar";

export default function LoginPage() {
  return (
    <div className="login-page">
      <Navbar />
      <div className="login-page__content">
        <h2>Login Page</h2>
        <LoginForm />
      </div>
    </div>
  );
}
