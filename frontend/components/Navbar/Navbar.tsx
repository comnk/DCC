"use client";

import "./Navbar.scss";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Logo from "./Logos/Logo";
import MobileLogo from "./Logos/MobileLogo";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href="/">
          <Logo className="logo-desktop" />
          <MobileLogo className="logo-mobile" />
        </Link>
      </div>
      <ul className="navbar-links">
        {user ? (
          <li>
            <Link href="/profile">Profile</Link>
          </li>
        ) : (
          <li>
            <Link href="/login">Login</Link>
          </li>
        )}
        {user && (
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}
