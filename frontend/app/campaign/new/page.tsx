"use client";

import "./new_campaign.scss";

import CampaignForm from "@/components/forms/CampaignForm/CampaignForm";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function NewCampaignPage() {
  const { loading } = useRequireAuth();

  if (loading) return null;

  return (
    <div className="new-campaign-page">
      <Navbar />
      <div className="new-campaign-page__content">
        <h2 className="new-campaign-page__title">New Campaign</h2>
        <CampaignForm />
      </div>
    </div>
  );
}
