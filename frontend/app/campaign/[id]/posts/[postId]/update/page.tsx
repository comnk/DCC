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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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

      const res = await fetch(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        router.push(`/campaign/${campaignId}/posts`);
        return;
      }

      const data = await res.json();

      const signedAssets = await Promise.all(
        data.media_asset.map(async (a: MediaAsset) => {
          const { data: signed, error } = await supabase.storage
            .from("post-images")
            .createSignedUrl(a.file_url, 3600);
          if (error) console.error("Failed to sign URL for", a.file_url, error);
          return { ...a, file_url: signed?.signedUrl ?? a.file_url };
        }),
      );

      const postWithSignedUrls = { ...data, media_asset: signedAssets };
      setPostData(postWithSignedUrls);
      setPreviewData({
        title: data.title,
        platform: data.platform,
        caption: data.caption,
        media_asset: signedAssets
          .map((a: MediaAsset) => a.file_url)
          .filter((url: string) => url.startsWith("http")),
        scheduled_time: data.scheduled_time,
      });
    };

    fetchPostData();
  }, [postId, campaignId, router]);

  return (
    <div className="updatePostPage">
      <Navbar />
      <h2 className="updatePostTitle">Update Post</h2>
      {postData?.feedback && (
        <div className="feedback-banner">
          <span className="feedback-banner__icon">⚠️</span>
          <div>
            <p className="feedback-banner__label">Feedback from review:</p>
            <p className="feedback-banner__text">
              &quot;{postData.feedback}&quot;
            </p>
          </div>
        </div>
      )}
      <div className="updatePostLayout">
        <div className="formSection">
          <PostForm
            campaignId={campaignId}
            onFormChange={setPreviewData}
            existingPost={postData}
            isUpdate={true}
          />
        </div>
        <div className="previewSection">
          <PostPreviewPanel data={previewData} />
        </div>
      </div>
    </div>
  );
}
