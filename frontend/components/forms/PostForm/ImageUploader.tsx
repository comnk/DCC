"use client";

import Image from "next/image";

export default function ImageUploader({
  previewUrls,
  mediaCount,
  uploading,
  submitting,
  onUpload,
  onDeleteImage,
}: {
  previewUrls: string[];
  mediaCount: number;
  uploading: boolean;
  submitting: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: (index: number) => void;
}) {
  return (
    <>
      <div className="post-form__field">
        <label className="post-form__label" htmlFor="image">
          Images
        </label>
        <label className="post-form__file-label" htmlFor="image">
          {uploading
            ? "Uploading…"
            : mediaCount > 0
              ? `${mediaCount} file(s) uploaded ✓`
              : "Choose files"}
        </label>
        <input
          className="post-form__file-input"
          type="file"
          id="image"
          name="image"
          accept="image/*,video/*"
          multiple
          disabled={uploading}
          onChange={onUpload}
        />
      </div>

      {previewUrls.map((url, i) => (
        <div key={url} className="post-form__preview-item">
          {url.match(/\.(mp4|mov|webm)(\?|$)/i) ? (
            <video src={url} width={100} height={100} controls muted />
          ) : (
            <Image src={url} alt={`Upload ${i + 1}`} width={100} height={100} />
          )}
          <button
            type="button"
            className="post-form__preview-delete"
            onClick={() => onDeleteImage(i)}
            disabled={uploading || submitting}
            aria-label="Remove image"
          >
            X
          </button>
        </div>
      ))}
    </>
  );
}
