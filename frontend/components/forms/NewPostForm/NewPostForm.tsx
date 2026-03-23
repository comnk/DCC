"use client";

import { createClient } from "@/lib/supabase/client";
import { PostPreviewData } from "@/types/PostPreviewData";
import { Button } from "@mui/material";
import { useState } from "react";

export default function NewPostForm({
  campaignId,
  onFormChange,
}: {
  campaignId: string;
  onFormChange: (data: PostPreviewData) => void;
}) {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    campaign_id: parseInt(campaignId),
    platform: [] as string[],
    caption: "",
    photo_url: "",
    scheduled_time: "",
  });

  const updateForm = (updates: Partial<typeof formData>) => {
    const next = { ...formData, ...updates };
    setFormData(next);
    onFormChange(next);
  };

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

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked
      ? [...formData.platform, e.target.value]
      : formData.platform.filter((v) => v !== e.target.value);
    updateForm({ platform: next });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          onChange={(e) => updateForm({ title: e.target.value })}
          required
        />
        <label htmlFor="platform">Platform:</label>
        <div>
          <input
            type="checkbox"
            id="instagram"
            name="platform"
            value="instagram"
            onChange={handlePlatformChange}
          />
          <label htmlFor="instagram">Instagram</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="linkedin"
            name="platform"
            value="linkedin"
            onChange={handlePlatformChange}
          />
          <label htmlFor="linkedin">LinkedIn</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="discord"
            name="platform"
            value="discord"
            onChange={handlePlatformChange}
          />
          <label htmlFor="discord">Discord</label>
        </div>
        <label htmlFor="caption">Caption:</label>
        <textarea
          id="caption"
          name="caption"
          onChange={(e) => updateForm({ caption: e.target.value })}
          required
        ></textarea>

        <label htmlFor="scheduled_time">Scheduled Time:</label>
        <input
          type="datetime-local"
          id="scheduled_time"
          min={new Date().toISOString().slice(0, 16)}
          name="scheduled_time"
          onChange={(e) => updateForm({ scheduled_time: e.target.value })}
          required
        />
        <label htmlFor="image">Image:</label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              updateForm({ photo_url: reader.result as string });
            };
            reader.readAsDataURL(file);
          }}
        />
        <Button variant="contained" color="primary" type="submit">
          Create Post
        </Button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
