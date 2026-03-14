"use client";

import Logo from "./Logos/Logo";
import MobileLogo from "./Logos/MobileLogo";
import "./Navbar.scss";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href="/">
          <Logo className="logo-desktop" />
          <MobileLogo className="logo-mobile" />
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link href="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
}
