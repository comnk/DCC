"use client";

import { useState } from "react";
import "./LoginForm.scss";
import Link from "next/link";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError("");
  };

  return (
    <div className="login-form">
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <button type="submit">Login</button>
      </form>
      <GoogleSignInButton onError={setError} />
      {error && <p className="error">{error}</p>}
      <p>
        Don’t have an account?{" "}
        <Link href="/signup" className="signup-link">
          Sign up
        </Link>
      </p>
    </div>
  );
}
