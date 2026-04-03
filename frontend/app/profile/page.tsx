"use client";

import "./profile_page.scss";

import Navbar from "@/components/Navbar/Navbar";
import UpdateProfileForm from "@/components/forms/UpdateProfileForm/UpdateProfileForm";
import { useRequireAuth } from "@/hooks/useRequiredAuth";

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();

  if (loading) return null;

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-page__content">
        <h1 className="profile-page__title">Profile</h1>
        <UpdateProfileForm />
      </div>
    </div>
  );
}
