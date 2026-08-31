"use client";

import { apiFetch } from "@/lib/api/client";
import { Campaign } from "@/types/Campaign";

import { useState, useEffect } from "react";

export function useCampaign(campaignId: string) {
  const [campaign, setCampaign] = useState<Campaign>();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setCampaign(await apiFetch<Campaign>(`/campaigns/${campaignId}`));
      } catch {
        // no-op: preserves prior "silent on failure" behavior
      }
    };

    fetchCampaign();
  }, [campaignId]);

  return campaign;
}
