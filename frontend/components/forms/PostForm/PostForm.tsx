"use client";

import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/Post";
import { PostPreviewData } from "@/types/PostPreviewData";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";

export default function PostForm({
  campaignId,
  onFormChange,
  existingPost,
}: {
  campaignId: string;
  onFormChange: (data: PostPreviewData) => void;
  existingPost?: Post | null;
}) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    campaign_id: parseInt(campaignId),
    platform: [] as string[],
    caption: "",
    media_asset: [] as string[],
    scheduled_time: "",
    is_draft: false,
  });

  useEffect(() => {
    if (!existingPost) return;

    const prefilled = {
      title: existingPost.title,
      campaign_id: parseInt(campaignId),
      platform: existingPost.platform,
      caption: existingPost.caption,
      media_asset: existingPost.media_asset.map((a) => a.file_url),
      scheduled_time: existingPost.scheduled_time,
      is_draft: existingPost.is_draft,
    };

    setFormData(prefilled);
    onFormChange(prefilled);
  }, [existingPost, campaignId, onFormChange]);

  const updateForm = (updates: Partial<typeof formData>) => {
    const next = { ...formData, ...updates };
    setFormData(next);
    onFormChange(next);
  };

  const handleSubmit = async (
    e: React.BaseSyntheticEvent,
    isDraft: boolean = false,
  ) => {
    e.preventDefault();
    setError("");

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setError("You must be logged in to create a post");
      return;
    }

    if (!isDraft && !formData.scheduled_time) {
      setError("Please set a scheduled time");
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const supabase = createClient();

      const uploadPromises = files.map(async (file) => {
        const ext = file.name.split(".").pop();
        const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data: signedData, error: signedError } = await supabase.storage
          .from("post-images")
          .createSignedUrl(path, 60 * 60);

        if (signedError) throw new Error(signedError.message);

        return signedData.signedUrl;
      });

      const urls = await Promise.all(uploadPromises);
      updateForm({ media_asset: [...formData.media_asset, ...urls] });
    } catch (err) {
      setError("Failed to upload images: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          onChange={(e) => updateForm({ title: e.target.value })}
          value={formData.title}
          required
        />
        <label htmlFor="platform">Platform:</label>
        <div>
          <input
            type="checkbox"
            id="instagram"
            name="platform"
            value="instagram"
            checked={formData.platform.includes("instagram")}
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
            checked={formData.platform.includes("linkedin")}
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
            checked={formData.platform.includes("discord")}
            onChange={handlePlatformChange}
          />
          <label htmlFor="discord">Discord</label>
        </div>
        <label htmlFor="caption">Caption:</label>
        <textarea
          id="caption"
          name="caption"
          onChange={(e) => updateForm({ caption: e.target.value })}
          value={formData.caption}
          required
        ></textarea>

        <label htmlFor="scheduled_time">Scheduled Time:</label>
        <input
          type="datetime-local"
          id="scheduled_time"
          min={new Date().toISOString().slice(0, 16)}
          name="scheduled_time"
          onChange={(e) => updateForm({ scheduled_time: e.target.value })}
          value={formData.scheduled_time}
          required
        />
        <label htmlFor="image">Image:</label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={handleImageUpload}
        />
        {uploading && <p>Uploading images…</p>}
        {formData.media_asset.length > 0 && (
          <p>{formData.media_asset.length} image(s) uploaded ✓</p>
        )}
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={(e) => handleSubmit(e, true)}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={(e) => handleSubmit(e, false)}
          >
            Create Post
          </Button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
