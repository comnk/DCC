"use client";

import { useState } from "react";
import "./LoginForm.scss";
import Link from "next/link";
import GoogleSignInButton from "../../buttons/GoogleSignInButton/GoogleSignInButton";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@mui/material";

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("display_name")
      .eq("id", data.user.id)
      .single();

    if (!profile?.display_name) {
      window.location.href = "/onboarding";
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
        <Button variant="contained" color="primary" type="submit">
          Login
        </Button>
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
