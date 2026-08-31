"use client";

import "./posts_page.scss";

import PostCard from "@/components/cards/PostCard/PostCard";
import Navbar from "@/components/Navbar/Navbar";
import PostSearchBar from "@/components/SearchBars/PostSearchBar/PostSearchBar";
import PostCalendarDisplay from "@/components/calendars/PostCalendarDisplay/PostCalendarDisplay";
import PlatformFilter from "@/components/PlatformFilter/PlatformFilter";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiRequest } from "@/lib/api/client";
import { Post } from "@/types/Post";
import { Campaign } from "@/types/Campaign";
import { CircularProgress, Button as MUIButton } from "@mui/material";
import { useEffect, useState } from "react";
import { CalendarMonth, ViewList } from "@mui/icons-material";
import { getPostStatus } from "@/utils/getPostStatus";
import { useRouter } from "next/navigation";

type Tab = "published" | "scheduled" | "draft";
type ViewMode = "list" | "calendar";

export default function PostsPage() {
  const { accessToken, loading } = useRequireAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("published");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Record<number, string>>({});
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [showCampaignPicker, setShowCampaignPicker] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      const [postsData, campaignsData] = await Promise.all([
        apiRequest<Post[]>("/posts/all", accessToken),
        apiRequest<Campaign[]>("/campaigns/list", accessToken),
      ]);

      setPosts(postsData);
      setCampaignList(campaignsData);

      const campaignMap: Record<number, string> = {};
      campaignsData.forEach((c) => {
        campaignMap[c.id] = c.name;
      });
      setCampaigns(campaignMap);
      setPostsLoading(false);
    };

    fetchData();
  }, [accessToken]);

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

  const activeCampaigns = campaignList.filter(
    (c) => !c.is_archived && c.end_date > new Date().toISOString(),
  );

  return (
    <div className="posts-page">
      <Navbar />
      <div className="posts-page__content">
        {/* ── Toolbar ── */}
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

          <div className="posts-page__toolbar-right">
            <button
              className="posts-page__create-btn"
              onClick={() => setShowCampaignPicker(true)}
            >
              + Create Post
            </button>
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
        </div>

        {viewMode === "list" && (
          <div className="posts-page__tabs">
            {tabs.map(({ label, value }) => (
              <MUIButton
                key={value}
                variant={tab === value ? "contained" : "outlined"}
                onClick={() => setTab(value)}
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

      {showCampaignPicker && (
        <div
          className="campaign-picker-overlay"
          onClick={() => setShowCampaignPicker(false)}
        >
          <div className="campaign-picker" onClick={(e) => e.stopPropagation()}>
            <h3 className="campaign-picker__title">Select a Campaign</h3>
            {activeCampaigns.length === 0 ? (
              <p className="campaign-picker__empty">
                No active campaigns. Create one first.
              </p>
            ) : (
              <ul className="campaign-picker__list">
                {activeCampaigns.map((c) => (
                  <li key={c.id}>
                    <button
                      className="campaign-picker__item"
                      onClick={() => {
                        setShowCampaignPicker(false);
                        router.push(`/campaign/${c.id}/posts/new`);
                      }}
                    >
                      <span className="campaign-picker__name">{c.name}</span>
                      <span className="campaign-picker__dates">
                        {new Date(
                          c.start_date + "T00:00:00",
                        ).toLocaleDateString()}{" "}
                        —{" "}
                        {new Date(
                          c.end_date + "T00:00:00",
                        ).toLocaleDateString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="campaign-picker__cancel"
              onClick={() => setShowCampaignPicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
