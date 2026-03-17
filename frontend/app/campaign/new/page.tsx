"use client";

import CampaignForm from "@/components/forms/CampaignForm/CampaignForm";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";

export default function NewCampaignPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return null;

  return (
    <div>
      <Navbar />
      <h1>New Campaign</h1>
      <CampaignForm />
    </div>
  );
}
