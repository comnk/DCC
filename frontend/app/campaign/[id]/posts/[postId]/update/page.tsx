"use client";

import "./update_post.scss";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostPreviewPanel from "@/components/PostPreviewPanel/PostPreviewPanel";
import { PostPreviewData } from "@/types/PostPreviewData";
import PostForm from "@/components/forms/PostForm/PostForm";
import { Post } from "@/types/Post";
import { createClient } from "@/lib/supabase/client";
import { MediaAsset } from "@/types/MediaAsset";
import Navbar from "@/components/Navbar/Navbar";

export default function UpdatePostPage() {
  const { id: campaignId, postId } = useParams<{
    id: string;
    postId: string;
  }>();
  const router = useRouter();
  const [postData, setPostData] = useState<Post | null>(null);
  const [previewData, setPreviewData] = useState<PostPreviewData>({
    title: "",
    platform: [],
    caption: "",
    media_asset: [],
    scheduled_time: "",
  });

  useEffect(() => {
    const fetchPostData = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const res = await fetch(`http://localhost:8000/posts/${postId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        router.push(`/campaign/${campaignId}/posts`);
        return;
      }

      const data = await res.json();
      setPostData(data);
      setPreviewData({
        title: data.title,
        platform: data.platform,
        caption: data.caption,
        media_asset: data.media_asset.map((a: MediaAsset) => a.file_url),
        scheduled_time: data.scheduled_time,
      });
    };

    fetchPostData();
  }, [postId, campaignId, router]);

  return (
    <div className="updatePostPage">
      <Navbar />
      <h2 className="updatePostTitle">Update Post</h2>
      <div className="updatePostLayout">
        <div className="formSection">
          <PostForm
            campaignId={campaignId}
            onFormChange={setPreviewData}
            existingPost={postData}
          />
        </div>
        <div className="previewSection">
          <PostPreviewPanel data={previewData} />
        </div>
      </div>
    </div>
  );
}
