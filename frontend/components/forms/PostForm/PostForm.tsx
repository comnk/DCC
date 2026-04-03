"use client";

import "./PostForm.scss";

import { useCampaign } from "@/hooks/useCampaign";
import { submitPost } from "@/lib/posts/submitPost";
import { uploadPostImages } from "@/lib/posts/uploadPostImages";
import { validatePost } from "@/lib/posts/validatePost";
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

  const handleSubmit = async (e: React.BaseSyntheticEvent, isDraft = false) => {
    e.preventDefault();
    setError("");

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setError("You must be logged in to create a post");
      return;
    }

    if (!isDraft) {
      const validationError = validatePost(formData, campaign);
      if (validationError) {
        setError(validationError);
        return;
      }
    } else if (!formData.title.trim()) {
      setError("A title is required to save a draft");
      return;
    }

    const { ok, error } = await submitPost(
      { ...formData, is_draft: isDraft },
      data.session.access_token,
    );
    if (!ok) {
      setError(error ?? "Something went wrong");
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
      const { paths, previewUrls: newPreviews } = await uploadPostImages(
        files,
        supabase,
      );
      const updatedPreviews = [...previewUrls, ...newPreviews];
      setPreviewUrls(updatedPreviews);
      updateForm(
        { media_asset: [...formData.media_asset, ...paths] },
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
