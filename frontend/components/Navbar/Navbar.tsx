"use client";

import "./Navbar.scss";

import Logo from "./Logos/Logo";
import MobileLogo from "./Logos/MobileLogo";

import Link from "next/link";
import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import Dropdown from "../dropdown/Dropdown";
import Button from "../buttons/Button/Button";

export default function Navbar() {
  const { user, loading } = useRequireAuth({ requireAuth: false });
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href={user ? "/dashboard" : "/"} onClick={closeMenu}>
          <Logo className="logo-desktop" />
          <MobileLogo className="logo-mobile" />
        </Link>
      </div>

      <button
        className={`navbar-hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`navbar-links ${menuOpen ? "navbar-links--open" : ""}`}>
        {!loading && (
          <>
            {user ? (
              <>
                <li>
                  <Link href="/posts" onClick={closeMenu}>
                    Posts
                  </Link>
                </li>
                <li>
                  <Link href="/campaign" onClick={closeMenu}>
                    Campaigns
                  </Link>
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
