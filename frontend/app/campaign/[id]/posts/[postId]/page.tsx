"use client";

import "./post_page.scss";

import Navbar from "@/components/Navbar/Navbar";
import DeletePostButton from "@/components/buttons/DeletePostButton/DeletePostButton";
import PostPreviewPanel from "@/components/PostPreviewPanel/PostPreviewPanel";
import { PostStatusBadge } from "@/components/icons/PostStatusBadge/PostStatusBadge";
import { createClient } from "@/lib/supabase/client";
import { MediaAsset } from "@/types/MediaAsset";
import { Post } from "@/types/Post";
import { PostPreviewData } from "@/types/PostPreviewData";
import { CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/buttons/Button/Button";

export default function PostPage() {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PostPreviewData>({
    title: "",
    platform: [],
    caption: "",
    media_asset: [],
    scheduled_time: "",
  });
  const [cancelPending, setCancelPending] = useState(false);
  const [cancelTimeoutId, setCancelTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

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
      setCurrentUserId(session.user.id);
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
    setCancelPending(true);

    const timeoutId = setTimeout(async () => {
      setCancelPending(false);
      setCancelTimeoutId(null);

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
    }, 4000);

    setCancelTimeoutId(timeoutId);
  };

  const handleUndoCancel = () => {
    if (cancelTimeoutId) {
      clearTimeout(cancelTimeoutId);
      setCancelTimeoutId(null);
    }
    setCancelPending(false);
  };

  if (loading)
    return (
      <div className="post-page__loading">
        <CircularProgress />
      </div>
    );

  const isAuthor = currentUserId === postData?.author_id;

  return (
    <div className="post-page">
      <Navbar />
      <div className="post-page__content">
        <div className="post-page__header">
          <div className="post-page__title-row">
            <h1 className="post-page__title">Post Details</h1>
            {postData && <PostStatusBadge post={postData} />}
          </div>

          <div className="post-page__actions">
            {postData?.post_status !== "posted" && isAuthor && (
              <>
                <Button
                  text="Update Post"
                  link={`/campaign/${id}/posts/${postData?.id}/update`}
                />

                {postData?.scheduled_time ? (
                  <Button
                    text="Cancel Post"
                    link="#"
                    onClick={handleCancelPost}
                  />
                ) : null}

                <DeletePostButton postId={postData?.id} campaignId={id} />
              </>
            )}
          </div>
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
              {postData?.feedback && (
                <div className="post-overview__field">
                  <span className="post-overview__label">Feedback</span>
                  <span className="post-overview__value post-overview__value--feedback">
                    {postData.feedback}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="post-preview-section">
            <PostPreviewPanel data={previewData} />
          </section>
        </div>
        {cancelPending && (
          <div className="cancel-toast">
            <span>Post will be cancelled...</span>
            <button className="cancel-toast__undo" onClick={handleUndoCancel}>
              Undo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
