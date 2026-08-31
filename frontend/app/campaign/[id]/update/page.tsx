"use client";

import "./update_campaign.scss";

import CampaignForm from "@/components/forms/CampaignForm/CampaignForm";
import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/client";
import { apiRequest } from "@/lib/api/client";
import { Campaign } from "@/types/Campaign";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UpdateCampaignPage() {
  const { id: campaignId } = useParams<{
    id: string;
    postId: string;
  }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign>();

  useEffect(() => {
    if (!campaignId) return;

    const id = Array.isArray(campaignId) ? campaignId[0] : campaignId;

    const fetchCampaignData = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      let campaign: Campaign;
      try {
        campaign = await apiRequest<Campaign>(
          `/campaigns/${id}`,
          data.session.access_token,
        );
      } catch {
        router.push("/dashboard");
        return;
      }

      setCampaign(campaign);
    };

    fetchCampaignData();
  }, [campaignId]);

  return (
    <div className="update-campaign-page">
      <Navbar />
      <div className="update-campaign-page__content">
        <h2 className="update-campaign-page__title">Update Campaign</h2>
        <CampaignForm
          key={campaign?.id}
          campaignId={campaignId}
          campaignData={campaign}
        />
      </div>
    </div>
  );
}
