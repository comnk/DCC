"use client";

import "./Navbar.scss";

import Logo from "./Logos/Logo";
import MobileLogo from "./Logos/MobileLogo";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import Dropdown from "../dropdown/Dropdown";
import Button from "../buttons/Button/Button";

export default function Navbar() {
  const { user, loading } = useRequireAuth({ requireAuth: false });

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
                  <Link href="/posts">Posts</Link>
                </li>
                <li>
                  <Link href="/campaign">Campaigns</Link>
                </li>
              </>
            ) : (
              <li>
                <Button text="Login" link="/login" />
              </li>
            )}
            {user && <Dropdown />}
          </>
        )}
      </ul>
    </nav>
  );
}
