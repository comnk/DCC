"use client";

import { createClient } from "@/lib/supabase/client";
import { Campaign } from "@/types/Campaign";
import { useState } from "react";

import { useEffect } from "react";

export function useCampaign(campaignId: string) {
  const [campaign, setCampaign] = useState<Campaign>();

  useEffect(() => {
    const fetchCampaign = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      const res = await fetch(`http://localhost:8000/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      if (res.ok) setCampaign(await res.json());
    };

    fetchCampaign();
  }, [campaignId]);

  return campaign;
}