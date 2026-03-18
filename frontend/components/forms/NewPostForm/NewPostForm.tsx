"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function NewPostForm({ campaignId }: { campaignId: string }) {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    campaign_id: parseInt(campaignId),
    platform: [] as string[],
    caption: "",
    scheduled_time: "",
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

      if (Array.isArray(errorData.detail)) {
        setError(
          errorData.detail.map((e: { msg: string }) => e.msg).join(", "),
        );
      } else {
        setError(errorData.detail ?? "Something went wrong");
      }
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
        <label htmlFor="platform">Platform:</label>
        <div>
          <input
            type="checkbox"
            id="instagram"
            name="platform"
            value="instagram"
            onChange={(e) => {
              if (e.target.checked) {
                setFormData({
                  ...formData,
                  platform: [...formData.platform, e.target.value],
                });
              } else {
                setFormData({
                  ...formData,
                  platform: formData.platform.filter(
                    (v) => v !== e.target.value,
                  ),
                });
              }
            }}
          />
          <label htmlFor="instagram">Instagram</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="linkedin"
            name="platform"
            value="linkedin"
            onChange={(e) => {
              if (e.target.checked) {
                setFormData({
                  ...formData,
                  platform: [...formData.platform, e.target.value],
                });
              } else {
                setFormData({
                  ...formData,
                  platform: formData.platform.filter(
                    (v) => v !== e.target.value,
                  ),
                });
              }
            }}
          />
          <label htmlFor="linkedin">LinkedIn</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="discord"
            name="platform"
            value="discord"
            onChange={(e) => {
              if (e.target.checked) {
                setFormData({
                  ...formData,
                  platform: [...formData.platform, e.target.value],
                });
              } else {
                setFormData({
                  ...formData,
                  platform: formData.platform.filter(
                    (v) => v !== e.target.value,
                  ),
                });
              }
            }}
          />
          <label htmlFor="discord">Discord</label>
        </div>
        <label htmlFor="caption">Caption:</label>
        <textarea
          id="caption"
          name="caption"
          onChange={(e) =>
            setFormData({ ...formData, caption: e.target.value })
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
