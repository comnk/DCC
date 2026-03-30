"use client";

import CampaignCard from "@/components/cards/CampaignCard/CampaignCard";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Campaign } from "@/types/Campaign";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Post } from "@/types/Post";
import PostCard from "@/components/cards/PostCard/PostCard";

export default function DashboardPage() {
  const { user, accessToken, loading } = useRequireAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

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

    const fetchPosts = async () => {
      const res = await fetch(`http://localhost:8000/posts/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      setPosts(data);
      setPostsLoading(false);
    };

    fetchCampaigns();
    fetchPosts();
  }, [accessToken]);

  const filteredCampaigns = campaigns.filter(
    (c) => !c.is_archived && c.end_date > new Date().toISOString(),
  );

  const filteredPosts = posts.filter(
    (p) =>
      !p.is_draft &&
      p.scheduled_time &&
      new Date(p.scheduled_time) > new Date(),
  );

  return (
    <>
      <Navbar />
      <h2>Welcome back!</h2>
      <div>
        <h2>Current Campaigns</h2>
        <ul>
          {loading || campaignsLoading ? (
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
      <div>
        <h2>Upcoming Posts</h2>
        <ul>
          {loading || postsLoading ? (
            <CircularProgress />
          ) : (
            <ul>
              {filteredPosts.map((post) => (
                <PostCard key={post.id} postData={post} />
              ))}
            </ul>
          )}
        </ul>
      </div>
    </>
  );
}
