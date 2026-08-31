"use client";

import "./PostForm.scss";

import { useCampaign } from "@/hooks/useCampaign";
import { uploadPostImages } from "@/lib/posts/uploadPostImages";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/Post";
import { PostPreviewData } from "@/types/PostPreviewData";
import { Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import DiscordFields from "./DiscordFields";
import ImageUploader from "./ImageUploader";
import { usePostFormSubmit } from "./usePostFormSubmit";

export type PostFormData = {
  title: string;
  campaign_id: number;
  platform: string[];
  caption: string;
  media_asset: string[];
  scheduled_time: string;
  is_draft: boolean;
  discord_location: string;
  discord_event_start: string;
  discord_event_end: string;
  instagram_post_type: "post" | "story";
};

export default function PostForm({
  campaignId,
  onFormChange,
  existingPost,
  isUpdate = false,
}: {
  campaignId: string;
  onFormChange: (data: PostPreviewData) => void;
  existingPost?: Post | null;
  isUpdate?: boolean;
}) {
  const [imageError, setImageError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const previewUrlsRef = useRef<string[]>([]);

  const onFormChangeRef = useRef(onFormChange);
  useEffect(() => {
    onFormChangeRef.current = onFormChange;
  }, [onFormChange]);

  const campaign = useCampaign(campaignId);

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    campaign_id: parseInt(campaignId),
    platform: [],
    caption: "",
    media_asset: [],
    scheduled_time: "",
    is_draft: false,
    discord_location: "Online",
    discord_event_start: "",
    discord_event_end: "",
    instagram_post_type: "post",
  });

  const { submitting, error, handleSubmit } = usePostFormSubmit({
    campaignId,
    existingPost,
    formData,
    pendingDeletes,
    campaign,
    onDeletesFlushed: () => setPendingDeletes([]),
  });

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    if (!existingPost) return;

    const mediaPaths = existingPost.media_asset?.map((a) => a.file_url) ?? [];
    const mediaSignedUrls =
      existingPost.media_asset?.map((a) => a.signed_url ?? a.file_url) ?? [];
    const prefilled: PostFormData = {
      title: existingPost.title ?? "",
      campaign_id: parseInt(campaignId),
      platform: existingPost.platform ?? [],
      caption: existingPost.caption ?? "",
      media_asset: mediaPaths,
      scheduled_time: existingPost.scheduled_time
        ? existingPost.scheduled_time.slice(0, 16)
        : "",
      is_draft: existingPost.is_draft ?? false,

      discord_location: existingPost.discord_location ?? "Online",

      discord_event_start: existingPost.discord_event_start
        ? existingPost.discord_event_start.slice(0, 16)
        : "",

      discord_event_end: existingPost.discord_event_end
        ? existingPost.discord_event_end.slice(0, 16)
        : "",

      instagram_post_type: existingPost.instagram_post_type ?? "post",
    };

    setFormData(prefilled);
    setPreviewUrls(mediaSignedUrls);
    onFormChangeRef.current({ ...prefilled, media_asset: mediaSignedUrls });
  }, [existingPost, campaignId]);

  const updateForm = (
    updates: Partial<PostFormData>,
    displayUrls?: string[],
  ) => {
    const next = { ...formData, ...updates };
    setFormData(next);
    onFormChangeRef.current({
      ...next,
      media_asset: displayUrls ?? previewUrlsRef.current,
    });
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
    setImageError("");

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
      setImageError("Failed to upload images: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    let imageToDelete = formData.media_asset[index];

    if (imageToDelete.includes("/object/sign/post-images/")) {
      imageToDelete = imageToDelete
        .split("/object/sign/post-images/")[1]
        .split("?")[0];
    }

    if (existingPost) {
      setPendingDeletes((prev) => [...prev, imageToDelete]);
    }

    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    const updatedAssets = formData.media_asset.filter((_, i) => i !== index);
    setPreviewUrls(updatedPreviews);
    updateForm({ media_asset: updatedAssets }, updatedPreviews);
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
          />
        </div>

        {formData.platform.includes("instagram") && (
          <div className="post-form__field">
            <label className="post-form__label">Instagram Post Type</label>
            <div className="post-form__checkboxes">
              {(["post", "story"] as const).map((type) => (
                <label key={type} className="post-form__checkbox-label">
                  <input
                    type="radio"
                    name="instagram_post_type"
                    value={type}
                    checked={formData.instagram_post_type === type}
                    onChange={() => updateForm({ instagram_post_type: type })}
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
            </div>
          </div>
        )}

        {formData.platform.includes("discord") && (
          <DiscordFields
            value={{
              discord_location: formData.discord_location,
              discord_event_start: formData.discord_event_start,
              discord_event_end: formData.discord_event_end,
            }}
            onChange={updateForm}
          />
        )}

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
                      new Date(campaign.start_date + "T00:00:00").getTime(),
                      new Date().getTime(),
                    ),
                  )
                    .toISOString()
                    .slice(0, 16)
                : new Date().toISOString().slice(0, 16)
            }
            max={
              campaign
                ? new Date(campaign.end_date + "T23:59:59")
                    .toISOString()
                    .slice(0, 16)
                : ""
            }
            onChange={(e) => updateForm({ scheduled_time: e.target.value })}
            value={formData.scheduled_time}
          />
        </div>

        <ImageUploader
          previewUrls={previewUrls}
          mediaCount={formData.media_asset.length}
          uploading={uploading}
          submitting={submitting}
          onUpload={handleImageUpload}
          onDeleteImage={handleDeleteImage}
        />

        <div className="post-form__actions">
          <Button
            type="button"
            variant="outlined"
            onClick={(e) => handleSubmit(e, true)}
            disabled={submitting}
            className="post-form__btn-draft"
          >
            {submitting ? "Saving…" : "Save as Draft"}
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={(e) => handleSubmit(e, false)}
            disabled={submitting}
            className="post-form__btn-submit"
          >
            {submitting
              ? "Submitting…"
              : isUpdate
                ? "Update Post"
                : "Create Post"}
          </Button>
        </div>
      </form>
      {(error || imageError) && (
        <p className="post-form__error">{error || imageError}</p>
      )}
    </div>
  );
}
