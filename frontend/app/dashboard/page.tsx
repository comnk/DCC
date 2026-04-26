"use client";

import "./dashboard_page.scss";

import CampaignCard from "@/components/cards/CampaignCard/CampaignCard";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Campaign } from "@/types/Campaign";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Post } from "@/types/Post";
import PostCard from "@/components/cards/PostCard/PostCard";
import Button from "@/components/buttons/Button/Button";

export default function DashboardPage() {
  const { user, accessToken, loading } = useRequireAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      const [campaignsRes, postsRes] = await Promise.all([
        fetch(`${API_URL}/campaigns/list`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${API_URL}/posts/all`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      const campaignsData = await campaignsRes.json();
      const postsData = await postsRes.json();

      setCampaigns(campaignsData);
      setPosts(postsData);
      setCampaignsLoading(false);
      setPostsLoading(false);
    };

    fetchData();
  }, [accessToken, API_URL]);

  const campaignMap: Record<string, string> = {};
  campaigns.forEach((c) => {
    campaignMap[c.id] = c.name;
  });

  const filteredCampaigns = campaigns.filter(
    (c) => !c.is_archived && c.end_date > new Date().toISOString(),
  );

  const filteredPosts =
    posts.length > 0
      ? posts.filter(
          (p) =>
            !p.is_draft &&
            p.scheduled_time &&
            new Date(p.scheduled_time) > new Date(),
        )
      : [];

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-page__content">
        <h1 className="dashboard-page__welcome">Welcome back!</h1>

        <div className="dashboard-page__sections">
          <section className="dashboard-section">
            <h2 className="dashboard-section__title">Current Campaigns</h2>
            <ul className="dashboard-section__list">
              {loading || campaignsLoading ? (
                <CircularProgress />
              ) : filteredCampaigns.length === 0 ? (
                <div className="dashboard-section__empty">
                  <p>No active campaigns. Create a campaign to get started!</p>
                  <Button text="Create Campaign" link="/campaign/new" />
                </div>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaignData={campaign} />
                ))
              )}
            </ul>
            <Button text="View All Campaigns" link="/campaign" />
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section__title">Upcoming Posts</h2>
            <ul className="dashboard-section__list">
              {loading || postsLoading ? (
                <CircularProgress />
              ) : filteredPosts.length === 0 ? (
                <div className="dashboard-section__empty">
                  <p>
                    No posts scheduled. Go in a campaign to create a new post!
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    postData={post}
                    campaignName={campaignMap[post.campaign_id]}
                    searchTerm=""
                  />
                ))
              )}
              <Button text="View All Posts" link="/posts" />
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
