"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function NewPostForm({ campaignId }: { campaignId: string }) {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scheduled_time: "",
    campaignId: campaignId,
  });

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError("");

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setError("You must be logged in to create a post");
      return;
    }

    const res = await fetch(`http://localhost:8000/posts/create`, {
      method: "POST",
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
      window.location.href = "/campaign/" + campaignId;
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          name="content"
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          required
        ></textarea>

        <label htmlFor="scheduled_time">Scheduled Time:</label>
        <input
          type="datetime-local"
          id="scheduled_time"
          min={new Date().toISOString().slice(0, 16)}
          name="scheduled_time"
          onChange={(e) =>
            setFormData({ ...formData, scheduled_time: e.target.value })
          }
          required
        />
        <button type="submit">Create Post</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
