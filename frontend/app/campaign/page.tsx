"use client";

import "./campaign_list.scss";

import Button from "@/components/buttons/Button/Button";
import { Button as MUIButton } from "@mui/material";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Campaign } from "@/types/Campaign";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import CampaignCard from "@/components/cards/CampaignCard/CampaignCard";

export default function CampaignsPage() {
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

  if (loading)
    return (
      <div className="loadingWrapper">
        <CircularProgress />
      </div>
    );

  return (
    <div>
      <Navbar />
      <div className="content">
        <div className="header">
          <h2>Campaigns</h2>
          <Button text="Create Campaign" link="/campaign/new" />
        </div>
        <div className="tabBar">
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
        <div className="campaignGrid">
          {campaignsLoading ? (
            <div className="spinnerWrapper">
              <CircularProgress />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="emptyState">
              <div className="emptyIcon">📭</div>
              <p className="emptyTitle">No {tab} campaigns yet</p>
              <p className="emptySubtitle">
                {tab === "active"
                  ? "Create your first campaign to get started."
                  : "Archived campaigns will appear here."}
              </p>
            </div>
          ) : (
            <ul className="campaignList">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaignData={campaign} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
