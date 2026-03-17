"use client";

import Navbar from "@/components/Navbar/Navbar";
import UpdateProfileForm from "@/components/forms/UpdateProfileForm/UpdateProfileForm";
import { useRequireAuth } from "@/hooks/useRequiredAuth";

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();

  if (loading) return null;

  return (
    <div className="profile-page">
      <Navbar />
      <h1>Profile Page</h1>
      <UpdateProfileForm />
    </div>
  );
}
