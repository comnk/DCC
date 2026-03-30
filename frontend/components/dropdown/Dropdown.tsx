"use client";

import "./Dropdown.scss";

import Button from "../buttons/Button/Button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const supabase = createClient();

export default function Dropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="dropdown">
      <button className="dropbtn" onClick={() => setOpen(!open)}>
        Dropdown
      </button>
      {open && (
        <div className="dropdown-content">
          <Link href="/profile" className="item">
            Profile
          </Link>
          <Button text="Logout" link="#" onClick={handleLogout} />
        </div>
      )}
    </div>
  );
}
