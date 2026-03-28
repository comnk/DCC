"use client";

import { useState } from "react";
import PostForm from "../forms/PostForm/PostForm";
import PostPreviewPanel from "@/components/PostPreviewPanel/PostPreviewPanel";
import { PostPreviewData } from "@/types/PostPreviewData";

export default function NewPostPageClient({
  campaignId,
}: {
  campaignId: string;
}) {
  const [previewData, setPreviewData] = useState<PostPreviewData>({
    title: "",
    platform: [],
    caption: "",
    media_asset: [],
    scheduled_time: "",
  });

  return (
    <div>
      <PostForm campaignId={campaignId} onFormChange={setPreviewData} />
      <PostPreviewPanel data={previewData} />
    </div>
  );
}
