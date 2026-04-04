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
import CampaignSearchBar from "@/components/SearchBars/CampaignSearchBar/CampaignSearchBar";

export default function CampaignsPage() {
  const { user, accessToken, loading } = useRequireAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "completed" | "archived">("active");
  const [searchTerm, setSearchTerm] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const filteredCampaigns = campaigns.filter((c) => {
    const isCompleted = c.end_date && new Date(c.end_date) < today;

    const matchesTab =
      tab === "active"
        ? !c.is_archived && !isCompleted
        : tab === "completed"
          ? isCompleted && !c.is_archived
          : c.is_archived;

    const matchesSearch = c.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    if (!accessToken) return;

    const fetchCampaigns = async () => {
      const res = await fetch(`${API_URL}/campaigns/list`, {
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
    <div className="campaigns-page">
      <Navbar />
      <div className="content">
        <div className="header">
          <h2>Campaigns</h2>
          <Button text="Create Campaign" link="/campaign/new" />
        </div>
        <div className="searchBarWrapper">
          <CampaignSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
        <div className="tabBar">
          <MUIButton
            variant={tab === "active" ? "contained" : "outlined"}
            onClick={() => setTab("active")}
          >
            Active
          </MUIButton>
          <MUIButton
            variant={tab === "completed" ? "contained" : "outlined"}
            onClick={() => setTab("completed")}
          >
            Completed
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
