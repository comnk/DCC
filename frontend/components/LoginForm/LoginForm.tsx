"use client";

import { useState } from "react";
import "./LoginForm.scss";
import Link from "next/link";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="login-form">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          name="password"
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
