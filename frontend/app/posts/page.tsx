"use client";

import PostCard from "@/components/cards/PostCard/PostCard";
import Navbar from "@/components/Navbar/Navbar";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Post } from "@/types/Post";
import { CircularProgress, Button as MUIButton } from "@mui/material";
import { useEffect, useState } from "react";

export default function PostsPage() {
  const { user, accessToken, loading } = useRequireAuth();
  const [tab, setTab] = useState<"posted" | "draft">("posted");
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

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

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Navbar />
      <h2>All Posts</h2>
      <div>
        <MUIButton
          variant={tab === "posted" ? "contained" : "outlined"}
          onClick={() => setTab("posted")}
        >
          Posted
        </MUIButton>
        <MUIButton
          variant={tab === "draft" ? "contained" : "outlined"}
          onClick={() => setTab("draft")}
        >
          Draft
        </MUIButton>
      </div>
      <ul>
        {postsLoading ? (
          <CircularProgress />
        ) : (
          <ul>
            {posts.map((post: Post) => (
              <PostCard key={post.id} postData={post} />
            ))}
          </ul>
        )}
      </ul>
    </div>
  );
}
