"use client";

import "./posts_page.scss";

import PostCard from "@/components/cards/PostCard/PostCard";
import Navbar from "@/components/Navbar/Navbar";
import PostSearchBar from "@/components/SearchBars/PostSearchBar/PostSearchBar";
import PostCalendarDisplay from "@/components/calendars/PostCalendarDisplay/PostCalendarDisplay";
import PlatformFilter from "@/components/PlatformFilter/PlatformFilter";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Post } from "@/types/Post";
import { CircularProgress, Button as MUIButton } from "@mui/material";
import { useEffect, useState } from "react";
import { CalendarMonth, ViewList } from "@mui/icons-material";

type Tab = "published" | "scheduled" | "draft";
type ViewMode = "list" | "calendar";

function getPostStatus(post: Post): Tab {
  if (post.is_draft || !post.scheduled_time) return "draft";
  if (new Date(post.scheduled_time) > new Date()) return "scheduled";
  return "published";
}

export default function PostsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { user, accessToken, loading } = useRequireAuth();
  const [tab, setTab] = useState<Tab>("published");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Record<number, string>>({});
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      const [postsRes, campaignsRes] = await Promise.all([
        fetch(`${API_URL}/posts/all`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${API_URL}/campaigns/list`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      const postsData = await postsRes.json();
      const campaignsData = await campaignsRes.json();

      setPosts(postsData);

      const campaignMap: Record<number, string> = {};
      campaignsData.forEach((c: { id: number; name: string }) => {
        campaignMap[c.id] = c.name;
      });
      setCampaigns(campaignMap);
      setPostsLoading(false);
    };

    fetchData();
  }, [accessToken, API_URL]);

  const filteredPosts = posts.filter((post: Post) => {
    const matchesTab = getPostStatus(post) === tab;
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCampaign =
      selectedCampaignId === null || post.campaign_id === selectedCampaignId;
    const matchesPlatform =
      selectedPlatform === null || post.platform.includes(selectedPlatform);
    return matchesTab && matchesSearch && matchesCampaign && matchesPlatform;
  });

  const calendarPosts = posts.filter((post: Post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCampaign =
      selectedCampaignId === null || post.campaign_id === selectedCampaignId;
    const matchesPlatform =
      selectedPlatform === null || post.platform.includes(selectedPlatform);
    return matchesSearch && matchesCampaign && matchesPlatform;
  });

  const tabs: { label: string; value: Tab }[] = [
    { label: "Published", value: "published" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <div className="posts-page">
      <Navbar />
      <div className="posts-page__content">
        <div className="posts-page__toolbar">
          <div className="posts-page__filters">
            <PostSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <select
              className="posts-page__campaign-filter"
              value={selectedCampaignId ?? ""}
              onChange={(e) =>
                setSelectedCampaignId(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            >
              <option value="">All Campaigns</option>
              {Object.entries(campaigns).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            <PlatformFilter
              value={selectedPlatform}
              onChange={setSelectedPlatform}
            />
          </div>

          <div className="posts-page__view-toggle">
            <button
              className={`posts-page__view-btn ${viewMode === "calendar" ? "posts-page__view-btn--active" : ""}`}
              onClick={() => setViewMode("calendar")}
              title="Calendar view"
            >
              <CalendarMonth fontSize="small" />
            </button>
            <button
              className={`posts-page__view-btn ${viewMode === "list" ? "posts-page__view-btn--active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <ViewList fontSize="small" />
            </button>
          </div>
        </div>

        {viewMode === "list" && (
          <div className="posts-page__tabs">
            {tabs.map(({ label, value }) => (
              <MUIButton
                key={value}
                variant={tab === value ? "contained" : "outlined"}
                onClick={() => setTab(value)}
                className={`posts-page__tab ${tab === value ? "posts-page__tab--active" : ""}`}
              >
                {label}
              </MUIButton>
            ))}
          </div>
        )}

        {loading || postsLoading ? (
          <div className="posts-page__loading">
            <CircularProgress />
          </div>
        ) : viewMode === "calendar" ? (
          <PostCalendarDisplay posts={calendarPosts} />
        ) : filteredPosts.length === 0 ? (
          <div className="posts-page__empty">
            <p>No {tab} posts found.</p>
          </div>
        ) : (
          <ul className="posts-page__list">
            {filteredPosts.map((post: Post) => (
              <li key={post.id}>
                <PostCard
                  postData={post}
                  campaignName={campaigns[post.campaign_id]}
                  searchTerm={searchTerm}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
