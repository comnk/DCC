"use client";

import PostCard from "@/components/cards/PostCard/PostCard";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Post } from "@/types/Post";
import { CircularProgress, Button as MUIButton } from "@mui/material";
import { useEffect, useState } from "react";

type Tab = "published" | "scheduled" | "draft";

function getPostStatus(post: Post): Tab {
  if (post.is_draft) return "draft";
  if (post.scheduled_time && new Date(post.scheduled_time) > new Date())
    return "scheduled";
  return "published";
}

export default function PostsPage() {
  const { user, accessToken, loading } = useRequireAuth();
  const [tab, setTab] = useState<Tab>("published");
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!accessToken) return;

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
    <div>
      <Navbar />
      <h2>All Posts</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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
      {loading || postsLoading ? (
        <CircularProgress />
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredPosts.map((post: Post) => (
            <li key={post.id}>
              <PostCard postData={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
