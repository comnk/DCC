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
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const previewUrlsRef = useRef<string[]>([]);

  const onFormChangeRef = useRef(onFormChange);
  useEffect(() => {
    onFormChangeRef.current = onFormChange;
  }, [onFormChange]);

  const campaign = useCampaign(campaignId);
  const campaignRef = useRef(campaign);
  useEffect(() => {
    campaignRef.current = campaign;
  }, [campaign]);

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

    const mediaPaths = existingPost.media_asset?.map((a) => a.file_url) ?? [];
    const mediaSignedUrls =
      existingPost.media_asset?.map((a) => a.signed_url ?? a.file_url) ?? [];
    const prefilled = {
      title: existingPost.title ?? "",
      campaign_id: parseInt(campaignId),
      platform: existingPost.platform ?? [],
      caption: existingPost.caption ?? "",
      media_asset: mediaPaths,
      scheduled_time: existingPost.scheduled_time
        ? existingPost.scheduled_time.slice(0, 16)
        : "",
      is_draft: existingPost.is_draft ?? false,
    };

    setFormData(prefilled);
    setPreviewUrls(mediaSignedUrls);
    onFormChangeRef.current({ ...prefilled, media_asset: mediaSignedUrls });
  }, [existingPost, campaignId]);

  const updateForm = (
    updates: Partial<typeof formData>,
    displayUrls?: string[],
  ) => {
    const next = { ...formData, ...updates };
    setFormData(next);
    onFormChangeRef.current({
      ...next,
      media_asset: displayUrls ?? previewUrlsRef.current,
    });
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent, isDraft = false) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setError("You must be logged in to create a post");
        return;
      }

      if (!isDraft) {
        const validationError = validatePost(formData, campaignRef.current);
        if (validationError) {
          setError(validationError);
          return;
        }
      } else if (!formData.title.trim()) {
        setError("A title is required to save a draft");
        return;
      }

      console.log("Submitting formData:", {
        ...formData,
        scheduled_time: formData.scheduled_time || null,
        is_draft: isDraft,
      });

      if (pendingDeletes.length > 0) {
        await Promise.all(
          pendingDeletes.map((imageUrl) =>
            fetch(
              `${API_URL}/posts/${existingPost?.id}/delete_image?image_url=${encodeURIComponent(imageUrl)}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${data.session.access_token}`,
                },
              },
            ),
          ),
        );
        setPendingDeletes([]);
      }

      const { ok, error } = await submitPost(
        {
          ...formData,
          scheduled_time: formData.scheduled_time || null,
          is_draft: isDraft,
        },
        data.session.access_token,
        existingPost?.id,
      );
      if (!ok) {
        setError(error ?? "Something went wrong");
      } else {
        window.location.href = "/campaign/" + campaignId;
      }
    } finally {
      setSubmitting(false);
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
                : ""
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

        {previewUrls.length > 0 && (
          <div className="post-form__previews">
            {previewUrls.map((url, i) => (
              <div key={url} className="post-form__preview-item">
                <Image
                  src={url}
                  alt={`Upload ${i + 1}`}
                  width={100}
                  height={100}
                />
                <button
                  type="button"
                  className="post-form__preview-delete"
                  onClick={() => handleDeleteImage(i)}
                  disabled={uploading || submitting}
                  aria-label="Remove image"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}

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
      {error && <p className="post-form__error">{error}</p>}
    </div>
  );
}
