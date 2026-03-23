"use client";

import CampaignCard from "@/components/cards/CampaignCard/CampaignCard";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Campaign } from "@/types/Campaign";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Button as MUIButton } from "@mui/material";
import Button from "@/components/buttons/Button/Button";

export default function DashboardPage() {
  const { user, accessToken, loading } = useRequireAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
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
      setCampaignsLoading(false);
    };

    fetchCampaigns();
  }, [accessToken]);

  if (loading) return <CircularProgress />;

  return (
    <>
      <Navbar />
      <h2>Welcome back!</h2>
      <Button text="Create Campaign" link="/campaign/new" />
      <div>
        <h2>Campaigns</h2>
        <div>
          <MUIButton
            variant={tab === "active" ? "contained" : "outlined"}
            onClick={() => setTab("active")}
          >
            Active
          </MUIButton>
          <MUIButton
            variant={tab === "archived" ? "contained" : "outlined"}
            onClick={() => setTab("archived")}
          >
            Archived
          </MUIButton>
        </div>
        <ul>
          {campaignsLoading ? (
            <CircularProgress />
          ) : (
            <ul>
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaignData={campaign} />
              ))}
            </ul>
          )}
        </ul>
      </div>
    </>
  );
}
