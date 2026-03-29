"use client";

import CampaignForm from "@/components/forms/CampaignForm/CampaignForm";
import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/client";
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

      const res = await fetch(`http://localhost:8000/campaigns/${id}`, {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      if (!res.ok) {
        router.push("/dashboard");
        return;
      }

      const campaign = await res.json();
      setCampaign(campaign);
    };

    fetchCampaignData();
  }, [campaignId]);

  return (
    <div>
      <Navbar />
      <h2>Update Campaign</h2>
      <CampaignForm
        key={campaign?.id}
        campaignId={campaignId}
        campaignData={campaign}
      />
    </div>
  );
}
