"use client";

import "./PostPreviewPanel.scss";

import { PostPreviewData } from "@/types/PostPreviewData";
import { useState } from "react";
import InstagramPreview from "../previews/InstagramPreview/InstagramPreview";
import LinkedInPreview from "../previews/LinkedInPreview/LinkedInPreview";
import DiscordPreview from "../previews/DiscordPreview/DiscordPreview";

type Props = {
  data?: PostPreviewData;
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  discord: "Discord",
};

export default function PostPreviewPanel({ data }: Props) {
  const platforms = data?.platform ?? [];
  const [activeTab, setActiveTab] = useState<string>("");
  const currentTab = platforms.includes(activeTab)
    ? activeTab
    : (platforms[0] ?? "");

  const hasData =
    (data?.caption ?? "") !== "" ||
    (data?.media_asset ?? []).length > 0 ||
    (data?.scheduled_time ?? "") !== "";

  return (
    <div>
      <h2>Post Preview</h2>
      {platforms.length === 0 || !hasData ? (
        <div className="empty">
          <span className="emptyIcon">📋</span>
          <p className="emptyText">
            {platforms.length === 0
              ? "Select a platform to see a preview."
              : "Fill in the form to see a preview."}
          </p>
        </div>
      ) : (
        <>
          <div className="tabBar">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setActiveTab(p)}
                className={`tab ${currentTab === p ? "tabActive" : ""}`}
              >
                {PLATFORM_LABELS[p] ?? p}
              </button>
            ))}
          </div>

          <div className="previewWrap">
            {currentTab === "instagram" && <InstagramPreview data={data!} />}
            {currentTab === "linkedin" && <LinkedInPreview data={data!} />}
            {currentTab === "discord" && <DiscordPreview data={data!} />}
          </div>
        </>
      )}
    </div>
  );
}
