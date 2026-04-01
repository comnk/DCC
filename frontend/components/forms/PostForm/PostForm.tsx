"use client";

import "./PostForm.scss";

import { useCampaign } from "@/hooks/useCampaign";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/Post";
import { PostPreviewData } from "@/types/PostPreviewData";
import { Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";

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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const previewUrlsRef = useRef<string[]>([]);
  const campaign = useCampaign(campaignId);
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
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

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
    setPreviewUrls(existingPost.media_asset.map((a) => a.file_url));
    onFormChange({
      ...prefilled,
      media_asset: existingPost.media_asset.map((a) => a.file_url),
    });
  }, [existingPost, campaignId, onFormChange]);

  const updateForm = (
    updates: Partial<typeof formData>,
    displayUrls?: string[],
  ) => {
    const next = { ...formData, ...updates };
    setFormData(next);
    onFormChange({
      ...next,
      media_asset: displayUrls ?? previewUrlsRef.current,
    });
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

    if (formData.scheduled_time) {
      if (!campaign) {
        setError("Campaign data not loaded yet, please try again");
        return;
      }

      const scheduled = new Date(formData.scheduled_time);
      const start = new Date(campaign.start_date);
      const end = new Date(campaign.end_date);

      if (scheduled < start || scheduled > end) {
        setError(
          `Scheduled time must be between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}`,
        );
        return;
      }
    }

    const payload = { ...formData, is_draft: isDraft };

    const res = await fetch(`http://localhost:8000/posts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify(payload),
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

        return { path, previewUrl: signedData.signedUrl };
      });

      const results = await Promise.all(uploadPromises);
      const newPaths = results.map((r) => r.path);
      const newPreviews = results.map((r) => r.previewUrl);

      const updatedPreviews = [...previewUrls, ...newPreviews];
      setPreviewUrls(updatedPreviews);

      updateForm(
        { media_asset: [...formData.media_asset, ...newPaths] },
        updatedPreviews,
      );
    } catch (err) {
      setError("Failed to upload images: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="post-form">
      <form className="post-form__form">
        <div className="post-form__field">
          <label className="post-form__label" htmlFor="title">
            Title
          </label>
          <input
            className="post-form__input"
            type="text"
            id="title"
            name="title"
            onChange={(e) => updateForm({ title: e.target.value })}
            value={formData.title}
            required
          />
        </div>

        <div className="post-form__field">
          <label className="post-form__label">Platform</label>
          <div className="post-form__checkboxes">
            {["instagram", "linkedin", "discord"].map((platform) => (
              <label key={platform} className="post-form__checkbox-label">
                <input
                  type="checkbox"
                  name="platform"
                  value={platform}
                  checked={formData.platform.includes(platform)}
                  onChange={handlePlatformChange}
                />
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="post-form__field">
          <label className="post-form__label" htmlFor="caption">
            Caption
          </label>
          <textarea
            className="post-form__textarea"
            id="caption"
            name="caption"
            onChange={(e) => updateForm({ caption: e.target.value })}
            value={formData.caption}
            required
          />
        </div>

        <div className="post-form__field">
          <label className="post-form__label" htmlFor="scheduled_time">
            Scheduled Time
          </label>
          <input
            className="post-form__input"
            type="datetime-local"
            id="scheduled_time"
            name="scheduled_time"
            min={
              campaign
                ? new Date(
                    Math.max(
                      new Date(campaign.start_date).getTime(),
                      new Date().getTime(),
                    ),
                  )
                    .toISOString()
                    .slice(0, 16)
                : new Date().toISOString().slice(0, 16)
            }
            max={
              campaign
                ? new Date(campaign.end_date).toISOString().slice(0, 16)
                : undefined
            }
            onChange={(e) => updateForm({ scheduled_time: e.target.value })}
            value={formData.scheduled_time}
          />
        </div>

        <div className="post-form__field">
          <label className="post-form__label" htmlFor="image">
            Images
          </label>
          <label className="post-form__file-label" htmlFor="image">
            {uploading
              ? "Uploading…"
              : formData.media_asset.length > 0
                ? `${formData.media_asset.length} image(s) uploaded ✓`
                : "Choose files"}
          </label>
          <input
            className="post-form__file-input"
            type="file"
            id="image"
            name="image"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleImageUpload}
          />
        </div>

        <div className="post-form__actions">
          <Button
            type="button"
            variant="outlined"
            onClick={(e) => handleSubmit(e, true)}
            className="post-form__btn-draft"
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={(e) => handleSubmit(e, false)}
            className="post-form__btn-submit"
          >
            Create Post
          </Button>
        </div>
      </form>
      {error && <p className="post-form__error">{error}</p>}
    </div>
  );
}
