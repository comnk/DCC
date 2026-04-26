"use client";

import "./Dropdown.scss";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const supabase = createClient();

interface UserProfile {
  display_name: string;
  role: string;
  profile_picture: string | null;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

function Avatar({ profile }: { profile: UserProfile | null }) {
  if (profile?.profile_picture) {
    return (
      <Image
        src={profile.profile_picture}
        alt={profile.display_name ?? "Profile"}
        width={36}
        height={36}
        className="avatar avatar--photo"
      />
    );
  }

  if (profile?.display_name) {
    return (
      <span className="avatar avatar--initials">
        {getInitials(profile.display_name)}
      </span>
    );
  }

  return <span className="avatar avatar--empty" />;
}

export default function Dropdown({ isMobile = false }: { isMobile?: boolean }) {
  const NEXT_PUBLIC_API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch(`${NEXT_PUBLIC_API_URL}/profile/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data: UserProfile = await res.json();
        setProfile(data);
      } catch {}
    };

    fetchProfile();
  }, [user?.id, NEXT_PUBLIC_API_URL]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <div className="dropdown dropdown--mobile">
        <div className="dropdown__user-info">
          <Avatar profile={profile} />
          <div className="dropdown__user-text">
            <p className="dropdown__display-name">
              {profile?.display_name || "User"}
            </p>
            <p className="dropdown__role">
              {profile?.role
                ?.split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ") || "Member"}
            </p>
            <p className="dropdown__email">{user?.email || ""}</p>
          </div>
        </div>
        <Link href="/profile" className="item">
          Profile
        </Link>
        <button className="item item--logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="dropdown">
      <button
        className="dropbtn dropbtn--avatar"
        onClick={() => setOpen(!open)}
      >
        <Avatar profile={profile} />
      </button>
      {open && (
        <div className="dropdown-content">
          <div className="dropdown__user-info dropdown__user-info--desktop">
            <div className="dropdown__user-text">
              <p className="dropdown__display-name">
                {profile?.display_name || "User"}
              </p>
              <p className="dropdown__role">
                {profile?.role
                  ?.split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ") || "Member"}
              </p>
              <p className="dropdown__email">{user?.email || ""}</p>
            </div>
          </div>
          <div className="dropdown__divider" />
          <Link href="/profile" className="item">
            Profile
          </Link>
          <button className="item item--logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
