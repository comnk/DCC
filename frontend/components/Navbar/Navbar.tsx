"use client";

import "./Navbar.scss";

import { createClient } from "@/lib/supabase/client";
import Logo from "./Logos/Logo";
import MobileLogo from "./Logos/MobileLogo";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import Button from "../buttons/Button/Button";

const supabase = createClient();

export default function Navbar() {
  const { user, loading } = useRequireAuth({ requireAuth: false });
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href={user ? "/dashboard" : "/"}>
          <Logo className="logo-desktop" />
          <MobileLogo className="logo-mobile" />
        </Link>
      </div>
      <ul className="navbar-links">
        {!loading && (
          <>
            {user ? (
              <>
                <li>
                  <Link href="/profile">Profile</Link>
                </li>
                <li>
                  <Link href="/posts">Posts</Link>
                </li>
                <li>
                  <Link href="/campaign">Campaigns</Link>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login">Login</Link>
              </li>
            )}
            {user && (
              <li>
                <Button text="Logout" link="#" onClick={handleLogout} />
              </li>
            )}
          </>
        )}
      </ul>
    </nav>
  );
}
