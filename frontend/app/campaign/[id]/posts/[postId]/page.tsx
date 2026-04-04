"use client";

import DeletePostButton from "@/components/buttons/DeletePostButton/DeletePostButton";
import "./post_page.scss";

import Navbar from "@/components/Navbar/Navbar";
import PostPreviewPanel from "@/components/PostPreviewPanel/PostPreviewPanel";
import { createClient } from "@/lib/supabase/client";
import { MediaAsset } from "@/types/MediaAsset";
import { Post } from "@/types/Post";
import { PostPreviewData } from "@/types/PostPreviewData";
import { Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostPage() {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState<Post | null>(null);
  const [previewData, setPreviewData] = useState<PostPreviewData>({
    title: "",
    platform: [],
    caption: "",
    media_asset: [],
    scheduled_time: "",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchPost = async () => {
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
        router.push(`/campaign/${id}/posts`);
        return;
      }

      const data = await res.json();
      setPostData(data);

      const signedUrls = await Promise.all(
        data.media_asset.map(async (a: MediaAsset) => {
          const { data: signed, error } = await supabase.storage
            .from("post-images")
            .createSignedUrl(a.file_url, 3600);
          if (error) console.error("Failed to sign URL for", a.file_url, error);
          return signed?.signedUrl ?? null;
        }),
      );

      setPreviewData({
        title: data.title,
        platform: data.platform,
        caption: data.caption,
        media_asset: signedUrls.filter(Boolean) as string[],
        scheduled_time: data.scheduled_time,
      });
      setLoading(false);
    };

    fetchPost();
  }, [postId, router, id]);

  const handleCancelPost = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const res = await fetch(`${API_URL}/posts/${postId}/cancel_post`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      const updatedPost = await res.json();
      setPostData(updatedPost);
      setPreviewData((prev) => ({
        ...prev,
        scheduled_time: updatedPost.scheduled_time,
      }));
    } else {
      console.error("Failed to cancel post");
    }
  };

  if (loading)
    return (
      <div className="post-page__loading">
        <CircularProgress />
      </div>
    );

  return (
    <div className="post-page">
      <Navbar />
      <div className="post-page__content">
        <div className="post-page__header">
          <h1 className="post-page__title">Post Details</h1>

          {postData?.post_status !== "posted" && (
            <>
              <Button
                variant="contained"
                component={Link}
                href={`/campaign/${id}/posts/${postData?.id}/update`}
                className="post-page__btn"
              >
                Update Post
              </Button>

              {postData?.scheduled_time ? (
                <Button
                  variant="contained"
                  className="post-page__btn"
                  onClick={handleCancelPost}
                >
                  Cancel Post
                </Button>
              ) : null}

              <DeletePostButton postId={postData?.id} campaignId={id} />
            </>
          )}

          {postData?.post_status === "posted" && (
            <span className="post-page__posted-badge">Already Posted</span>
          )}
        </div>

        <div className="post-page__body">
          <section className="post-overview">
            <h2 className="post-overview__title">Overview</h2>
            <div className="post-overview__fields">
              <div className="post-overview__field">
                <span className="post-overview__label">Title</span>
                <span className="post-overview__value">{postData?.title}</span>
              </div>
              <div className="post-overview__field">
                <span className="post-overview__label">Caption</span>
                <span className="post-overview__value">
                  {postData?.caption}
                </span>
              </div>
              <div className="post-overview__field">
                <span className="post-overview__label">Scheduled</span>
                <span className="post-overview__value">
                  {postData?.scheduled_time
                    ? new Date(postData.scheduled_time).toLocaleString("en-US")
                    : "—"}
                </span>
              </div>
              <div className="post-overview__field">
                <span className="post-overview__label">Platforms</span>
                <span className="post-overview__value">
                  {postData?.platform.map((p) => (
                    <span key={p} className="post-overview__platform-tag">
                      {p}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </section>

          <section className="post-preview-section">
            <PostPreviewPanel data={previewData} />
          </section>
        </div>
      </div>
    </div>
  );
}
