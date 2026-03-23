"use client";

import { useState } from "react";
import NewPostForm from "../forms/NewPostForm/NewPostForm";
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
    photo_url: "",
    scheduled_time: "",
  });

  return (
    <div>
      <NewPostForm campaignId={campaignId} onFormChange={setPreviewData} />
      <PostPreviewPanel data={previewData} />
    </div>
  );
}
