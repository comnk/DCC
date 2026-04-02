import "./signup.scss";

import Navbar from "@/components/Navbar/Navbar";
import RegisterForm from "@/components/forms/RegisterForm/RegisterForm";

export default function SignupPage() {
  return (
    <div className="signup-page">
      <Navbar />
      <div className="signup-page__content">
        <h1 className="signup-page__title">Create an Account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
