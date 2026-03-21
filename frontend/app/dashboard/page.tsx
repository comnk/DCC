"use client";

import CampaignCard from "@/components/cards/CampaignCard/CampaignCard";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Campaign } from "@/types/Campaign";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, accessToken, loading } = useRequireAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tab, setTab] = useState<"active" | "archived">("active");

  const filteredCampaigns = campaigns.filter((c) =>
    tab === "active" ? !c.is_archived : c.is_archived,
  );

  useEffect(() => {
    if (!accessToken) return;

    const fetchCampaigns = async () => {
      const res = await fetch(`http://localhost:8000/campaigns/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      setCampaigns(data);
    };

    fetchCampaigns();
  }, [accessToken]);

  if (loading) return null;

  return (
    <>
      <Navbar />
      <h2>Welcome back!</h2>
      <button>
        <Link href="/campaign/new">Create Campaign</Link>
      </button>
      <div>
        <h2>Campaigns</h2>
        <div>
          <button
            onClick={() => setTab("active")}
            style={{ fontWeight: tab === "active" ? "bold" : "normal" }}
          >
            Active
          </button>
          <button
            onClick={() => setTab("archived")}
            style={{ fontWeight: tab === "archived" ? "bold" : "normal" }}
          >
            Archived
          </button>
        </div>
        <ul>
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaignData={campaign} />
          ))}
        </ul>
      </div>
    </>
  );
}
