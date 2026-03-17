"use client";

import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Campaign {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export default function DashboardPage() {
  const { user, accessToken, loading } = useRequireAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

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
        <ul>
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <Link href={`/campaign/${campaign.id}`}>{campaign.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
