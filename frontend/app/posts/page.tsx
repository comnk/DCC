"use client";

import "./posts_page.scss";

import PostCard from "@/components/cards/PostCard/PostCard";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Post } from "@/types/Post";
import { CircularProgress, Button as MUIButton } from "@mui/material";
import { useEffect, useState } from "react";

type Tab = "published" | "scheduled" | "draft";

function getPostStatus(post: Post): Tab {
  if (post.is_draft || !post.scheduled_time) return "draft";
  if (new Date(post.scheduled_time) > new Date()) return "scheduled";
  return "published";
}

export default function PostsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { user, accessToken, loading } = useRequireAuth();
  const [tab, setTab] = useState<Tab>("published");
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchPosts = async () => {
      const res = await fetch(`${API_URL}/posts/all`, {
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

    fetchPosts();
  }, [accessToken]);

  const filteredPosts = posts.filter(
    (post: Post) => getPostStatus(post) === tab,
  );

  const tabs: { label: string; value: Tab }[] = [
    { label: "Published", value: "published" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <div className="posts-page">
      <Navbar />
      <div className="posts-page__content">
        <h1 className="posts-page__title">All Posts</h1>

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

        {loading || postsLoading ? (
          <div className="posts-page__loading">
            <CircularProgress />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="posts-page__empty">
            <p>No {tab} posts found.</p>
          </div>
        ) : (
          <ul className="posts-page__list">
            {filteredPosts.map((post: Post) => (
              <li key={post.id}>
                <PostCard postData={post} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
