"use client";

import "./Navbar.scss";

import Logo from "./Logos/Logo";
import MobileLogo from "./Logos/MobileLogo";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import Dropdown from "../dropdown/Dropdown";
import Button from "../buttons/Button/Button";

export default function Navbar() {
  const { user, accessToken, loading } = useRequireAuth({ requireAuth: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!accessToken) return;

    const fetchReviewCount = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/need_review/count`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        setReviewCount(data.count);
      } catch (error) {
        console.error("Error fetching review count:", error);
      }
    };

    fetchReviewCount();

    const interval = setInterval(fetchReviewCount, 30000);
    return () => clearInterval(interval);
  }, [accessToken]);

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
                <li>
                  <Link href="/timeline" onClick={closeMenu}>
                    Timeline
                  </Link>
                </li>
                <li>
                  <Link href="/review" onClick={closeMenu}>
                    Review
                    {reviewCount > 0 && (
                      <span className="review-badge">{reviewCount}</span>
                    )}
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Button text="Login" link="/login" />
              </li>
            )}
            {user && <Dropdown isMobile={menuOpen} />}
          </>
        )}
      </ul>
    </nav>
  );
}
