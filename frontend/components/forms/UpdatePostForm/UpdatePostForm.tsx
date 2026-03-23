"use client";

import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/Post";
import { Button } from "@mui/material";
import { useState } from "react";

export default function UpdatePostForm({
  id,
  postId,
  postData,
}: {
  id: string;
  postId: string;
  postData: Post;
}) {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    campaign_id: parseInt(id),
    title: postData.title,
    caption: postData.caption,
    platform: postData.platform,
    scheduled_time: postData.scheduled_time
      ? postData.scheduled_time.slice(0, 16)
      : "",
  });

  const handleUpdatePost = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError("");

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setError("You must be logged in to update a campaign");
      return;
    }

    const res = await fetch(`http://localhost:8000/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.detail ?? "Something went wrong");
    } else {
      window.location.href = `/campaign/${id}/posts/${postId}`;
    }
  };

  return (
    <div>
      <form onSubmit={handleUpdatePost}>
        <input
          type="text"
          placeholder="Post Title"
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          value={formData.title}
          required
        />
        <textarea
          placeholder="Post Caption"
          onChange={(e) =>
            setFormData({ ...formData, caption: e.target.value })
          }
          value={formData.caption}
          required
        />
        <input
          type="datetime-local"
          id="scheduled_time"
          name="scheduled_time"
          onChange={(e) =>
            setFormData({ ...formData, scheduled_time: e.target.value })
          }
          value={postData.scheduled_time.slice(0, 16)}
          required
        />
        <Button variant="contained" color="primary" type="submit">
          Update Post
        </Button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
